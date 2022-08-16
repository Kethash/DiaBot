import { EmbedBuilder, Message, MessageReaction, User } from "discord.js"

const prefixLinks = ["https://","http://"]
const bannedNitroWords = ["nitro","discord","discrod","gift","giveaway"]
const whiteList = ["https://media.discordapp.net/attachments","https://discord.com"]

export = {
    name: 'messageCreate',
    execute(message: Message) {
        if (message.author.bot) return;

        // The embed to send
        const embed: EmbedBuilder = new EmbedBuilder()
                .setTitle("BUU BUU SUSPICIOUS LINK DESUWAA !!!!")
                .setColor('#FD5E53')
                .setDescription(`${message.author.toString()}: ${message.content.toString()}`)
                .addFields(
                    {
                        name: 'Message link',
                        value: `${message.url.toString()}`
                    }
                );
        
        
        const content = message.content.toLowerCase();
        if (whiteList.some(el => content.includes(el))) { return; }
        else if (prefixLinks.some(el => content.includes(el)) && bannedNitroWords.some(el => content.includes(el))) {
            message.react('🏴‍☠️');
            const filter = (reaction: MessageReaction, user: User) => {
                return reaction.emoji.name === '🏴‍☠️';
            };
            
            message.awaitReactions({ filter, max: 10, time: 360000, errors: ['time'] })
                .then(() => message.reply({embeds: [embed]}))
                .catch(() => {return;});
        
        }

    }
}