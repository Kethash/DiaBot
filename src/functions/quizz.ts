import axios from "axios";
import {ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Interaction, Message, MessageCreateOptions, ModalMessageModalSubmitInteraction, ModalSubmitInteraction, PartialMessage, StageChannel, TextBasedChannel } from "discord.js";
import sharp from "sharp";

let noEmotes = [
    '<:Hanano:964268713740222484>',
    '<:Hanayokotta:964268716781101086>',
    '<:Bubudesuwa:809220132319526932>',
    '<:DiaSmile:827687467175903252>',
    '<:UmiPokerFace:809208838291980348>',
    '<:ayumunohope:983437653628293201>',
    '<:WutHonoka:809208443344912385>',
    '<:youdisapointed:854422826626056192>',
    '<:yuonegai:983437684859097140>'
];

let yesEmotes = [
    '<:YouThumbsUp:864644229539299328>',
    '<:DiaLUL:809220806331990037>',
    '<:UmiHappy:974431334330142750>',
    '<:kanatablade:983426928109318206>',
    '<:lanzhuproud:983437667033317466>',
    '<:MariJoke:809219775451627591>',
    '<:SetsunaFire:809221805985497138>',
    '<:rubycool:853950147917381672>',
    '<:eliapprove:964271606379724943>'
];

export async function sendQuizzMessage(quizzName: string, userId: string, channel: Exclude<TextBasedChannel, StageChannel>, redisClient: any, gameId: string | null ): Promise<void> {
    const quizzs: Array<{ title: string, imageLink: string, blurImage: boolean, blurRate: number, answers: string }> = await redisClient.json.get(quizzName, { path: '.quizzs' });

    const question = quizzs[Math.floor(Math.random() * quizzs.length)];

    let options: Options = {};

    if (question.imageLink) {
        try {
            const imageResponse = await axios.get(question.imageLink, { responseType: 'arraybuffer' });
            let buffer = (imageResponse).data as Buffer;

            if (question?.blurImage === true) buffer = await sharp(buffer).blur(question.blurRate).toBuffer();

            const urlFileExtension = question.imageLink.substring(question.imageLink.lastIndexOf('.') + 1);

            const actualFileExtension = (urlFileExtension.length >= 3 && urlFileExtension.length <= 4) ?
                urlFileExtension : imageResponse.headers['content-type']?.substring(imageResponse.headers['content-type'].lastIndexOf('/') + 1);

            const imageFileName = 'image.' + actualFileExtension;

            const ImageAttachment = new AttachmentBuilder(buffer, { name: imageFileName });

            options = await createQuizEmbed(
                question?.title ?? "What is the title of this song ? Reply to this message to respond :)",
                imageFileName,
                ImageAttachment,
                gameId
            );
        } catch (e) {
            // Temp fix to prevent Dia bot crashing.
            options = await createQuizEmbed("Error getting quizz images, you should update your images links !");
        }
    } else options = await createQuizEmbed(question?.title ?? "What is the title of this song ? Reply to this message to respond :)", undefined, undefined, gameId);

    const message = await channel.send(options);

    redisClient.json.set(`answer:${message.id}`, '.', {
        author_id: userId,
        quizz_message_id: message.id,
        answers: question.answers,
        quizz_id: quizzName,
        gameId: gameId,
        message_created_at: message.createdAt
    });
}


// Quiz answer by message replying
export async function replyQuizzAnswer(successToAnswer: boolean, answer: any, message: Message | PartialMessage): Promise<boolean> {
    const yesEmote = yesEmotes[Math.floor(Math.random() * yesEmotes.length)];
    const noEmote = noEmotes[Math.floor(Math.random() * noEmotes.length)];

    if (successToAnswer) {
        await message.reply(`${yesEmote} Correct ! ❤ ${yesEmote}`);
        return true;
    }
    else {
        await message.reply(`${noEmote} BUU BUU DESUWA ! ${noEmote}\n Corrects answers were : \n - ${answer.answers.replaceAll(';', '\n - ')} `);
        return false;
    }
}

// Quiz answer by modal submitting
export async function replyQuizzAnswerModal(successToAnswer: boolean, answer: any, interaction: ModalSubmitInteraction): Promise<boolean> {
    const yesEmote = yesEmotes[Math.floor(Math.random() * yesEmotes.length)];
    const noEmote = noEmotes[Math.floor(Math.random() * noEmotes.length)];

    if (successToAnswer) {
        await interaction.reply(`${yesEmote} Correct ! ❤ ${yesEmote}`);
        return true;
    }
    else {
        await interaction.reply(`${noEmote} BUU BUU DESUWA ! ${noEmote}\n Corrects answers were : \n - ${answer.answers.replaceAll(';', '\n - ')} `);
        return false;
    }
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
    } catch (e) {
        // Catches the TypeError so the quiz's JSON structure is invalid
        return false;
    }
}

async function createQuizEmbed(title: string, imageFileName?: string, attachment?: AttachmentBuilder, gameId?: string | null ): Promise<Options> {

    const options: Options = {};
    const embed: EmbedBuilder = new EmbedBuilder()
        .setColor("#FD5E53")
        .setTitle(title)

    const answerButtonComponent = new ButtonBuilder()
                                .setLabel('Answer')
                                .setCustomId('answer-button')
                                .setStyle(ButtonStyle.Success)

    if (!gameId) {
        const skipButtonComponent = new ButtonBuilder()
        .setCustomId('skip')
        .setEmoji('⏭️')
        .setStyle(ButtonStyle.Primary);

        const row: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(skipButtonComponent)
            .addComponents(answerButtonComponent);

        options['components'] = [row];
    } else {
        const row: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(answerButtonComponent);
        
        options['components'] = [row];
    }


    if (typeof attachment !== 'undefined' && typeof imageFileName !== 'undefined') {
        embed.setImage('attachment://' + imageFileName);
        options['files'] = [attachment];
    }
    options['embeds'] = [embed];
    return options;
}


type Options = MessageCreateOptions;

export type Player = {
    score: number,
    response_times: number[],
    user_id: string,
    user_name: string
    mean_response_time: number | null
}