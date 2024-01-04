//library to make http request to the API
import axios from "axios";
//library to read enviromental variables
import dotenv from "dotenv";
//configuration of .env
dotenv.config();
// -------------ENV CONSTANT-------------
const ApiKey = process.env.POLY_API_KEY;
//manipulations with date
const formatDate = (date) => {
  let year = date.getFullYear();
  let month = (date.getMonth() + 1).toString().padStart(2, "0");
  let day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};
//converting Timestamp to readeble date
const convertTimestampToReadableDate = (timestamp) => {
  let date = new Date(timestamp);
  let year = date.getFullYear();
  let month = (date.getMonth() + 1).toString().padStart(2, "0");
  let day = date.getDate().toString().padStart(2, "0");
  let hours = date.getHours().toString().padStart(2, "0");
  let minutes = date.getMinutes().toString().padStart(2, "0");
  let seconds = date.getSeconds().toString().padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

//this function returns array with 2 days with interval like here ['10-06-2023', '13-06-2023']
//we need this to train our model om 96 appropriate values
const getTwoPreviousDays = () => {
  let currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 3);
  let twoPreviousDays = [];
  let previousDay1 = new Date(currentDate);
  previousDay1.setDate(previousDay1.getDate() - 1);
  twoPreviousDays.push(formatDate(previousDay1));
  let previousDay2 = new Date(currentDate);
  previousDay2.setDate(previousDay2.getDate() + 2);
  twoPreviousDays.push(formatDate(previousDay2));

  return twoPreviousDays;
};

//GET request to the API to get nessasary indicators

//RSI
const getRSI = async (coin) => {
  try {
    const data = await axios.get(
      `https://api.polygon.io/v1/indicators/rsi/X:${coin}?timespan=hour&window=14&series_type=close&order=desc&limit=96&apiKey=${ApiKey}`
    );
    data.data.results.values.forEach((element) => {
      element.timestamp = convertTimestampToReadableDate(element.timestamp);
    });
    const RSI = data.data.results.values;
    return RSI;
  } catch (error) {
    console.log(error);
  }
};
//SMA
const getSMA = async (coin) => {
  try {
    const data = await axios.get(
      `https://api.polygon.io/v1/indicators/sma/X:${coin}?timespan=hour&window=9&series_type=close&expand_underlying=false&order=desc&limit=96&apiKey=${ApiKey}`
    );
    data.data.results.values.forEach((element) => {
      element.timestamp = convertTimestampToReadableDate(element.timestamp);
    });
    const SMA = data.data.results.values;
    return SMA;
  } catch (error) {}
};
//MACD
const getMACD = async (coin) => {
  try {
    const data = await axios.get(
      `https://api.polygon.io/v1/indicators/macd/X:${coin}?timespan=hour&short_window=12&long_window=26&signal_window=9&series_type=close&order=desc&limit=96&apiKey=${ApiKey}`
    );
    const MACD = data.data.results.values.map((item) => ({
      timestamp: convertTimestampToReadableDate(item.timestamp),
      value: item.value,
    }));
    return MACD;
  } catch (error) {
    console.log(error);
  }
};
//Delta of BTC price
const getDeltaBTC = async () => {
  try {
    let twoPreviousDaysArray = getTwoPreviousDays();
    const data = await axios.get(
      `https://api.polygon.io/v2/aggs/ticker/X:BTCUSD/range/1/hour/${twoPreviousDaysArray[0]}/${twoPreviousDaysArray[1]}?adjusted=true&sort=asc&apiKey=${ApiKey}`
    );
    const deltaBTC = data.data.results.reverse().map((item) => ({
      timestamp: convertTimestampToReadableDate(item.t),
      detlaPrice: item.c - item.o,
    }));
    return deltaBTC;
  } catch (error) {
    console.log(error);
  }
};
//Delta of chosen coin price
const getDeltaCoin = async (coin) => {
  try {
    let twoPreviousDaysArray = getTwoPreviousDays();
    const data = await axios.get(
      `https://api.polygon.io/v2/aggs/ticker/X:${coin}/range/1/hour/${twoPreviousDaysArray[0]}/${twoPreviousDaysArray[1]}?adjusted=true&sort=asc&apiKey=${ApiKey}`
    );
    const deltaCoin = data.data.results.reverse().map((item) => ({
      timestamp: convertTimestampToReadableDate(item.t),
      delta: item.c - item.o > 0 ? 1 : 0,
    }));
    return deltaCoin;
  } catch (error) {
    console.log(error);
  }
};
//creating object as a good practise for API manipulations export 
const API = {
  //method that returns array with objects fot all time intervals with fields which contains all indicators
  getFetchedData: async (coin) => {
    const RSI = await getRSI(coin);
    const SMA = await getSMA(coin);
    const MACD = await getMACD(coin);
    const deltaCoin = await getDeltaCoin(coin);
    console.log(deltaCoin.length);
    const deltaBTC = await getDeltaBTC();
    const fetchedData = {
      coinName: coin,
      data: [],
    };
    for (let i = 0; i < deltaCoin.length; i++) {
      console.log(deltaCoin[i]);
      const dataObj = {
        deltaCoin: deltaCoin[i].delta,
        timestamp: RSI[i].timestamp,
        rsi: RSI[i].value,
        sma: SMA[i].value,
        macd: MACD[i].value,
        deltaBTC: deltaBTC[i].detlaPrice,
      };
      fetchedData.data.push(dataObj);
    }
    console.log(fetchedData);
    return fetchedData;
  },
};

export default API;
