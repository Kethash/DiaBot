import { createConfig, getGuildConfig } from "../controllers/server-configs";
import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { ServerConfigSchema } from "../models/diatabase";
import { setloveleavechannel } from "../middlewares/server-config-operations";

export = {
    data: new SlashCommandBuilder()
        .setName('setloveleavechannel')
        .setDescription("Set the channel to display loveleavers")
        .addStringOption(option =>
            option.setName('channelid')
                .setDescription('The channel id you want to display the loveleavers')
                .setRequired(true)),

    async execute(redisClient: any, interaction: ChatInputCommandInteraction<CacheType>) {
        const newChannel: string = interaction.options.get('channelid')?.value as string;
        if (!interaction.guild?.channels.cache.find((channel) => channel.id == newChannel)) {
            await interaction.reply({content: "BUU BUU !! Channel not found", ephemeral: true});
            return;
        }
        let serverConfig: ServerConfigSchema | null = await getGuildConfig(interaction.guild.id);
        if (serverConfig == null) {
            serverConfig = await createConfig(interaction.guild.id, interaction.guild.name);
        }
        try {
            await setloveleavechannel(serverConfig.entityId, newChannel);
        } catch {
            await interaction.reply({content: "Couldn't set the new loveleave! channel. I'm sorry...", ephemeral: true});
            return;
        }

        const newChannelName: string = interaction.guild.channels.cache.get(newChannel)?.toString() as string;
        await interaction.reply({content: `Loveleavechannel set on: ${newChannelName}`, ephemeral: true});
        
    }
}