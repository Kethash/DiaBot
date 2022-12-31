import { Embed, EmbedAssertions, EmbedBuilder, Events, Interaction, Message, MessageType, TextChannel, messageLink } from "discord.js";
import { compareAnswers, formatString } from "../functions/answer-parsing";
import { createQuizzMessage } from "../functions/createQuizz";


export = {
    name: Events.MessageCreate,
    async execute(redisClient: any, message: Message) {
        if (message.author.bot) return;
        if (!(message.type === MessageType.Reply)) return;
        // console.log(message);
        
        const repliedTo = await message.channel.messages.fetch(message.reference?.messageId as string);
        // console.log('REPLIED TO', repliedTo);
        
        if (repliedTo.author.id !== '1011342333943484528') return;

        let answer = await redisClient.json.get(`answer:${message.reference?.messageId}`, '.');
        
        // console.log('ANSWER', answer);

        let successToAnswer = answer.answers.split(';').some((answerString: string) => compareAnswers(message.content, answerString, answer?.isStrict ?? false));
        console.log(successToAnswer);
        // ぼく　は　Liyuu が　とても　すきです。

        let noEmotes = [
            'Hanano:1058191475508256828',
            'Hanayokotta:1058191475508256828',
            'Bubudesuwa:1058191475508256828',
            'DiaSmile:1058191475508256828',
            'UmiPokerFace:1058191475508256828',
            'ayumunohope:1058191475508256828',
            'WutHonoka:1058191475508256828',
            'youdisapointed:1058191475508256828',
            'yuonegai:1058191475508256828'
        ];

        let yesEmotes = [
            'YouThumbsUp:1058191475508256828',
            'DiaLUL:1058191475508256828',
            'UmiHappy:1058191475508256828',
            'kanatablade:1058191475508256828',
            'lanzhuproud:1058191475508256828',
            'MariJoke:1058191475508256828',
            'SetsunaFire:1058191475508256828',
            'rubycool:1058191475508256828',
            'eliapprove:1058191475508256828'
        ];

        const yesEmote = yesEmotes[Math.floor(Math.random() * yesEmotes.length)];
        const noEmote = yesEmotes[Math.floor(Math.random() * yesEmotes.length)];

        if (successToAnswer) message.reply(`<${yesEmote}> Correct! ❤ <${yesEmote}>`)
        else message.reply(`<${noEmote}> BUU BUU DESUWA ! <${noEmote}>\n Corrects answers were : \n ${answer.answers.replace(';', '\n - ')} `)

        // Suppression clef
        await redisClient.json.del(`answer:${message.reference?.messageId}`, '.');

        const quizzName = answer.quizz_id;
        const channel: TextChannel = message.channel as TextChannel;
        const userId = message.author.id;
        
        await createQuizzMessage(quizzName, userId, channel, redisClient);
      
    }
}