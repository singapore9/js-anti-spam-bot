# Telegram bot @SilenceKeeperBot

Main idea of this bot:
save groups/chats from spam-accounts.

## How bot does it:
1. Has list of filters for (first name + last name), accounts which are matched by these filters will be blocked.
2. Has list of suspicious phrases with limit for each of them. 
   When account sends a specified amount of suspicious messages, it will be blocked. 

## Technical info:
1. Database - Fastapi Realtime Database
2. Telegram API Client - node-telegram-bot-api
3. node v14.15

## How to configure:
1. Telegram:
- 1.1. Make your own bot via @BotFather in Telegram.
- 1.2. Save its token (i'll call it TELEGRAM_TOKEN).
- 1.3. Add commands:

```
users_pattern_add - Add username pattern which will be blocked by bot. Example: /users_pattern_add \s*\w(\s+\w)?\s*
users_pattern_show - Show already configured patterns which will be blocked by bot
users_pattern_remove - Remove username pattern from list of blocked patters. Example: /users_pattern_remove \s*\w(\s+\w)?\s*
greylist_phrase_add - Add phrase with its limit which will be blocked by bot. Example: /greylist_phrase_add 5 visit my channel
greylist_phrase_show - Show already configured phrases with setted limits which will be blocked by bot
greylist_phrase_remove - Remove username phrase from list of checked phrases. Example: /greylist_phrase_remove visit my channel
```
2. Firebase:
- 2.1. Create project on Firebase.
- 2.2. Add Realtime Database.
- 2.3. Configre Realtime Database **Rules** (tab) like this:
```
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
- 2.4. On Firebase project settings page, create **WebApp**.
- 2.5. Get **Firebase Config** from WebApp creation page. (i'll call it FIREBASE_CONFIG)


## How to Run:
1. Add your bot into your group as administrator with permission to read messages.
2. Clone this repo to your machine.
3. Create file constants.js in this folder with your **TELEGRAM_TOKEN** and 
   **FIREBASE_CONFIG**. (examples are in constants.base.js)
4. Run `node index.js`.
5. Enjoy!


