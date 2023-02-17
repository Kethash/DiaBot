import { ChatInputCommandInteraction, ComponentType, EmbedBuilder, MessageComponentInteraction, TextChannel, channelLink } from "discord.js";
import { sendQuizzMessage} from "./quizz";

export async function createStartGameMessageCollector(redisClient: any, interaction: ChatInputCommandInteraction,quizzId: string ,startButtonCustomId: string, ownerId: string, gameId: string) {

    const filter = (i: MessageComponentInteraction) => (i.customId === startButtonCustomId) && (startButtonCustomId.endsWith(ownerId) && (i.user.id === ownerId));
    const collector = interaction.channel!.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 300000 });

    collector.on('collect', async i => {
        const nb_players = Object.values((await redisClient.json.get(`quizz:multiplayer:lobby:${gameId}`, '.')).players).length;
        if (nb_players === 0)
        {
            await i.reply({content: "You cannot start a game without any players !",ephemeral: true})
        } else {
            await interaction.editReply({ content: 'Fight !', components: [], embeds: [] });
            await sendQuizzMessage(quizzId , ownerId, interaction.channel as TextChannel, redisClient, gameId)
        }
    });
}

export async function createJoinLobbyMessageCollector(redisClient: any, interaction: ChatInputCommandInteraction, joinButtonCustomId: string, gameId: string, lobbyEmbed: EmbedBuilder) {

    const filter = (i: MessageComponentInteraction) => i.customId === joinButtonCustomId;
    const collector = interaction.channel!.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 300000 });

    collector.on('collect', async i => {

        await redisClient.json.set(`quizz:multiplayer:lobby:${gameId}`, `.players.${i.user.id}`, {
            score: 0,
            response_times: [],
            user_id: i.user.id,
            user_name: i.user.username
        });

        const nb_players = Object.values((await redisClient.json.get(`quizz:multiplayer:lobby:${gameId}`, '.')).players).length;
        lobbyEmbed.setDescription(`${nb_players} joined`);
        const joinEmbed: EmbedBuilder = new EmbedBuilder()
            .setDescription(`${i.user.username} joined the match ! <:kanatablade:983426928109318206>`)
            .setColor('#F23B4C')
        await interaction.editReply({embeds: [lobbyEmbed]});
        await i.reply({embeds: [joinEmbed]})
    })

    collector.on('end', () => console.log('Le join est fini'))
}