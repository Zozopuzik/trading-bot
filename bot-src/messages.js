const messages = {
  greetingMessage:
    "<b>Welcome to the <i>Trading Bot</i>!</b> 🤖\n" +
    "Explore the exciting world of cryptocurrency trading with us. Here, you can stay updated with the latest information on cryptocurrency markets and benefit from price predictions generated by our advanced algorithms. 🚀\n" +
    "Our algorithms analyze market trends to provide you with insightful forecasts, empowering you to make informed decisions when navigating the dynamic landscape of cryptocurrency trading. 💼\n",
  customerInfoMessage: (customerName, predictsAvalible) => {
    const msg =
      `Hi <b>@${customerName}</b>!\n` +
      `Welcome to our trading bot 🚀. ` +
      `This is your first step into the exciting world of cryptocurrency tradingn\n` +
      `📊 Explore the latest market trends and make informed decisions based on our predictions.\n` +
      `🌐 Currently, <b>${predictsAvalible}</b> predictions are available for you.\n` +
      `Press the button at the bottom and use our predictions wisely.\n`;
    return msg;
  },
  chooseTheCurrencyMessage:
    "<b>Choose the Currency:</b>\n" +
    "To get started, select a cryptocurrency from the options below:\n" +
    "1. <code>ETH</code> - Ethereum\n" +
    "2. <code>MATIC</code> - Polygon\n" +
    "3. <code>XLM</code> - Stellar\n" +
    "4. <code>Dash</code> - Dash\n" +
    "5. <code>LTC</code> - Litecoin\n" +

    "Click respective buttons to explore information and predictions for each currency.\n\n",
  provideInfoMessage: (coin) => {
    const msg =
      `Plese provide me with actual info for this hour about <code>${coin}</code> \n` +
      `To make prediction I need: \n` +
      `<code>- RSI value</code> \n` +
      `<code>- SMA value</code> \n` +
      `<code>- MACD value</code> \n` +
      `<code>- BCTUSD price delta value</code> \n` +
      `Use this format to send me a message \n` +
      `<b>RSI,SMA,MACD,BCTUSD</b>\n` +
      `EXAMPLE : <b>1.3/22/-2333/-1.5</b>`;
    return msg;
  },
  wrongInputMessage:
    `<b>Wrong Input</b>\n` +
    `Read the instructions above and follow the example`,
  buyMessage: (coin) => {
    const msg =
      `<b>Opportunity for ${coin} detected!</b>\n\n` +
      `Our analysis suggests a potential <b>BUY</b> signal.\n` +
      `Consider reviewing your investment strategy for this favorable market condition`;
    return msg;
  },
  sellMessage: (coin) => {
    const msg =
      `<b>Alert: SELL signal for ${coin} identified.</b>\n\n` +
      `It might be a good time to evaluate your portfolio and decide on appropriate actions to align with current market trends.`;
    return msg;
  },
};

export default messages;