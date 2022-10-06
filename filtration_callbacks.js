const dbUtils = require('./firebase_utils');


function checkNewMembers(bot, botId, msg, chatId) {
    const newMembersArray = msg.new_chat_members || Array();
    newMembersArray.forEach((member) => {
        const userId = member.id;
        let fullName = member.first_name;
        if (member.last_name) {
            fullName = fullName + ' ' + member.last_name;
        }
        fullName = fullName.trim();

        const blockUserPatternsPromise = dbUtils.getChatUsersPatterns(botId, chatId);

        blockUserPatternsPromise.then((blockUserPatterns) => {
           const keys = Object.keys(blockUserPatterns || {});
           keys.some((ts_key) => {
              const pattern = blockUserPatterns[ts_key];
               const re = new RegExp(pattern, 'ui');
               const match = fullName.match(re);
               if (match && match[0] === match.input) {
                   bot.banChatMember(chatId, userId);
                   return true;
               }
           });
        });
    });
}


function calculateMessages(bot, botId, msg, chatId) {
    const text = (msg.text || '').toLowerCase();
    const userFrom = msg.from.id;

    dbUtils.getBotInfo(botId).then(botInfo => {

        const getPhraseAndCountPromise = new Promise(() => {
           return dbUtils.getUserInfo(botId, chatId, userFrom);
        });
        const getChatLimitsPromise = new Promise(() => {
           return dbUtils.getChatLimits(botId, chatId);
        });
        // Promise.all([getPhraseAndCountPromise, getChatLimitsPromise]).then((values) => {
        Promise.all([
            dbUtils.getUserInfo(botId, chatId, userFrom),
            dbUtils.getChatLimits(botId, chatId)
        ]).then((values) => {
            let textLikePattern = false;

            const phraseAndCount = (values[0] && [...(values[0])]) || [null, 0];
            const latestPattern = phraseAndCount[0];
            let count = phraseAndCount[1];

            const greyphrasesLimits = values[1] || {};
            const greyphrases = Object.keys(greyphrasesLimits);

            greyphrases.some((pattern) => {
               const patternLower = pattern.toLowerCase();

               if (patternLower === text) {
                   textLikePattern = true;
                   const specificLimit = (greyphrasesLimits || {})[patternLower] || dbUtils.DEFAULT_LIMIT;

                   if (latestPattern !== patternLower) {
                       count = 1;
                   } else {
                       count += 1;
                   }

                   if (count > 1) {
                       dbUtils.delUserInfo(botId, chatId, userFrom);
                   }

                   if (specificLimit <= count) {
                       bot.banChatMember(chatId, userFrom);
                   }
                   dbUtils.setUserInfo(botId, chatId, userFrom, [patternLower, count]);
                   return true;
               }
            });

            if (textLikePattern === false) {
                dbUtils.delUserInfo(botId, chatId, userFrom);
            }
        }, (err) => {
            console.log(err);
        });

    });
}

module.exports = {
    calculateMessages,
    checkNewMembers
}