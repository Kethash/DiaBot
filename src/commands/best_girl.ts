import { SlashCommandBuilder } from "discord.js";

export = {
    data: new SlashCommandBuilder()
        .setName('best_girl')
        .setDescription('Choose your best girl')
        .addStringOption(option =>
            option.setName('3rd_year')
                .setDescription('The best girl')
                .setRequired(true)
                .addChoices(
                    { name: 'Dia', value: 'Dia' },
                    { name: 'Kanan', value: 'Kanan' },
                    { name: 'Mari', value: 'Mari' },
                ))
        .addStringOption(option =>
            option.setName('2nd_year')
                .setDescription('The best girl')
                .setRequired(true)
                .addChoices(
                    { name: 'Chika', value: 'Chika' },
                    { name: 'You', value: 'You' },
                    { name: 'Riko', value: 'Riko' },
                )),
    async execute(interaction: any) {
        const year3: string = interaction.options.get('3rd_year').value;
        const year2: string = interaction.options.get('2nd_year').value;
        await interaction.reply(`${year3} - ${year2}`);
    }
}