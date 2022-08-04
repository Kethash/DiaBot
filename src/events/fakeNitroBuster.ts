import { Message } from "discord.js"

const bannedNitroWords = ["https://", "nitro"]

export = {
    name: 'messageCreate',
    execute(message: Message) {
        if (message.author.bot) return;
        
        const content = message.content.toLowerCase();
        if (bannedNitroWords.every(el => content.includes(el))) {
            message.reply("BUU BUU DESUWA !");
        }

    }
}