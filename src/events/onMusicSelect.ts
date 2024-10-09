import { AttachmentBuilder, Events, Interaction, PartialGroupDMChannel, TextBasedChannel } from "discord.js";
import { downloadMusic } from "../functions/music-fetch";

export = {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction) {
        if (!interaction.isStringSelectMenu()) return;
        if (interaction.customId !== 'selectmusic') return;

        try {
            const fetchedMusic = await downloadMusic(interaction.values[0]);
            if (interaction.channel?.isSendable()) {
                await interaction.channel.send({ content: `${interaction.user.displayName} has requested ${fetchedMusic.data?.title}` })
            }
            await interaction.reply({ files: [new AttachmentBuilder(fetchedMusic.data?.buffer as Buffer, {name: `${fetchedMusic.data?.title}.ogg`})], ephemeral: true })

        } catch {
            await interaction.reply({ content: 'Sorry, there was an issue while fetching musics...', ephemeral: true });
        }
    }
}