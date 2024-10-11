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
        
    }
}