import { createConfig, getGuildConfig } from "../controllers/server-configs";
import { SlashCommandBuilder } from "discord.js";
import { serverconfig, ServerConfigSchema } from "../models/diatabase";
import { setloveleavetime } from "../middlewares/server-config-operations";

export = {
    data: new SlashCommandBuilder()
        .setName('setloveleavetime')
        .setDescription("Set the time (in minutes) before triggering loveleave")
        .addIntegerOption(option =>
            option.setName('time')
                .setDescription('The amount of time (in minutes)')
                .setRequired(true)),

    async execute(redisClient:any, interaction: any) {
        const newTime: number = interaction.options.get('time').value;
        let serverConfig: ServerConfigSchema | null = await getGuildConfig(interaction.guild.id);
        if (serverConfig == null) {
            serverConfig = await createConfig(interaction.guild.id, interaction.guild.name);
        }
        try {
            setloveleavetime(serverConfig.entityId,newTime);
        } catch {
            await interaction.reply({content: "Couldn't set the new loveleave! time. I'm sorry...", ephemeral: true});
            return;
        }

        if (!serverConfig.loveleaveChannelSetup) {
            await interaction.reply({content: `Loveleavetime set on: ${newTime} minutes\n
            Be careful you didn't set any channel to display loveleavers 
            please use /setloveleavechannel <channelId> to define one`, ephemeral: true});
            return;
        }

        await interaction.reply({content: `Loveleavetime set on: ${newTime} minutes`, ephemeral: true});
    }
}