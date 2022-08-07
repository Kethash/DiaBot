import { SlashCommandBuilder } from 'discord.js';

export = {
    data: new SlashCommandBuilder()
            .setName('ping')
            .setDescription('Replies with Pong!'),
    async execute(interaction: { reply: (arg0: Object) => any; }) {
        await interaction.reply({content: 'Pong! test', ephemeral: true});
    }
}
