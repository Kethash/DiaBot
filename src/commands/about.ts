import { EmbedBuilder, SlashCommandBuilder, User } from 'discord.js';

export = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('About Dia saaan !'),
    async execute(interaction: any) {

        const botAuthor: User = await interaction.guild.members.cache.get('818224462809006103')

        const exampleEmbed = new EmbedBuilder()
            .setColor('#FD5E53')
            .setTitle('About me')
            .setAuthor({ name: 'Dia Kurosawa' })
            .setDescription("I'm Dia (DA-I-A) Kurosawa !\nI'm here to entertain you through my idol magic ! ちゃんと感謝しなさいよね！")
            .setThumbnail('https://pbs.twimg.com/profile_images/1471849547659988992/KdQh_Th2_400x400.jpg')
            .addFields(
                { name: 'GitHub project link', value: 'https://github.com/Kethash/DiaBot' },
                { name: 'Developper', value: botAuthor.toString() }
            )
            .setTimestamp(new Date());

        await interaction.reply({ embeds: [exampleEmbed], ephemeral: true });

    }
}