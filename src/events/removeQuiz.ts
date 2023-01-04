import { Events, Interaction } from "discord.js";

export = {
    name: Events.InteractionCreate,
    async execute(redisClient: any, interaction: Interaction) {
        if (!interaction.isStringSelectMenu()) return;
        if (!(interaction.customId == 'removequizz')) return;

        const quizzName = interaction.values[0];
        await redisClient.json.del(quizzName);
        await interaction.reply({content: 'Quizz removed successfully', ephemeral: true});
        
    }
}