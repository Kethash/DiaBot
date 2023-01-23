import { ChatInputCommandInteraction, MessageComponentInteraction, TextChannel, channelLink } from "discord.js";
import { sendQuizzMessage} from "./quizz";

export async function createStartGameMessageCollector(redisClient: any, interaction: ChatInputCommandInteraction,quizzId: string ,startButtonCustomId: string, ownerId: string, gameId: string) {

    const filter = (i: MessageComponentInteraction) => (i.customId === startButtonCustomId) && (startButtonCustomId.endsWith(ownerId));
    const collector = interaction.channel!.createMessageComponentCollector({ filter, time: 60000, max: 1 });

    collector.on('collect', async i => {
        await interaction.editReply({ content: 'Fight !', components: [] });
        await sendQuizzMessage(quizzId , ownerId, interaction.channel as TextChannel, redisClient, gameId)
    });
}

export async function createJoinLobbyMessageCollector(redisClient: any, interaction: ChatInputCommandInteraction, joinButtonCustomId: string, gameId: string) {

    const filter = (i: MessageComponentInteraction) => i.customId === joinButtonCustomId;
    const collector = interaction.channel!.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
        await redisClient.json.set(`quizz:multiplayer:lobby:${gameId}`, `.players.${i.user.id}`, {
            score: 0,
            responseTime: []
        });
        await i.reply(i.user.username + " joined the match ! <:kanatablade:983426928109318206>")
    })
}