import { SlashCommandBuilder } from "discord.js";

export = {
    data: new SlashCommandBuilder()
        .setName('setloveleavetime')
        .setDescription("Set the time (in minutes) before triggering loveleave")
        .addIntegerOption(option =>
            option.setName('time')
                .setDescription('The amount of time (in minutes)')
                .setRequired(true)),

    async execute(interaction: any, redisClient: any) {
        const newTime: number = interaction.options.get('time').value;
        await redisClient.set('loveleavetime', newTime);

        await interaction.reply({content: `Loveleavetime set on: ${newTime} minutes`, ephemeral: true});
    }
}