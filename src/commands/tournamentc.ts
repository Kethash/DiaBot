import axios from "axios";
import { ActionRowBuilder, Attachment, CacheType, ChatInputCommandInteraction, ComponentType, Embed, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder } from "discord.js";
import { addParticipants, createTournament, deleteTournament, finishTournament, getTournamentByUrl, showTournamentInfo } from "../functions/challonge-api";
import challonge_config from "../../challonge-config.json";
import { createTournamentParticipantsCollector } from "../functions/tournament";

export = {
    data: new SlashCommandBuilder()
            .setName('tournamentc')
            .setDescription('Create and manage tournaments using challonge')
            .addSubcommand(subcommand =>
                subcommand.setName('create')
                .setDescription('Creates a tournament on challonge')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription("Sets the tournament name")
                        .setRequired(true)
                    )
                .addStringOption(option => 
                    option.setName('type')
                        .setDescription('Choose the tournament type')
                        .setRequired(true)
                        .addChoices(
                            { name: "Single elimination (default)", value: 'Single elimination'}, 
                            { name: "double elimination", value: 'double elimination'}, 
                            { name: "round robin", value: 'round robin'}, 
                            { name: "swiss", value: 'swiss'}
                        )
                    )
                .addAttachmentOption(option =>
                    option.setName('participants')
                        .setDescription('Add participants (optional), drop the file.json')
                    )
                )
            .addSubcommand(subcommand =>
                subcommand.setName('show')
                .setDescription('Show current tournaments registered in challonge')
                )
            .addSubcommand(subcommand =>
                subcommand.setName('info')
                .setDescription('Get an info from a tournament registered in chammonge')
            )
            .addSubcommand(subcommand =>
                subcommand.setName('finish')
                .setDescription("Finishes a tournament registered in challonge")
                )
            .addSubcommand(subcommand =>
                subcommand.setName('delete')
                .setDescription('Delete a tournament on challonge')
                .addStringOption(option =>
                    option.setName('url')
                    .setDescription('Tournament url')
                    .setRequired(true)
                    )
                )    
            ,

    async execute(redisClient: any, interaction: ChatInputCommandInteraction<CacheType>) {
        // Only one can use tournament command
        if (interaction.member?.user.id != challonge_config.the_chosen_one) {
            await interaction.reply({content: "Only one person can manage tournaments !",ephemeral: true})
            return;
        }

        const optionChoice: string = interaction.options.getSubcommand();
        const serverName: string = (interaction.guild?.name as string);


        /*
        *
        * All the const variables
        * tournamentKeys: Get all tournaments from REDIS
        * tournaments: an array of all the tournaments got
        * tournamentUrl: the URL of the tournament for the challonge api
        * tournamentName: The tournament name to store at redis
        */

        const tournamentKeys = await redisClient.KEYS(`tournament:*`);
        const tournaments: Array<{
            name: string,
            value: string
        }> = [];
        const tournamentUrl: string = interaction.options.getString("url") as string;
        const tournamentName: string = interaction.options.getString("name") as string;

        /*
        * END OF CONST VARS
        */


        switch (optionChoice) {
            case 'create':
                const tournamentType: string = interaction.options.getString("type") as string;
                const participantsFile: Attachment | null = interaction.options.getAttachment("participants");

                // creates tournament
                const createResult = await createTournament(tournamentName, tournamentType);
                if (!createResult.success) {
                    await interaction.reply({content: 'The tounament cannot be created on Challonge ! Aborting.',
                    ephemeral: true});
                    break;
                }

                const createdTournamentURL: string = createResult.data["tournament"]["url"]; 

                if (participantsFile === null) {
                    await redisClient.json.set(`tournament:${createdTournamentURL}`, '.', {
                        name: tournamentName,
                        server: serverName,
                        type: tournamentType,
                        url: `http://challonge.com/${createdTournamentURL}`,
                        participants: {}
                    });
                } else {
                    const participantsResponse = await axios.get(participantsFile.url, {
                        headers: { "Accept-Encoding": "gzip,deflate,compress", accept: 'application/json' },
                        responseType: 'json'
                    });
    
                    const participantsJson = participantsResponse.data;
                    const addParticipantsResponse =  await addParticipants(createdTournamentURL, participantsJson);
                    if (!addParticipantsResponse) await interaction.reply({content: 'The tournament cannot be created (error while adding participants)', ephemeral: true});

                    await redisClient.json.set(`tournament:${createdTournamentURL}`, '.', {
                        name: tournamentName,
                        server: serverName,
                        type: tournamentType,
                        url: `http://challonge.com/${createdTournamentURL}`,
                        participants: participantsJson
                    });
                }

                //// TODO: Implémenter la création de tournoi avec l'API de challonge
                await interaction.reply({
                    content: `The tournament ${tournamentName} has been successfully created !\nurl: ${createdTournamentURL}`, 
                    ephemeral: true
                });
                break;

            case 'info':
                if (tournamentKeys.length === 0 || tournamentKeys == null) {
                    await interaction.reply({ content: 'There is no current tournament' });
                    return;
                }
                
                const participants: Array<any> | string = await showTournamentInfo(tournamentUrl);
                if (typeof participants === "string") {
                    await interaction.reply({content: `${participants}`});
                } else {
                    const participantsEmbed = []
                    for (const participant of participants) {
                        participantsEmbed.push({
                            name: `Name: ${participant.name}`,
                            value: `Seed: ${participant.seed}`
                        });
                    }

                    const showparticipantsEmbed: EmbedBuilder = new EmbedBuilder()
                        .setTitle("Toutnament info")
                        .addFields(participantsEmbed)
                        .setColor("#FD5E53")

                    await interaction.reply({embeds: [showparticipantsEmbed], ephemeral: true});

                }
                
                break;

            case 'show':
                if (tournamentKeys.length === 0 || tournamentKeys == null) {
                    await interaction.reply({ content: 'There is no current tournament' });
                    return;
                }

                for (const tournament of tournamentKeys) {
                    const [name, server, type]: [string, string, string] = await redisClient.json.get(tournament, {path: ['$["name", "server", "type"]'] })
                    tournaments.push({
                        name: name,
                        value: `Hosted by ${server} - ${type}`
                    });
                }

                const showTournamentsEmbed: EmbedBuilder = new EmbedBuilder()
                        .setTitle("Here are current tournaments")
                        .addFields(tournaments)
                        .setColor("#FD5E53");

                await interaction.reply({embeds: [showTournamentsEmbed], ephemeral: true});
                break;

            case 'finish':
                let tournamentsInServer: string[] = await redisClient.KEYS(`tournament:*`);
                tournamentsInServer = tournamentsInServer.map((e:string) => e.split(':')[1]);
                const tournamentsInServerMenu: Array<{label: string, description: string, value: string}> = [];
                
                for (const tournament of tournamentsInServer) {
                    const thatTournament: string = await getTournamentByUrl(tournament);
                    console.debug(tournament, thatTournament);

                    tournamentsInServerMenu.push({
                        label: thatTournament,
                        description: "Tournament",
                        value: tournament
                    });
                }

                const removeTournamentRow: ActionRowBuilder<any> = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('removetournament')
                            .setPlaceholder('Please select a tournament')
                            .addOptions(tournamentsInServerMenu),
                    );

                const finishTournamentEmbed: EmbedBuilder = new EmbedBuilder()
                        .setTitle("Which tournament you want to finish ?")
                        .setDescription("Select the tournament you want to remove");
                
                const finishResponse = await interaction.reply({embeds: [finishTournamentEmbed], components: [removeTournamentRow] ,ephemeral: true});
                
                const finishCollector = finishResponse.createMessageComponentCollector({
                    componentType: ComponentType.StringSelect
                });

                finishCollector.on('collect', async i => {
                    const selection = i.values[0];
                    try {
                        const finishResponse = await finishTournament(selection);
                        if (finishResponse instanceof Error) throw Error(finishResponse.message);
                        await redisClient.DEL(`tournament:${selection}`);
                    } catch (err) {
                        console.error(err);
                        await i.reply({content: "Sorry, an error occured !",ephemeral: true});
                        return;
                    } finally {
                        await i.reply({content: "The tournament is over !",ephemeral: true});
                    }
                });
                break;

            case 'delete':
                await redisClient.json.del(`tournament:${tournamentUrl}`);
                const deleteResult: boolean = await deleteTournament(tournamentUrl);

                if(deleteResult) {
                    await interaction.reply({ content: 'The tournament has been deleted successfully !', ephemeral: true });
                } else {
                    await interaction.reply({ content: "The tournament couldn't be deleted !", ephemeral: true });
                }
                break;

            default:
                await interaction.reply({ content: "Unknown error", ephemeral: true })
                break;
        }
    }
}