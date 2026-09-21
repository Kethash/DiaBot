import { ActionRowBuilder, AttachmentBuilder, CacheType, ChatInputCommandInteraction, Collection, ComponentType, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuComponent, StringSelectMenuInteraction, StringSelectMenuOptionBuilder, User } from 'discord.js';
import { getMusicbyTitle } from '../middlewares/music-operations';
import { RedisClientType } from 'redis';
import { downloadMusic } from '../functions/music-fetch';
import { setEngine } from 'crypto';

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

        const musicSeen = new Set();
        let uniquemusicList = musicList.filter(music => {
            const duplicate = musicSeen.has(music.title);
            musicSeen.add(music.title);
            return !duplicate;
        })

        const options: Array<StringSelectMenuOptionBuilder> = [] 
        uniquemusicList.forEach(e => {
            let option: StringSelectMenuOptionBuilder = new StringSelectMenuOptionBuilder()
                        .setLabel(e.title)
                        .setDescription(e.group)
                        .setValue(e.title)
            options.push(option);
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