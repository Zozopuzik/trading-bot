//library to run not js files on node.js
import { exec } from "child_process";
//function that calls R script, manipulate with callback and return "sell" or "buy"
const runRScript = async (coin, callback) => {
  try {
    const rScriptPath = "C:/Program Files/R/R-4.3.1/bin/Rscript";
    const rScriptFile = `./R_script_${coin}/model.R`;
    const command = `"${rScriptPath}" "${rScriptFile}"`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Ошибка при выполнении R-скрипта: ${error}`);
        return;
      }
      const probability = parseFloat(stdout.split('\n')[1].replace(/\s/g, '').slice(3))
      console.log(probability)
      if(probability > 0.55){
        callback('sell')
      }else{
        callback('buy')
      }
    });
  } catch (error) {
    console.error(`Произошла ошибка при выполнении R-скрипта: ${error}`);
  }
};

//setting timeout for all csvs get ready to perform at R script 
const getPredict = async(coin, callback) => {
  setTimeout(() => {
    runRScript(coin, callback);
  }, 2000);
}


export default getPredict





