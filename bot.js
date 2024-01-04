//library for working with tg-bot-api
import TelegramBot from "node-telegram-bot-api";
//library for data base
import { MongoClient } from "mongodb";
//library to read enviromental variables
import dotenv from "dotenv";
//library to make schedule for updating csvs for R model
import cron from "node-cron";
//object with methods to write nessasary csvs
import CSVWriter from "./service/csvWriter.js";
// constants with messages for tg-bot
import messages from "./bot-src/messages.js";
// constants with keyboards for tg-bot
import keyboards from "./bot-src/keyboards.js";
//function that will return predict from R model
import getPredict from "./index.js";
//configuration of .env
dotenv.config();

// -------------ENV CONSTANTS-------------
const token = process.env.TELEGRAMM_TOKEN;
const mongoLink = process.env.MONGO_LINK;

// -------------SIMLPE CONSTANTS-------------
const cryptos = ["ETHUSD", "MATICUSD", "XLMUSD", "DASHUSD", "LTCUSD"];
//RegExp to work with user string
const formatRegex =
  /^-?\d+(\.\d+)?\/-?\d+(\.\d+)?\/-?\d+(\.\d+)?\/-?\d+(\.\d+)?$/;

//-------------CLASS INSTANCES-------------
//creating classes instances for tg-bot and DB client
const bot = new TelegramBot(token, { polling: true });
const client = new MongoClient(mongoLink, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  writeConcern: { w: "majority", wtimeout: 10000 },
});

//-------------FUNCTIONS-------------
//timeout for async functions
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
//rewriting csv for all avalible coins
const updateCryptoData = async (arr) => {
  for (const element of arr) {
    await CSVWriter.writeDataToCSV(element);
    //adding timeout because of API features
    await sleep(60000);
  }
};
//connecting to DB
async function connectToMongo() {
  try {
    await client.connect();
    console.log("Connection established");
  } catch (e) {
    console.log(e);
  }
}

//-------------BOT-------------
//wrapping all nessasary code for bot into a function for easier start
const start = async () => {
  await connectToMongo();
  //schedule the updating csv data for model
  cron.schedule("0 * * * *", async () => {
    await updateCryptoData(cryptos);
  });
  //-------------DIFFERENT HANDLERS FOR BOT-------------
  //Text handler
  bot.on("text", async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username;
    const messageText = msg.text;
    const users = client.db("trade-bot-users").collection("users");
    const user = await users.findOne({ chatId: chatId });
    console.log(messageText);
    if (messageText === "/start") {
      //creating user object constant
      const user = {
        name: username,
        chatId: chatId,
        predictsAvalible: 1000,
        chosenCurrency: null,
      };
      //checking the user in DB (if there isn't any user with such chat-id adding new one)
      const candidate = await users.findOne({ chatId: chatId });
      if (!candidate) {
        await users.insertOne(user);
      }
      bot.sendMessage(chatId, messages.greetingMessage, {
        parse_mode: "HTML",
        reply_markup: keyboards.getStartedkeyboard.reply_markup,
      });
    } else {
      //manipulations with user data about the choosen coin
      //adding next condition to prevent bot reaction to message without chossing the specific coin by user
      if (user.chosenCurrency != null) {
        //chekcing the format of message with RegExp above
        if (formatRegex.test(messageText)) {
          //manipulations with string
          const array = messageText.split("/");
          const numberArray = array.map((element) => +element);
          //creating object for current data of chosen coin
          const customerData = [
            {
              deltaCoin: 0,
              rsi: numberArray[0],
              sma: numberArray[1],
              macd: numberArray[2],
              deltaBTC: numberArray[3],
            },
          ];
          //writing customer's coin data to csv in specific folder
          await CSVWriter.writeCustomerDataToCSV(
            customerData,
            user.chosenCurrency
          );
          //getting predict
          await getPredict(user.chosenCurrency, (result) => {
            //estimating result and sending feedback message
            if (result === "buy") {
              bot.sendMessage(
                chatId,
                messages.buyMessage(user.chosenCurrency),
                {
                  parse_mode: "HTML",
                }
              );
              bot.sendMessage(chatId, messages.chooseTheCurrencyMessage, {
                parse_mode: "HTML",
                reply_markup: keyboards.chooseCurrencyKeyBoard(cryptos),
              });
            } else {
              bot.sendMessage(
                chatId,
                messages.sellMessage(user.chosenCurrency),
                {
                  parse_mode: "HTML",
                }
              );
              bot.sendMessage(chatId, messages.chooseTheCurrencyMessage, {
                parse_mode: "HTML",
                reply_markup: keyboards.chooseCurrencyKeyBoard(cryptos),
              });
            }
          });
          //changing predicts quantity in DB
          await users.updateOne(
            { chatId: chatId },
            { $set: { chosenCurrency: null }, $inc: { predictsAvalible: -1 } }
          );
        } else {
          await bot.sendMessage(chatId, messages.wrongInputMessage, {
            parse_mode: "HTML",
          });
        }
      }
    }
  });
  bot.on("callback_query", async (callbackQuery) => {
    //getting all useful information about the user before further messaging
    //id of bots message for further manipulations
    const messageId = callbackQuery.message.message_id;
    //id of chat with specific user for further manipulations
    const chatId = callbackQuery.message.chat.id;
    //getting DB collection with users
    const users = client.db("trade-bot-users").collection("users");
    //getting specific user object from DB
    const user = await users.findOne({ chatId: chatId });
    //Parsing data from callbackQuery
    const data = JSON.parse(callbackQuery.data);
    //handling callbackQuery
    if (data.cmd === "get_started") {
      const currentUser = await users.findOne({ chatId: chatId });
      //sending message with user info
      await bot.deleteMessage(chatId, messageId);
      await bot.sendMessage(
        chatId,
        messages.customerInfoMessage(
          currentUser.name,
          currentUser.predictsAvalible
        ),
        {
          parse_mode: "HTML",
          reply_markup: keyboards.customerAccountKeyboard.reply_markup,
        }
      );
    } else if (data.cmd === "go_to_predictions") {
      //sending message with avalible coins for prediction
      await bot.deleteMessage(chatId, messageId);
      await bot.sendMessage(chatId, messages.chooseTheCurrencyMessage, {
        parse_mode: "HTML",
        reply_markup: keyboards.chooseCurrencyKeyBoard(cryptos),
      });
    } else if (data.cmd === "input_user_data") {
      //setting coin names in DB and asking the user to provide current data about the coin

      await bot.deleteMessage(chatId, messageId);
      await users.updateOne(
        { chatId: chatId },
        { $set: { chosenCurrency: data.currency } }
      );
      await bot.sendMessage(
        chatId,
        messages.provideInfoMessage(data.currency),
        {
          parse_mode: "HTML",
        }
      );
    }
  });
};

start();
