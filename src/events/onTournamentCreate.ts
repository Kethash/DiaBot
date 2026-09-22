import { Events, Interaction, MessageFlags, User } from "discord.js";
import { checkIfTournamentExists } from "../functions/tournament";

export = {
    name: Events.InteractionCreate,
    async execute(redisClient: any, interaction: Interaction, user: User) {
        if (interaction.user.bot) return; // Was reaction created by the bot
        if (!interaction.isButton()) return; // Not from a button press
        const buttonCustomId: string = interaction.customId;
        if (!buttonCustomId.startsWith("tournament:")) return;
        const buttonCustomStrippedId: string = buttonCustomId.split(':').slice(0,-1).join(':');
        if (!(await checkIfTournamentExists(redisClient, buttonCustomStrippedId))) {
            await interaction.reply({content: "The tournament does not exists or has been shut down !", flags: MessageFlags.Ephemeral});
            return;
        }
        const playerIndex: number = await redisClient.json.arrIndex(buttonCustomStrippedId, '$.participants', interaction.user.username);

        // Check if it's the join or leave button
        if (buttonCustomId.endsWith("signon")) {
            if (playerIndex != -1) await interaction.reply({content: "You are already signed up into this tournament !", flags: MessageFlags.Ephemeral});
            else {
                await redisClient.json.arrAppend(buttonCustomStrippedId, '$.participants', interaction.user.username);
                await interaction.reply({content: "You've signed up for the tournament !", flags: MessageFlags.Ephemeral});
            }
        } else {
            if (playerIndex == -1) await interaction.reply({content: "You are not signed up into this tournament !", flags: MessageFlags.Ephemeral});
            else {
                await redisClient.json.arrPop(buttonCustomStrippedId, '$.participants', playerIndex);
                await interaction.reply({content: "You have unregistered from the tournament", flags: MessageFlags.Ephemeral});
            }
        }
    }
}