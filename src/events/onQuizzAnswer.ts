import { Embed, EmbedAssertions, EmbedBuilder, Events, Interaction, Message, MessageType, TextChannel, messageLink } from "discord.js";
import { compareAnswers, formatString } from "../functions/answer-parsing";
import { createQuizzMessage } from "../functions/createQuizz";
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

        const yesEmote = yesEmotes[Math.floor(Math.random() * yesEmotes.length)];
        const noEmote = noEmotes[Math.floor(Math.random() * noEmotes.length)];

        if (successToAnswer) message.reply(`${yesEmote} Correct ! ❤ ${yesEmote}`)
        else await message.reply(`${noEmote} BUU BUU DESUWA ! ${noEmote}\n Corrects answers were : \n - ${answer.answers.replaceAll(';', '\n - ')} `)

        // Suppression clef
        await redisClient.json.del(`answer:${message.reference?.messageId}`, '.');

        const quizzName = answer.quizz_id;
        const channel: TextChannel = message.channel as TextChannel;
        const userId = message.author.id;

        await createQuizzMessage(quizzName, userId, channel, redisClient);

    }
}
