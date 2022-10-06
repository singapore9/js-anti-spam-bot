const dbUtils = require('./firebase_utils');


function usersPatternShow(bot, botId, msg, chatId) {
    dbUtils.getChatUsersPatterns(botId, chatId).then((blockUserPatterns) => {
        const userPatterns = Object.values(blockUserPatterns || {});

        const strUserPatterns = userPatterns.join("\n");
        bot.sendMessage(chatId, `Patterns are:\n${strUserPatterns}`);
    });
}


function greylistPhraseShow(bot, botId, msg, chatId) {
    dbUtils.getChatLimits(botId, chatId).then((greyphrasesLimits) => {
        const phrases = Object.keys(greyphrasesLimits || {});
        let strLimits = 'Greylist phrases are:\n';
        phrases.forEach((phrase) => {
           const phraseMsg = `Message "${phrase}" for ${greyphrasesLimits[phrase]} times.\n`;
           strLimits = strLimits + phraseMsg;
        });
        bot.sendMessage(chatId, strLimits);
    });
}


function usersPatternRemove(bot, botId, msg, chatId) {
    const text = msg.text || '';
    // "/command   param1 param2 param3" -> "param1 param2 param3"
    const userPattern = text.trim().split(' ').slice(1).join(' ').trim();

    if (userPattern) {
        dbUtils.getChatUsersPatterns(botId, chatId).then((usersPatterns) => {
           const patterns = Object.values(usersPatterns || {});

           if (patterns.includes(userPattern)) {
               dbUtils.delChatUsersPatterns(botId, chatId, userPattern).then(() => {
                  bot.sendMessage(chatId, `Pattern "${userPattern}" was removed from list of blocked usernames`);
               });
           }
        });
    } else {
        bot.sendMessage(chatId, "Didn't remove pattern: Pattern is empty");
    }
}


function greylistPhraseRemove(bot, botId, msg, chatId) {
    const text = msg.text || '';
    // "/command   param1 param2 param3" -> "param1 param2 param3"
    const phrase = text.trim().split(' ').slice(1).join(' ').trim();

    if (phrase) {
        dbUtils.getChatLimits(botId, chatId).then((greylistPhrasesWithLimits) => {
            const greylistPhrases = Object.keys(greylistPhrasesWithLimits || {});

            if (greylistPhrases.includes(phrase)) {
                dbUtils.delChatLimits(botId, chatId, phrase).then(() => {
                    bot.sendMessage(chatId, `Phrase "${phrase}" was removed from list of greylist phrases`);
                });
            }
        });
    } else {
        bot.sendMessage(chatId, "Didn't remove phrase: phrase is empty");
    }
}


function usersPatternAdd(bot, botId, msg, chatId) {
    const text = msg.text || '';
    // "/command   param1 param2 param3" -> "param1 param2 param3"
    const userPattern = text.trim().split(' ').slice(1).join(' ').trim();

    if (userPattern) {
        dbUtils.getChatUsersPatterns(botId, chatId).then((usersPatterns) => {
            const patterns = Object.values(usersPatterns || {});

            if (patterns.includes(userPattern)) {
                bot.sendMessage(chatId, `Pattern "${userPattern}" already existed in list of blocked usernames`);
            } else {
                dbUtils.setChatUsersPatterns(botId, chatId, userPattern).then(() => {
                    bot.sendMessage(chatId, `Pattern "${userPattern}" was added to list of blocked usernames`);
                });
            }
        });
    } else {
        bot.sendMessage(chatId, "Didn't add pattern: Pattern is empty");
    }
}


function greylistPhraseAdd(bot, botId, msg, chatId) {
    const text = msg.text || '';
    // "/command   param1 param2 param3" -> "param1 param2 param3"
    const limitAndPhrase = text.trim().split(' ').slice(1).join(' ').trim();
    if (limitAndPhrase.split(' ').length < 2) {
        bot.sendMessage(chatId, "Didn't add phrase: should be 2 argument separated by space\n1st - limit, 2nd - phrase");
        return;
    }
    const limit = parseInt(limitAndPhrase.split(' ')[0]);
    const phrase = limitAndPhrase.split(' ').slice(1).join(' ').trim();
    if (limit < 1) {
        bot.sendMessage(chatId, "Didn't add phrase: limit should be positive");
        return;
    }
    if (phrase) {
        dbUtils.setChatLimits(botId, chatId, phrase, limit).then(() => {
           bot.sendMessage(chatId, `Phrase "${phrase}" was added to list of greylist phrases with limit ${limit}`);
        });
    } else {
        bot.sendMessage(chatId, "Didn't add phrase: phrase is empty")
    }

}


const COMMANDS_BY_NAME = {
    '/users_pattern_show': usersPatternShow,
    '/greylist_phrase_show': greylistPhraseShow,
    '/users_pattern_remove': usersPatternRemove,
    '/greylist_phrase_remove': greylistPhraseRemove,
    '/users_pattern_add': usersPatternAdd,
    '/greylist_phrase_add': greylistPhraseAdd,
};


module.exports = {
    COMMANDS_BY_NAME
}