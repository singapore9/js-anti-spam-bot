const express = require("express");
const TelegramBot = require('node-telegram-bot-api');

const constants = require("./constants");
const callbacks = require("./filtration_callbacks");
const commands = require("./commands");

// replace the value below with the Telegram token you receive from @BotFather
const token = constants.TELEGRAM_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Listen for any kind of message. There are different kinds of messages.
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text || '';
    const userFrom = msg.from.id;

    bot.getMe().then((botTgData) => {
        const botId = botTgData.id;
        const botUsername = botTgData.username;
        console.log(botTgData);

        const probablyCommand = text.split(' ')[0].split('@')[0];
        if (
            commands.COMMANDS_BY_NAME[probablyCommand] ||
            commands.COMMANDS_BY_NAME[probablyCommand + '@' + botUsername]
        ) {
            commands.COMMANDS_BY_NAME[probablyCommand](bot, botId, msg, chatId);
        } else {
            callbacks.checkNewMembers(bot, botId, msg, chatId);
            callbacks.calculateMessages(bot, botId, msg, chatId);
        }
    })
});


const app = express();
app.get("/webhook",function(request,response){
    response.send("Hello World!")
    // bot.sendMessage( "info")
})


module.exports = app;

