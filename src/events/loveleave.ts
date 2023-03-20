import { getGuildConfig } from "../controllers/server-configs";
import { EmbedBuilder, GuildMember, TextChannel } from "discord.js";
import { ServerConfigSchema } from "../models/diatabase";

function getMinDiff(startDate: Date, endDate: Date): number {
    const msInMinute = 60 * 1000;
  
    return Math.round(
      Math.abs(endDate.getTime() - startDate.getTime()) / msInMinute
    );
}
const leaveMessages = {
    title: 'LoveLeave !',
    description: 'Buu buu desuwa !!'
}

export = {
    name: 'guildMemberRemove',
    async execute(redisClient: any, member: GuildMember) {
        const minutesElapsed: number = member.joinedAt ? getMinDiff(member.joinedAt, new Date()): 99;
        const serverConfig: ServerConfigSchema | null = await getGuildConfig(member.guild.id);
        if (serverConfig == null) return;
        const loveleavetime: number = serverConfig._loveleaveTime;
        const loveleavechannel: string = serverConfig._loveleaveChannelId;
        const channel = member.guild.channels.cache.get(loveleavechannel) as TextChannel;
        if (minutesElapsed > loveleavetime) return;

        const goodbyembed = new EmbedBuilder()
        .setTitle(leaveMessages.title)
        .setAuthor({name: `${member.user.tag}`, iconURL: `${member.user.avatarURL()}`})
        .setDescription(leaveMessages.description)
        .setColor("#FD5E53")
        .setImage("https://media.tenor.com/6oCaYr-1QFsAAAAC/love-live.gif");

        channel.send({embeds: [goodbyembed]});
    }
}