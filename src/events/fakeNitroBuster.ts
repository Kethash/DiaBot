import { EmbedBuilder, Message } from "discord.js"

const prefixLinks = ["https://","http://"]
const bannedNitroWords = ["nitro","discord","discrod","gift","giveaway"]

export = {
    name: 'messageCreate',
    execute(message: Message) {
        if (message.author.bot) return;
        
        const content = message.content.toLowerCase();
        if (prefixLinks.some(el => content.includes(el)) && bannedNitroWords.some(el => content.includes(el))) {
            const embed: EmbedBuilder = new EmbedBuilder()
                .setTitle("BUU BUU SUSPICIOUS LINK DESUWAA !!!!")
                .setDescription(`${message.author.toString()}: ${message.content.toString()}`)
                .addFields(
                    {
                        name: 'Message link',
                        value: `${message.url.toString()}`
                    }
                );
            message.reply({embeds: [embed]});
        }

    }
}