export = {
    name: 'interactionCreate',

    async execute(interaction: any) {
        if (!interaction.isSelectMenu()) return;

        if (interaction.customId === 'best_girl') {
            await interaction.update({ content: interaction.values[0], components: [] });
        }
    }
}