import { ButtonBuilder, ButtonStyle } from "discord.js";

export function createTournamentButtons(): [ButtonBuilder, ButtonBuilder, ButtonBuilder] {
    // Buttons

    const txtButton: ButtonBuilder = new ButtonBuilder()
                                        .setCustomId('dltxt')
                                        .setLabel('Download to TXT')
                                        .setStyle(ButtonStyle.Primary)
    
    const csvButton: ButtonBuilder = new ButtonBuilder()
                                        .setCustomId('dlcsv')
                                        .setLabel('Download to CSV')
                                        .setStyle(ButtonStyle.Primary)

    const jsonButton: ButtonBuilder = new ButtonBuilder()
                                        .setCustomId('dljson')
                                        .setLabel('Download to JSON')
                                        .setStyle(ButtonStyle.Primary)

    return [txtButton, csvButton, jsonButton];
}