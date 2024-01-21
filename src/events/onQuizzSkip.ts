import { Events, TextChannel, Interaction , User, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { sendQuizzMessage, replyQuizzAnswer } from "../functions/quizz";

export = {
    name: Events.InteractionCreate,
    async execute(redisClient: any, interaction: Interaction, user: User) {

        // Was reaction created by the bot
        if (interaction.user.bot) return;
        if (!interaction.isButton()) return;
        if (interaction.customId !== "skip") return;
        
        let answer = await redisClient.json.get(`answer:${interaction.message.id}`, '.');
        if (answer == null) return; // Prevent from multiple responses when players play together

        if(answer.gameId){
            return;
        }

        // Suppression clef
        await redisClient.json.del(`answer:${interaction.message.id}`, '.');

        const channel: TextChannel = interaction.message.channel as TextChannel;

        const disabledButton: any = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('skip')
                .setEmoji('⏭️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true)
        );

        await interaction.update({components: [disabledButton]})

        await replyQuizzAnswer(false, answer, interaction.message);
        await sendQuizzMessage(answer.quizz_id, answer.author_id, channel, redisClient, null);

        return;
    }
}
