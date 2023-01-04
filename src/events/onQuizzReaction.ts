import { Events, TextChannel, MessageReaction, User } from "discord.js";
import { sendQuizzMessage, replyQuizzAnswer } from "../functions/quizz";
import config from "../../config.json"

export = {
    name: Events.MessageReactionAdd,
    async execute(redisClient: any, messageReaction: MessageReaction, user: User) {
        // Was reaction created by the bot
        if (!messageReaction.me) return;
        if (user.id === config.clientID) return;
        if (messageReaction.emoji.toString() !== '⏭️') return;

        let answer = await redisClient.json.get(`answer:${messageReaction.message.id}`, '.');
        if (answer == null) return; // Prevent from multiple responses when players play together

        // Suppression clef
        await redisClient.json.del(`answer:${messageReaction.message.id}`, '.');

        const channel: TextChannel = messageReaction.message.channel as TextChannel;

        await replyQuizzAnswer(false, answer, messageReaction.message);
        await sendQuizzMessage(answer.quizz_id, answer.author_id, channel, redisClient);

        //await messageReaction.remove();
    }
}
