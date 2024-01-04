//library to write CVS files
import { createObjectCsvWriter } from "csv-writer";
//importing API object with methods to manipulate with API
import API from "./API.js";
//cteating object with methods to manipulate with CSV
const CSVWriter = {
  //method that writes API data in CSV file
     writeDataToCSV : async (coin) => {
        try {
            const data = await API.getFetchedData(coin);
            const csvWriter = createObjectCsvWriter({
            path: `./R_script_${coin}/${coin}_data.csv`, // - file name and directory 
            header: [
              { id: "deltaCoin", title: "DeltaCoin" },
              { id: "rsi", title: "RSI" },
              { id: "sma", title: "SMA" },               // - headers
              { id: "macd", title: "MACD" },
              { id: "deltaBTC", title: "DeltaBTC" },
            ],
          });
          await csvWriter.writeRecords(data.data);       // - writing CSV
          console.log(`Data for ${coin} successfully added to CSV-file`);
        } catch (error) {
          console.log("Error in adding data to CSV", error); // - handling errors
        }
      },
        //method that writes customer data in CSV file
       writeCustomerDataToCSV : async (data, coin) => {
        try {
          const csvWriter = createObjectCsvWriter({
            path: `./R_script_${coin}/user_data.csv`,      // - file name and directory
            header: [
              { id: "deltaCoin", title: "DeltaCoin" },
              { id: "rsi", title: "RSI" },
              { id: "sma", title: "SMA" },                 // - headers
              { id: "macd", title: "MACD" },
              { id: "deltaBTC", title: "DeltaBTC" },
            ],
          });
          await csvWriter.writeRecords(data);              // - writing CSV
          console.log(`User's data for ${coin} successfully added to CSV-file`);
        } catch (error) {
          console.log(`Error in adding user's data for ${coin} to CSV`, error); // - handling errors
        }
       
      },
}
export default CSVWriter