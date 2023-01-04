import { Events, Interaction, TextChannel } from "discord.js";
import { sendQuizzMessage } from "../functions/quizz";

export = {
    name: Events.InteractionCreate,
    async execute(redisClient: any, interaction: Interaction) {
        if (!interaction.isStringSelectMenu()) return;
        if (!(interaction.customId == 'selectquiz')) return;

        const quizzName = interaction.values[0];
        const channel: TextChannel = interaction.channel as TextChannel;
        const userId = interaction.user.id;

        await interaction.reply("Quizz is starting !");

        await sendQuizzMessage(quizzName, userId, channel, redisClient);

        // Launch


        // for (let idx=0; idx < quizz.length; idx++) {
        //     console.log(quizz[idx].answers)
        //     const filter = (m: Message) => compareAnswers(m.content, quizz[idx].answers,false);
        //     console.log('filtered')
        //     embed.setImage(quizz[idx].imageLink);
        //     embed.setDescription(quizz[idx].answers);
        //     channel.send({embeds: [embed]})
        //     const collector = channel.createMessageCollector({ filter, max: 1, time: 30000 });
        //     await new Promise(resolve => collector.once('collect', async (message) => {

        //         resolve(message);
        //     }));


        // }

        // for (const quiz of quizz) {
        //     const filter = (m: Message) => compareAnswers(m.content, quiz.answers,false);
        //     embed.setImage(quiz.imageLink);
        //     await channel.send({embeds: [embed]}).then(() => {
        //         channel.awaitMessages({filter,
        //             max: 1,
        //             time: 30000,
        //             errors: ['time']
        //         })
        //         .then(collected => {
        //             const message = collected.first();
        //             message?.reply(`Correct! ❤`)
        //         })
        //         .catch(() => {
        //             channel.send('BUU BUU DESUWAAA !! Looks like nobody got the answer this time.');
        //         })
        //     })
        // }
    }
}
