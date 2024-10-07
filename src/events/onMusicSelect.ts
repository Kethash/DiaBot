import { AttachmentBuilder, Events, Interaction } from "discord.js";
import { downloadMusic } from "../functions/music-fetch";

export = {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction) {
        if (!interaction.isStringSelectMenu()) return;
        if (!(interaction.customId == 'selectmusic')) return;

        const fetchedMusic = await downloadMusic(interaction.values[0]);
        if (fetchedMusic.succeed === false) {
            await interaction.reply({ content: 'Sorry, there was an issue while fetching musics...', ephemeral: true });
            return;
        }

        await interaction.reply({ files: [new AttachmentBuilder(fetchedMusic.data as Buffer, {name: 'musicfile'})], ephemeral: true })
    }
}