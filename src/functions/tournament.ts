import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { createClient } from "redis";
import { TournamentObject } from "../types/redisJsonTypes";

export async function createTournamentParticipantsCollector(interaction: ChatInputCommandInteraction, joinButtonCustomId: string, tournamentName: string): Promise<void> {

    const joinButton = new ButtonBuilder()
    .setCustomId(`${joinButtonCustomId}:signon`)
    .setLabel('Sign on')
    .setStyle(ButtonStyle.Primary);

    const leaveButton = new ButtonBuilder()
        .setCustomId(`${joinButtonCustomId}:leave`)
        .setLabel('Leave')
        .setStyle(ButtonStyle.Danger);

    const actionRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(joinButton, leaveButton);

    const embed: EmbedBuilder = new EmbedBuilder()
        .setColor('#F23B4C')
        .setTitle(`A new tournament has been created !`)
        .addFields({name: `Tournament name: ${tournamentName}`, value: '\u200b'})
        .setDescription("Click on the buttons to register or cancel your registration !");
    
    await interaction.channel?.send({embeds: [embed], components: [actionRow]});
}

export async function checkIfTournamentExists(redisClient: ReturnType<typeof createClient>, tournamentId: string): Promise<boolean> {
    const keyExists: number = await redisClient.exists(tournamentId); // 1: exists 0: doesn't exists
    return keyExists == 1 ? true : false;
}

export async function getTournament(redisClient: ReturnType<typeof createClient>, tournamentKey: string): Promise<TournamentObject> {
    const tournament: TournamentObject | null = await redisClient.json.get(tournamentKey, 
    {
        path: "."
    }
    ) as TournamentObject | null;

    if (tournament == null) return { name: "undefined", host: "unknown", participants: []};
    return tournament;
}

export async function getAllTournaments(redisClient: ReturnType<typeof createClient>, serverName: string, username?: string): Promise<Array<[TournamentObject, string]>> {
    const tournamentKeys: string[] = await redisClient.KEYS(`tournament:${serverName}:*`);
    const tournaments: Array<[TournamentObject, string]> = [];
    for (const tournamentKey of tournamentKeys) {
        tournaments.push([await getTournament(redisClient, tournamentKey), tournamentKey]);
    }
    if (username) {
        return tournaments.filter((tournament: [TournamentObject, string]) => tournament[0].host === username);
    }
    return tournaments;
}