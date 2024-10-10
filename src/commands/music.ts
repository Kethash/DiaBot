import { ActionRowBuilder, AttachmentBuilder, CacheType, ChatInputCommandInteraction, Collection, ComponentType, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, User } from 'discord.js';
import { getMusicbyTitle } from '../middlewares/music-operations';
import { RedisClientType } from 'redis';
import { downloadMusic } from '../functions/music-fetch';

export = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Play a lovelive music')
        .addStringOption(option =>
            option.setName('title')
                .setDescription("Search a lovelive music by title")
                .setRequired(true)
        ),

    async execute(redisClient: RedisClientType, interaction: ChatInputCommandInteraction<CacheType>) {
        const title: string | null = interaction.options.get('title') ? (interaction.options.get('title')?.value as string).toLowerCase() : null;

        if (title === null) {
            await interaction.reply({ content: 'You must fill any option !', ephemeral: true });
            return;
        }

        let musicList: any[] = [];

        if (title != null) {
            musicList = await getMusicbyTitle(title);
            if (musicList.length === 0) {
                await interaction.reply({ content: 'Nothing found...', ephemeral: true });
                return;
            }
            else if (musicList.length > 25) musicList = musicList.slice(0,24);
        }

        const options: {label: string, description: string, value: string}[] = [] 
        musicList.forEach(e => {
            options.push({
                label: e.title,
                description: e.group,
                value: e.title
            })
        });

        const row: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('selectmusic')
                .setPlaceholder('Please select a music')
                .addOptions(options),
        );

        const embed: EmbedBuilder = new EmbedBuilder()
        .setColor("#FD5E53")
        .setTitle('I found these, select your music');
        
        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
        
        // const collector = response_message.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60_000 });

        // collector.on("collect", async (i: any) => {
        //     interaction.editReply({content: i.values[0], components: [], embeds: []});

        //     try {
        //         const fetchedMusic = await downloadMusic(i.values[0]);
        //         await i.reply({ files: [new AttachmentBuilder(fetchedMusic.data?.buffer as Buffer, {name: `${fetchedMusic.data?.title}.ogg`})], ephemeral: true })
        //         if (i.channel?.isSendable()) {
        //             await i.channel.send({ content: `${interaction.user.displayName} listens to [${fetchedMusic.data?.title}](${fetchedMusic.data?.link})` })
        //         }

        //     } catch (e) {
        //         await interaction.editReply({ content: 'Sorry, there was an issue while fetching musics...'});
        //     }
        //     collector.stop("response_collected");
        // });

        // collector.on("end", async (_collected: Collection<string, StringSelectMenuInteraction<CacheType>>, reason: string) => {
        //     switch (reason) {
        //         case "response_collected": {
        //             return;
        //         }
        //         case 'time': {
        //             interaction.editReply({content: "Nothing is selected for 1 minute. Aborting...", components: [], embeds: []});
        //         }
        //     }
        // })
    }
}