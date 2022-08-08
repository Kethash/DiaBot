import { channelLink, GuildChannel, SlashCommandBuilder } from "discord.js";

export = {
    data: new SlashCommandBuilder()
        .setName('setloveleavechannel')
        .setDescription("Set the channel to display loveleavers")
        .addStringOption(option =>
            option.setName('channelid')
                .setDescription('The channel id you want to display the loveleavers')
                .setRequired(true)),

    async execute(interaction: any, redisClient: any) {
        const newChannel: string = interaction.options.get('channelid').value;
        if (!interaction.guild.channels.cache.find((channel: GuildChannel) => channel.id == newChannel)) {
            await interaction.reply({content: "BUU BUU !! Channel not found", ephemeral: true});
            return;
        }

        await redisClient.set(`${interaction.guild.id.toString()}:loveleavechannel`, newChannel);
        const newChannelName: string = interaction.guild.channels.cache.get(newChannel).toString();

        await interaction.reply({content: `Loveleavechannel set on: ${newChannelName}`, ephemeral: true});
    }
}