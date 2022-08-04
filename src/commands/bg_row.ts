import { ActionRowBuilder, SelectMenuBuilder, SlashCommandBuilder } from "discord.js";

export = {
    data: new SlashCommandBuilder()
                .setName("bg_row")
                .setDescription("Action select best girl version"),
    async execute(interaction: any) {
        const row = new ActionRowBuilder()
        .addComponents(
            new SelectMenuBuilder()
                .setCustomId('best_girl')
                .setPlaceholder('Nothing selected')
                .addOptions(
                    {
                        label: 'Select me',
                        description: 'This is a description',
                        value: 'first_option',
                    },
                    {
                        label: 'You can select me too',
                        description: 'This is also a description',
                        value: 'second_option',
                    },
                ),
        );

        await interaction.reply({ content: 'Who is your best girl ?', components: [row] });
    }
}