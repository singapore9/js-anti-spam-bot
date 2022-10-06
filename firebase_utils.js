const fbApp = require('firebase/app');
const fbDb = require('firebase/database');
const fbAuth = require('firebase/auth');

const constants = require('./constants');

// Initialize Firebase
const applic = fbApp.initializeApp(constants.FIREBASE_CONFIG);
const db = fbDb.getDatabase(applic);

const GREYLIST_KEY = "greylist";
const BLOCK_USERS_PATTERNS_KEY = "block_user_patterns";
const USERS_KEY = "users";

const DEFAULT_LIMIT = 5;


function getBotInfo(rawBotId) {
    const botId = rawBotId.toString();
    const ref = fbDb.ref(db);
    return fbDb.get(fbDb.child(ref, `/${botId}`)).then((snapshot) => {
        if (snapshot.exists())
            return snapshot.val();
        return {};
    });
}


function setBotInfo(rawBotId, botInfo) {
    const botId = rawBotId.toString();
    const ref = fbDb.ref(db);
    return fbDb.get(fbDb.child(ref, '/')).then((snapshot) => {
        const botsData = snapshot.exists()? snapshot.val() : {};
        botsData[botId] = botInfo;
        return fbDb.set(ref, botsData);
    });
}


function getChatInfo(rawBotId, rawChatId) {
    const botId = rawBotId.toString();
    const chatId = rawChatId.toString();
    return getBotInfo(botId).then((botInfo) => botInfo[chatId] || {});
}


function setChatInfo(rawBotId, rawChatId, chatInfo) {
    const botId = rawBotId.toString();
    const chatId = rawChatId.toString();
    return getBotInfo(botId).then((botInfo) => {
        botInfo[chatId] = chatInfo;
        return setBotInfo(botId, botInfo);
    });
}


function getChatLimits(rawBotId, rawChatId) {
    const botId =  rawBotId.toString();
    const chatId = rawChatId.toString();
    return getChatInfo(botId, chatId).then((chatInfo) => chatInfo[GREYLIST_KEY] || {});
}


function setChatLimits(rawBotId, rawChatId, phrase, count) {
    const botId = rawBotId.toString();
    const chatId = rawChatId.toString();

    return getChatInfo(botId, chatId).then((chatInfo) => {
        chatInfo[GREYLIST_KEY][phrase] = count;
        return setChatInfo(botId, chatId, chatInfo);
    });
}


function delChatLimits(rawBotId, rawChatId, phrase) {
    const botId = rawBotId.toString();
    const chatId = rawChatId.toString();
    return getChatInfo(botId, chatId).then((chatInfo) => {
        delete chatInfo[GREYLIST_KEY][phrase];
        return setChatInfo(botId, chatId, chatInfo);
    });
}


function getChatUsersPatterns(rawBotId, rawChatId) {
    const botId = rawBotId.toString();
    const chatId = rawChatId.toString();

    return getChatInfo(botId, chatId).then((chatInfo) => chatInfo[BLOCK_USERS_PATTERNS_KEY] || {});
}


function setChatUsersPatterns(rawBotId, rawChatId, pattern) {
    const timestamp = (new Date().getTime() / 1000).toString();
    const botId = rawBotId.toString();
    const chatId = rawChatId.toString();

    return getChatInfo(botId, chatId).then((chatInfo) => {
       chatInfo[BLOCK_USERS_PATTERNS_KEY][timestamp] = pattern;
       return setChatInfo(chatInfo);
    });
}


function delChatUsersPatterns(rawBotId, rawChatId, pattern) {
    const botId = rawBotId.toString();
    const chatId = rawChatId.toString();

    return getChatInfo(botId, chatId).then((chatInfo) => {
        const timestamps = Object.keys(chatInfo[BLOCK_USERS_PATTERNS_KEY] || {});
        const shouldRemoveTimestamps = [];
        timestamps.forEach((ts) => {
            if (chatInfo[BLOCK_USERS_PATTERNS_KEY][ts] === pattern) {
                shouldRemoveTimestamps.push([ts]);
            }
        });
        shouldRemoveTimestamps.forEach((ts) => {
            delete chatInfo[BLOCK_USERS_PATTERNS_KEY][ts];
        });
        return setChatInfo(botId, chatId, chatInfo);
    });
}


function getUserInfo(rawBotId, rawChatId, rawUserId) {
    const botId = rawBotId.toString();
    const chatId = rawChatId.toString();
    const userId = rawUserId.toString();

    return getChatInfo(botId, chatId).then((botInfo) => (botInfo[USERS_KEY] || {})[userId] || [null, 0]);
}


function setUserInfo(rawBotId, rawChatId, rawUserId, phraseAndCount) {
    const botId = rawBotId.toString();
    const chatId = rawChatId.toString();
    const userId = rawUserId.toString();

    return getChatInfo(botId, chatId).then((chatInfo) => {
        if (chatInfo[USERS_KEY] === undefined) {
            chatInfo[USERS_KEY] = {};
        }
        chatInfo[USERS_KEY][userId] = phraseAndCount;

       return setChatInfo(botId, chatId, chatInfo);
    });
}


function delUserInfo(rawBotId, rawChatId, rawUserId) {
    const botId = rawBotId.toString();
    const chatId = rawChatId.toString();
    const userId = rawUserId.toString();

    return getChatInfo(botId, chatId).then((chatInfo) => {
        if (chatInfo[USERS_KEY] !== undefined) {
            delete chatInfo[USERS_KEY][userId];
        }
        return setChatInfo(botId, chatId, chatInfo);
    });
}


module.exports = {
    DEFAULT_LIMIT,
    getBotInfo,
    setBotInfo,
    getChatInfo,
    setChatInfo,
    getChatLimits,
    setChatLimits,
    delChatLimits,
    getChatUsersPatterns,
    setChatUsersPatterns,
    delChatUsersPatterns,
    getUserInfo,
    setUserInfo,
    delUserInfo
}