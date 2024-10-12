import { AttachmentBuilder, Events, Interaction, PartialGroupDMChannel, TextBasedChannel } from "discord.js";
import { downloadMusic } from "../functions/music-fetch";

export = {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction) {
        if (!interaction.isStringSelectMenu()) return;
        if (interaction.customId !== 'selectmusic') return;

        await interaction.deferReply({ ephemeral: true });

        try {
            const fetchedMusic = await downloadMusic(interaction.values[0]);
            await interaction.editReply({ files: [new AttachmentBuilder(fetchedMusic.data?.buffer as Buffer, {name: `${fetchedMusic.data?.title}.ogg`})] })
            if (interaction.channel?.isSendable()) {
                await interaction.channel.send({ content: `${interaction.user.displayName} listens to [${fetchedMusic.data?.title}](${fetchedMusic.data?.link})` })
            }

        } catch (e) {
            await interaction.editReply({ content: 'Sorry, there was an issue while fetching musics...' });
        }
    }
}