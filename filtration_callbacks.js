function onMessageReaction (bot, msg) {
    const chatId = msg.chat.id;
    const text = msg.text || '';
    const userFrom = msg.from.id;

    checkNewMembers(bot, msg, chatId);
}

function checkNewMembers(bot, msg, chatId) {
    const newMembersArray = msg.new_chat_members || Array();
    newMembersArray.forEach((member) => {
        const userId = member.id;
        let fullName = member.first_name;
        if (member.last_name) {
            fullName = fullName + ' ' + member.last_name;
        }
        fullName = fullName.trim()
        const blockUserPatterns = [
            "harold",
            "\\s*\\w(\\s+\\w)?\\s*",
            "\\s*[^\\s](\\s+[^\\s])?\\s*"
        ];
        blockUserPatterns.some((pattern) => {
            const re = new RegExp(pattern, 'ui');
            const match = fullName.match(re);
            if (match && match[0] === match.input) {
                bot.sendMessage(chatId, "I want to ban him!! (pattern " + pattern + ")");
                bot.banChatMember(chatId, userId);
                return true;
            }
        });
    });
}

module.exports = {
    onMessageReaction
}