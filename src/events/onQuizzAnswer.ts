import { Events, Message, MessageType, TextChannel } from "discord.js";
import { compareAnswers } from "../functions/answer-parsing";
import {sendQuizzMessage, replyQuizzAnswer, Player} from "../functions/quizz";
import config from "../../config.json"

export = {
    name: Events.MessageCreate,
    async execute(redisClient: any, message: Message) {
        if (message.author.bot) return;
        if (!(message.type === MessageType.Reply)) return;

        const repliedTo = await message.channel.messages.fetch(message.reference?.messageId as string);

        if (repliedTo.author.id !== config.clientID) return;

        let answer = await redisClient.json.get(`answer:${message.reference?.messageId}`, '.');
        if (answer === null) return; // Prevent from multiple responses when players play together

        let successToAnswer = answer.answers.split(';').some((answerString: string) => compareAnswers(message.content, answerString, answer?.isStrict ?? false));

        let game = null;

        // Multiplayer : Player score Update
        if(answer.game_id){
            game = await redisClient.json.get(`quizz:multiplayer:lobby:${answer.game_id}`);

            if(game.actualQuizzCount >= game.quizzEndCounter || !game.players[message.author.id]){
                return;
            }

            game.actualQuizzCount++;
            game.players[message.author.id].score++;
            let quizzCreatedAt = new Date(game.players[message.author.id].message_created_at);
            let replyCreatedAt = message.createdAt;
            console.log("createdAt", quizzCreatedAt, replyCreatedAt)
            let responseTimeInSecond = (replyCreatedAt.getTime() - quizzCreatedAt.getTime()) / 1000;
            game.players[message.author.id].response_times.push(responseTimeInSecond);

            await redisClient.json.set(`quizz:multiplayer:lobby:${answer.game_id}`, game);
        }

        await replyQuizzAnswer(successToAnswer, answer, message);

        // Suppression clef
        await redisClient.json.del(`answer:${message.reference?.messageId}`, '.');

        let playerProfile = await redisClient.json.get(`answer:player:${message.author.id}`, '.');
        if (playerProfile === null) playerProfile = { };
        if (!playerProfile.quizzs) playerProfile.quizzs = {};
        if (!playerProfile.quizzs[answer.quizz_id]) {
            playerProfile.quizzs[answer.quizz_id] = { playCount: 0, quizz_id: answer.quizz_id };
        }
        playerProfile.quizzs[answer.quizz_id].playCount++;
        await redisClient.json.set(`answer:player:${message.author.id}`, '.', playerProfile);

        // Multiplayer : End game message
        if(game && game.actualQuizzCount === game.quizzEndCounter){
            console.log(game.players)
            let winners: Player[] = Object.values(game.players);

            winners = winners.sort((player1: Player, player2: Player) => {
                let player1Score = player1.score;
                let player2Score = player2.score;

                if(player1Score < player2Score){
                    return -1;
                }
                if(player1Score > player2Score){
                    return 1;
                }
                return 0;
            });
            console.log(winners)

            winners = winners.map((player) =>{
                let meanResponseTime = player.response_times.reduce<number>((accumulator, currentValue) => accumulator + currentValue, 0);
                if(meanResponseTime === 0){
                    return 0;
                }
                player.mean_response_time = meanResponseTime / player.response_times.length;
                console.log(player.mean_response_time)
                return player;
            }) as Player[];

            let description = "Congrats to the winner of the party " + "<@" + winners[0].user_id + "> ! <:kanatablade:983426928109318206> \n " +
                "Scores <:SetsunaFire:809221805985497138> \n";
            description = winners.reduce<string>(
                (accumulator, currentValue, index) =>
                    accumulator + "# " + index + " : <@" + winners[index].user_id + "> : " + winners[index].score + " points, "
                    + winners[index].mean_response_time,
                ""
            );

            console.log(description)

            message.reply(description);

            return;
        }

        const quizzName = answer.quizz_id;
        const channel: TextChannel = message.channel as TextChannel;
        const userId = message.author.id;

        await sendQuizzMessage(quizzName, userId, channel, redisClient, answer.game_id);
    }
}
