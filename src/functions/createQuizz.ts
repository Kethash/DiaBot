import axios from "axios";
import { AttachmentBuilder, EmbedBuilder, TextChannel } from "discord.js";
import sharp from "sharp";

export async function createQuizzMessage(quizzName:string, userId: string, channel: TextChannel, redisClient: any): Promise<void> {
    const quizzs: Array<{title: string, imageLink: string, blurImage: boolean, answers: string}> = await redisClient.json.get(quizzName, {path: '.quizzs'});
    
    const question = quizzs[Math.floor(Math.random() * quizzs.length)];
    
    const options: { embeds?: EmbedBuilder[] } = {};
    
    if (question.imageLink && (question?.blurImage === true || question?.blurImage)) {
        const buffer = (await axios.get(question.imageLink, { responseType: 'arraybuffer' })).data as Buffer;
        console.log(buffer);
        let blurredImageBuffer = await sharp(buffer).blur(45).toBuffer();
        
        const imageFileName = question.imageLink.substring(question.imageLink.lastIndexOf('/') + 1);
        console.log(imageFileName);
        let blurredImageAttachment = new AttachmentBuilder(buffer, { name: imageFileName });
        console.log(blurredImageAttachment);
        
        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor("#FD5E53")
            .setTitle(question?.title ?? "What is the title of this song ? Reply to this message to respond :)")
            .setImage('attachment://' + imageFileName);
        
        options['embeds'] = [embed];
    }

    const message = await channel.send(options);
    
    redisClient.json.set(`answer:${message.id}`,'.',{
        author_id: userId,
        quizz_message_id:message.id,
        answers: question.answers,
        quizz_id: quizzName
    });
}
