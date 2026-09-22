import { AttachmentBuilder, EmbedBuilder, Events, Interaction } from "discord.js";
import { downloadMusic } from "../functions/music-fetch";

export = {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction) {
        if (!interaction.isStringSelectMenu()) return;
        if (interaction.customId !== 'selectmusic') return;

        await interaction.deferReply({ ephemeral: true });

        try {
            const fetchedMusic = await downloadMusic(interaction.values[0]);
            if (fetchedMusic.succeed) {
                await interaction.editReply({ files: [new AttachmentBuilder(fetchedMusic.data?.buffer as Buffer, {name: `${fetchedMusic.data?.title}.ogg`})] })
            } else {
                const embed: EmbedBuilder = new EmbedBuilder()
                                                .setColor("#FD5E53")
                                                .setURL(fetchedMusic.data.audio_url as string)
                                                .setTitle(fetchedMusic.data.title)
                                                .setDescription("An issue occured while generating the audio file, click on the title above to get the audio")
                await interaction.editReply({ embeds: [embed] })
            }
            if (interaction.channel?.isSendable()) {
                await interaction.channel.send({ content: `${interaction.user.displayName} listens to [${fetchedMusic.data?.title}](${fetchedMusic.data?.link})` })
            }

        } catch (e) {
            await interaction.editReply({ content: 'Sorry, there was an issue while fetching musics...' });
        }
    }
}