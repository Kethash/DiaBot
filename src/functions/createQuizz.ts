import { EmbedBuilder, TextChannel } from "discord.js";

export async function createQuizzMessage(quizzName:string, userId: string, channel: TextChannel, redisClient: any): Promise<void> {
    const quizzs: Array<{imageLink: string, answers: string}> = await redisClient.json.get(quizzName, {path: '.quizzs'});
    
    const question = quizzs[Math.floor(Math.random() * quizzs.length)];
    const embed: EmbedBuilder = new EmbedBuilder()
        .setColor("#FD5E53")
        // TODO: Use a question title defined by json in quizzs or question
        .setTitle("What is the title of this song ? Reply to this message to respond :)")
        .setImage(question.imageLink);

    const message = await channel.send({embeds: [embed]})
    redisClient.json.set(`answer:${message.id}`,'.',{
        author_id: userId,
        quizz_message_id:message.id,
        answers: question.answers,
        quizz_id: quizzName
    });
}