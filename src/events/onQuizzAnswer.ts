import { EmbedBuilder, Events, Message, MessageType, StageChannel, TextBasedChannel, TextChannel, userMention } from "discord.js";
import { compareAnswers } from "../functions/answer-parsing";
import {sendQuizzMessage, replyQuizzAnswer, Player} from "../functions/quizz";
import config from "../../config.json"

export = {
    name: Events.MessageCreate,
    async execute(redisClient: any, message: Message) {
        if (message.author.bot) return;
        if (!(message.type === MessageType.Reply)) return;

        const repliedTo = await (message.channel as Exclude<TextBasedChannel, StageChannel>).messages.fetch(message.reference?.messageId as string);

        if (repliedTo.author.id !== config.clientID) return;

        let answer = await redisClient.json.get(`answer:${message.reference?.messageId}`, '.');
        if (answer === null) return; // Prevent from multiple responses when players play together

        let successToAnswer = answer.answers.split(';').some((answerString: string) => compareAnswers(message.content, answerString, answer?.isStrict ?? false));

        let game = null;

        // Multiplayer : Player score Update
        if(answer.gameId){
            game = await redisClient.json.get(`quizz:multiplayer:lobby:${answer.gameId}`, '.');
            if(game.actualQuizzCount >= game.quizzEndCounter || !game.players[message.author.id]){
                return;
            }

            game.actualQuizzCount++;
            if (await replyQuizzAnswer(successToAnswer, answer, message)) game.players[message.author.id].score++;
            // let quizzCreatedAt = new Date(game.players[message.author.id].message_created_at);
            let quizzCreatedAt = new Date(answer.message_created_at);
            let replyCreatedAt = message.createdAt;
            // DEBUG
            // console.log("createdAt", quizzCreatedAt, replyCreatedAt)
            const responseTimeInSecond = (replyCreatedAt.getTime() - quizzCreatedAt.getTime()) / 1000;
            game.players[message.author.id].response_times.push(responseTimeInSecond);

            await redisClient.json.set(`quizz:multiplayer:lobby:${answer.gameId}`, '.', game);
        } else {
            await replyQuizzAnswer(successToAnswer, answer, message);
        }

        // Suppression clef
        await redisClient.json.del(`answer:${message.reference?.messageId}`, '.');

        let playerProfile = await redisClient.json.get(`answer:player:${message.author.id}`, '.');
        if (playerProfile === null) playerProfile = {};
        if (!playerProfile.quizzs) playerProfile.quizzs = {};
        if (!playerProfile.quizzs[answer.quizz_id]) {
            playerProfile.quizzs[answer.quizz_id] = { playCount: 0, quizz_id: answer.quizz_id };
        }
        playerProfile.quizzs[answer.quizz_id].playCount++;
        await redisClient.json.set(`answer:player:${message.author.id}`, '.', playerProfile);

        // Multiplayer : End game message
        if(game && game.actualQuizzCount === game.quizzEndCounter){
            let winners: Player[] = Object.values(game.players);

            // Reversing the sorting because embeds add fields backwards.
            winners = winners.sort((player1: Player, player2: Player) => {
                let player1Score = player1.score;
                let player2Score = player2.score;

                if(player1Score < player2Score){
                    return 1;
                }
                if(player1Score > player2Score){
                    return -1;
                }
                return 0;
            });

            winners = winners.map((player) =>{
                if(player.response_times.length === 0){
                    player.mean_response_time = 0;
                    return player;
                }

                let meanResponseTime = player.response_times.reduce<number>((accumulator, currentValue) => accumulator + currentValue, 0);
                player.mean_response_time = meanResponseTime / player.response_times.length;

                return player;
            }) as Player[];

            const description: string = !winners.every((player: Player) => player.score === 0) ? "<:SetsunaFire:809221805985497138> Congrats to the winner of the party " + userMention(winners[0].user_id) + " ! <:kanatablade:983426928109318206>" : "It's a draw !!!";

            const scores_embed: EmbedBuilder = new EmbedBuilder()
                .setColor('#F23B4C')
                .setTitle("Scores")
                .setDescription(description)

            winners.forEach((p: Player, index: number) =>
                scores_embed.addFields({
                    name: `# ${index+1}`,
                    value: `${userMention(p.user_id)}\n${p.score} points\nMean response time: ${p.mean_response_time?.toFixed(3)}s`,
                    inline: false
                })
            );

            message.reply({content: `${description}`, embeds: [scores_embed]});

            return;
        }

        const quizzName = answer.quizz_id;
        const channel: Exclude<TextBasedChannel, StageChannel> = message.channel as Exclude<TextBasedChannel, StageChannel>;
        const userId = message.author.id;

        await sendQuizzMessage(quizzName, userId, channel, redisClient, answer.gameId);
    }
}
