import { Collection, EmbedBuilder, Events, GuildMember, Role, Snowflake, TextChannel } from "discord.js";

export = {
    name: Events.GuildMemberAdd,
    async execute(member: GuildMember): Promise<void> {
        setTimeout(async () => {
            if (!(await member.guild.members.fetch(member.id))) return;
            // if (member.guild.id !== "584018480853155842" || member.guild.id === null) return;
            const roles: Collection<Snowflake, Role> = member.roles.valueOf();
            // Check if the roles are [Tomoriru, Belgique, Membre]
            const number: boolean = roles.size == 3;
            // Hard coded because I am too lazy to include this in Redis 
            // const hasRoles: boolean = roles.some((val) => ["Tomoriru", "Belgique", "Membre"].includes(val.name));
            const hasRoles: boolean = ["Tomoriru", "Belgique", "Membre"].every(val => roles.find((key) => key.name === val));

            if ([hasRoles, number].every(e => e === true)) {
                const channel: TextChannel = member.guild.channels.cache.get("807908826840825856") as TextChannel;
                const botSpottedEmbed: EmbedBuilder = new EmbedBuilder()
                                                            .setTitle('Bot ?')
                                                            .setDescription("🤖")
                                                            .setColor("#FD5E53");
                channel.send({ embeds: [botSpottedEmbed]});
            }
        }, 1000 * 60);
    }
}