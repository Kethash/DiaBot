import { ActionRowBuilder, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder, User } from 'discord.js';
import { getMusicbyGroup, getMusicbyTitle } from '../middlewares/music-operations';
import { RedisClientType } from 'redis';
import { Music } from '../models/music';
import { downloadMusic } from '../functions/music-fetch';

export = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Play a lovelive music')
        .addStringOption(option =>
            option.setName('title')
                .setDescription("Search a lovelive music by title")
                .setRequired(false)
        ).addStringOption(option =>
            option.setName('group')
                .setDescription("Search musics by group name")
                .setRequired(false)
        ),
    async execute(redisClient: RedisClientType, interaction: any) {
        const title: string | null = interaction.options.get('title') ? (interaction.options.get('title')?.value as string).toLowerCase() : null;
        const group: string | null = interaction.options.get('group') ? interaction.options.get('group')?.value as string : null;
        
        if ([title, group].every(e => e === null)) {
            await interaction.reply({ content: 'You must fill any option !', ephemeral: true });
            return;
        }

        let musicList: any[] = [];

        if (title != null) {
            console.log("plop");
            musicList = await getMusicbyTitle(title);
        } else if (group != null) {
            console.log("plopplop");
            musicList = await getMusicbyGroup(group);
        }

        const options: {label: string, description: string, value: string}[] = [] 
        musicList.forEach(e => {
            options.push({
                label: e.title,
                description: e.group,
                value: e.audio_url
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