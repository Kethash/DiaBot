import { Events, Message, MessageType, TextChannel } from "discord.js";
import { compareAnswers } from "../functions/answer-parsing";
import { sendQuizzMessage, replyQuizzAnswer } from "../functions/quizz";
import config from "../../config.json"

export = {
    name: Events.MessageCreate,
    async execute(redisClient: any, message: Message) {
        if (message.author.bot) return;
        if (!(message.type === MessageType.Reply)) return;

        const repliedTo = await message.channel.messages.fetch(message.reference?.messageId as string);

        if (repliedTo.author.id !== config.clientID) return;

        let answer = await redisClient.json.get(`answer:${message.reference?.messageId}`, '.');
        if (answer == null) return; // Prevent from multiple responses when players play together

        let successToAnswer = answer.answers.split(';').some((answerString: string) => compareAnswers(message.content, answerString, answer?.isStrict ?? false));

        await replyQuizzAnswer(successToAnswer, answer, message);

        // Suppression clef
        await redisClient.json.del(`answer:${message.reference?.messageId}`, '.');

        const quizzName = answer.quizz_id;
        const channel: TextChannel = message.channel as TextChannel;
        const userId = message.author.id;

        await sendQuizzMessage(quizzName, userId, channel, redisClient);

        let playerProfile = await redisClient.json.get(`answer:player:${message.author.id}`, '.');
        if (playerProfile === null) playerProfile = { };
        if (!playerProfile.quizzs) playerProfile.quizzs = {};
        if (!playerProfile.quizzs[answer.quizz_id]) {
            playerProfile.quizzs[answer.quizz_id] = { playCount: 0, quizz_id: answer.quizz_id };
        }
        playerProfile.quizzs[answer.quizz_id].playCount++;
        await redisClient.json.set(`answer:player:${message.author.id}`, '.', playerProfile);
    }
}
