const keyboards = {
    getStartedkeyboard: {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Get Started 🚀",
                callback_data: JSON.stringify({ cmd: "get_started" }),
              },
            ],
          ],
        },
      },
      customerAccountKeyboard: {
        reply_markup: {
          remove_keyboard: true,
          inline_keyboard: [
            [
              {
                text: "Go to predictions",
                callback_data: JSON.stringify({ cmd: "go_to_predictions" }),
              }
            ],
          ],
        },
      },
      chooseCurrencyKeyBoard : (arr) => {
        const reply_markup = {
            inline_keyboard: []
        }
        arr.forEach(element => {
            const keyBoardBtn = [{
                text: element,
                callback_data: JSON.stringify({ cmd: 'input_user_data', currency: element }),
            }]
            reply_markup.inline_keyboard.push(keyBoardBtn)
        });
        return reply_markup
      }
}
export default keyboards