import { AttachmentBuilder, Events, Interaction, PartialGroupDMChannel, TextBasedChannel } from "discord.js";
import { downloadMusic } from "../functions/music-fetch";

export = {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction) {
        if (!interaction.isStringSelectMenu()) return;
        if (interaction.customId !== 'selectmusic') return;

        try {
            const fetchedMusic = await downloadMusic(interaction.values[0]);
            await interaction.reply({ files: [new AttachmentBuilder(fetchedMusic.data as Buffer, {name: 'musicfile.ogg'})], ephemeral: true })

        } catch {
            await interaction.reply({ content: 'Sorry, there was an issue while fetching musics...', ephemeral: true });
        }
    }
}