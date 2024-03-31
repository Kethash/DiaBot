import { ActionRow, ActionRowBuilder, ActionRowComponent, ButtonBuilder, ButtonComponent, EmbedBuilder, Events, Message, MessageActionRowComponent, MessageComponent, ModalSubmitInteraction, StageChannel, TextBasedChannel, userMention } from "discord.js";
import { compareAnswers } from "../functions/answer-parsing";
import { RedisClientType } from "redis";
import { Player, replyQuizzAnswerModal, sendQuizzMessage } from "../functions/quizz";

export = {
    name: Events.InteractionCreate,
    async execute(redisClient: RedisClientType, interaction: ModalSubmitInteraction) {
        if (!interaction.isModalSubmit()) return;

        const messageId: string = interaction.customId.split(':')[1];
        const answer: any = await redisClient.json.get(`answer:${messageId}`, { path: '.' });
        const userAnswer: string = interaction.fields.getTextInputValue(`answer-input:${messageId}`);
        if (answer === null) return; // Prevent from multiple responses when players play together
        const successToAnswer = answer.answers.split(';').some((answerString: string) => compareAnswers(userAnswer, answerString, answer?.isStrict ?? false));

        // Multiplayer : Player score Update
        let game: any = null;

        const messageReference = await interaction.channel?.messages.fetch(messageId) as Message;
        const authorId = messageReference.author.id;

        await messageReference.reply({content: `${interaction.user.displayName} (${interaction.user.globalName}) wrote: ${userAnswer}`});

        if(answer.gameId) {
            game = await redisClient.json.get(`quizz:multiplayer:lobby:${answer.gameId}`, { path: '.' });
            if (game.actualQuizzCount >= game.quizzEndCounter || !game.players[authorId]) {
                return;
            }

            game.actualQuizzCount++;
            if (await replyQuizzAnswerModal(successToAnswer, answer, interaction)) game.players[authorId].score++;
            else game.players[authorId].score--;
            // let quizzCreatedAt = new Date(game.players[message.author.id].message_created_at);
            let quizzCreatedAt = new Date(answer.message_created_at);
            let replyCreatedAt = messageReference.createdAt;
            // DEBUG
            // console.log("createdAt", quizzCreatedAt, replyCreatedAt)
            const responseTimeInSecond = (replyCreatedAt.getTime() - quizzCreatedAt.getTime()) / 1000;
            game.players[authorId].response_times.push(responseTimeInSecond);

            await redisClient.json.set(`quizz:multiplayer:lobby:${answer.gameId}`, '.', game);
        } else {
            await replyQuizzAnswerModal(successToAnswer, answer, interaction);
        }

        // Suppression clef
        await redisClient.json.del(`answer:${messageReference.id}`, '.');
        const buttonActionRow: ActionRow<MessageActionRowComponent> = messageReference.components[0];
        const disabledButtonActionRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>();
        buttonActionRow.components.forEach((component: MessageComponent) => {
            if (!(component instanceof ButtonComponent)) return;
            const newButton = ButtonBuilder.from(component);
            newButton.setDisabled(true);
            disabledButtonActionRow.addComponents(newButton);
        });

        await messageReference.edit({components: [disabledButtonActionRow]});

        let playerProfile: any = await redisClient.json.get(`answer:player:${authorId}`, { path: '.' });
        if (playerProfile === null) playerProfile = {};
        if (!playerProfile.quizzs) playerProfile.quizzs = {};
        if (!playerProfile.quizzs[answer.quizz_id]) {
            playerProfile.quizzs[answer.quizz_id] = { playCount: 0, quizz_id: answer.quizz_id };
        }
        playerProfile.quizzs[answer.quizz_id].playCount++;
        await redisClient.json.set(`answer:player:${authorId}`, '.', playerProfile);

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

            interaction.reply({content: `${description}`, embeds: [scores_embed]});

            return;
        }

        const quizzName = answer.quizz_id;
        const channel: Exclude<TextBasedChannel, StageChannel> = messageReference.channel as Exclude<TextBasedChannel, StageChannel>;

        await sendQuizzMessage(quizzName, authorId, channel, redisClient, answer.gameId);


    }
}