import { Events, TextChannel, Interaction , User } from "discord.js";
import { sendQuizzMessage, replyQuizzAnswer } from "../functions/quizz";
import config from "../../config.json"

export = {
    name: Events.InteractionCreate,
    async execute(redisClient: any, interaction: Interaction, user: User) {

        console.log("triggered !");
        // Was reaction created by the bot
        if (interaction.user.bot) return;
        if (!interaction.isButton()) return;
        if (interaction.customId !== "skip") return;
        console.log("triggered 2 !");

        let answer = await redisClient.json.get(`answer:${interaction.message.id}`, '.');
        if (answer == null) return; // Prevent from multiple responses when players play together

        if(answer.gameId){
            return;
        }

        // Suppression clef
        await redisClient.json.del(`answer:${interaction.message.id}`, '.');

        const channel: TextChannel = interaction.message.channel as TextChannel;

        await replyQuizzAnswer(false, answer, interaction.message);
        await sendQuizzMessage(answer.quizz_id, answer.author_id, channel, redisClient, null);

        await interaction.deferUpdate();
        return;
    }
}
