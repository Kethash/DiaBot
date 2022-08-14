import { EmbedBuilder, GuildMember, TextChannel } from "discord.js";

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
        const loveleavetime: number = await redisClient.get('loveleavetime');
        const loveleavechannel: string = await redisClient.get('loveleavechannel')
        const channel = member.guild.channels.cache.get(loveleavechannel) as TextChannel;
        if (minutesElapsed > loveleavetime) return;

        const goodbyembed = new EmbedBuilder()
        .setTitle(leaveMessages.title)
        .setAuthor({name: `${member.user.tag}`, iconURL: `${member.user.avatarURL()}`})
        .setDescription(leaveMessages.description)
        .setColor("#FD5E53");
        channel.send({embeds: [goodbyembed]});
    }
}