import { ButtonInteraction, CacheType, ChatInputCommandInteraction, ComponentType, EmbedBuilder, MessageComponentInteraction, StageChannel, TextBasedChannel } from "discord.js";
import { sendQuizzMessage} from "./quizz";

export async function createMultiplayerGame(redisClient: any, interaction: ChatInputCommandInteraction,quizzId: string , joinButtonCustomId: string, startButtonCustomId: string, ownerId: string, gameId: string, lobbyEmbed: EmbedBuilder) {
    // Collector for the join button
    const joinfilter = (i: MessageComponentInteraction) => i.customId === joinButtonCustomId;
    const joinCollector = (interaction.channel as Exclude<TextBasedChannel, StageChannel>).createMessageComponentCollector({ filter: joinfilter, componentType: ComponentType.Button, time: 300000 });

    joinCollector.on('collect', async (i: ButtonInteraction<CacheType>) => {

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
    
    // Collector for the start button
    const startfilter = (i: MessageComponentInteraction) => (i.customId === startButtonCustomId);
    const startButtoncollector = (interaction.channel as Exclude<TextBasedChannel, StageChannel>).createMessageComponentCollector({ filter: startfilter, componentType: ComponentType.Button, time: 300000 });

    startButtoncollector.on('collect', async (i: ButtonInteraction<CacheType>) => {
        const nb_players = Object.values((await redisClient.json.get(`quizz:multiplayer:lobby:${gameId}`, '.')).players).length;
        if (!startButtonCustomId.endsWith(i.user.id)) {
            await i.reply({
                content: "Only the host of the game can start !",
                ephemeral: true
            });
        } else if (nb_players === 0) {
            await i.reply({content: "You cannot start a game without any players !",ephemeral: true})
        } else {
            joinCollector.stop(); // Stops the join button from collecting new requests
            startButtoncollector.stop(); // Removes the collector of the start button
            await interaction.editReply({ content: 'Fight !', components: [], embeds: [] });
            await sendQuizzMessage(quizzId , ownerId, interaction.channel as Exclude<TextBasedChannel, StageChannel>, redisClient, gameId)
        }
    });

}