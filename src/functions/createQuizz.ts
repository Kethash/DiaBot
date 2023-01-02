import axios from "axios";
import { AttachmentBuilder, EmbedBuilder, TextChannel } from "discord.js";
import sharp from "sharp";

export async function createQuizzMessage(quizzName:string, userId: string, channel: TextChannel, redisClient: any): Promise<void> {
    const quizzs: Array<{title: string, imageLink: string, blurImage: boolean, blurRate: number, answers: string}> = await redisClient.json.get(quizzName, {path: '.quizzs'});
    
    const question = quizzs[Math.floor(Math.random() * quizzs.length)];
    
    let options: Options = {};
    
    if (question.imageLink) {
        let buffer = (await axios.get(question.imageLink, { responseType: 'arraybuffer' })).data as Buffer;
        // console.log(buffer);
        if (question?.blurImage === true) buffer = await sharp(buffer).blur(question.blurRate).toBuffer();
        
        const imageFileName = 'image.' + question.imageLink.substring(question.imageLink.lastIndexOf('.') + 1);
        const ImageAttachment = new AttachmentBuilder(buffer, { name: imageFileName });
        
        options = await createQuizEmbed(
                question?.title ?? "What is the title of this song ? Reply to this message to respond :)", 
                imageFileName,
                ImageAttachment
            );
    } else options = await createQuizEmbed(question?.title ?? "What is the title of this song ? Reply to this message to respond :)");

    const message = await channel.send(options);
    
    redisClient.json.set(`answer:${message.id}`,'.',{
        author_id: userId,
        quizz_message_id:message.id,
        answers: question.answers,
        quizz_id: quizzName
    });
}

export function isValidQuizz(jsonQuizz: jsonquizz): boolean {
    try {
        if (!('name' in jsonQuizz && 
        'description' in jsonQuizz && 
        'quizzs' in jsonQuizz)) return false;

        //@ts-ignore
        const quizz: Array<{
            title?: string,
            imageLink?: string,
            blurImage?: boolean,
            blurRate?: number,
            answers?: string
        }> = jsonQuizz.quizzs;



        return quizz.every(e => "title" in e &&
        'imageLink' in e &&
        'blurImage' in e &&
        'blurRate' in e &&
        'answers' in e);
    } catch(e) {
        // Catches the TypeError so the quiz's JSON structure is invalid
        return false;
    }
}

async function createQuizEmbed(title: string, imageFileName?: string, attachment?: AttachmentBuilder): Promise<Options> {
    
    const options: Options = {};
    const embed: EmbedBuilder = new EmbedBuilder()
            .setColor("#FD5E53")
            .setTitle(title)

    if (typeof attachment !== 'undefined' && typeof imageFileName !== 'undefined') {
        embed.setImage('attachment://' + imageFileName);
        options['files'] = [attachment];
    }
    options['embeds'] = [embed];
    return options;
}


type Options = {
    embeds?: EmbedBuilder[], 
    files?: AttachmentBuilder[]
}
