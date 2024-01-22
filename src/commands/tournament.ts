import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, CacheType, ChatInputCommandInteraction, ComponentType, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder } from "discord.js";
import challonge_config from "../../challonge-config.json";
import { createTournamentParticipantsCollector, getAllTournaments } from "../functions/tournament";
import { createClient } from "redis";
import { createTournamentButtons } from "../functions/buttons/tournament-buttons";
import { TournamentObject } from "../types/redisJsonTypes";
import { Tournament } from "../structures/Tournament";

export = {
    data: new SlashCommandBuilder()
        .setName('tournament')
        .setDescription('Create and manage tournaments using or not challonge')
        .addSubcommand(subcommand => 
            subcommand.setName('create')
            .setDescription('Creates an embed for registering players')
            .addStringOption(option =>
                option.setName('name')
                    .setDescription("Sets the tournament name")
                    .setRequired(true)
                )
        ).addSubcommand(subcommand => 
            subcommand.setName('show')
                .setDescription('Show created tournaments')
        ).addSubcommand(subcommand =>
            subcommand.setName('delete')
                .setDescription("Deletes a tournament")
        ).addSubcommand(subcommand =>
            subcommand.setName('info')
                .setDescription('Get precise info from a tournament')
        ),

    async execute(redisClient: ReturnType<typeof createClient>, interaction: ChatInputCommandInteraction<CacheType>) {
        // Only one can use tournament command
        if (interaction.member?.user.id != challonge_config.the_chosen_one) {
            await interaction.reply({content: "Only one person can manage tournaments !",ephemeral: true})
            return;
        }

        const optionChoice: string = interaction.options.getSubcommand();
        const serverName: string = (interaction.guild?.name as string);
        const tournamentName: string = interaction.options.getString("name") as string;
        switch(optionChoice) {
            case 'create':
                // The key used for the tournament
                const createdTournamentKey: string = `tournament:${serverName}:${tournamentName}`;
                if (await redisClient.json.GET(createdTournamentKey, { path: "." }) != null) {
                    await interaction.reply({content: "BUU BUU DESUWA !\nThe tournament alredy exists !",ephemeral: true})
                }
                
                await redisClient.json.set(createdTournamentKey, '.', {
                    name: tournamentName,
                    host: interaction.user.username,
                    participants: []
                });

                await createTournamentParticipantsCollector(interaction, createdTournamentKey, tournamentName);
                await interaction.reply({content: "Tournament created !", ephemeral: true});        
                break;
            case 'show':
                // View created tournaments
                const tournaments: Array<string> = (await redisClient.KEYS(`tournament:${serverName}:*`)).flatMap((e: string) => {
                    return e.split(':').slice(-1);
                });

                const showTournamentsEmbed: EmbedBuilder = new EmbedBuilder()
                                                            .setTitle("Here are the tournaments created on this server")
                
                if (tournaments.length == 0) showTournamentsEmbed.setDescription("There is no created tournament");
                else showTournamentsEmbed.setDescription(tournaments.join('\n'));

                await interaction.reply({embeds: [showTournamentsEmbed]});
                break;
            
            case 'delete':
                const deleteOptions = [];

                if (interaction.memberPermissions?.has("Administrator")) {
                    for (const option of await getAllTournaments(redisClient, serverName)) {
                        deleteOptions.push({
                            label: option[0].name,
                            value: option[1]
                        });
                    }
                } else {
                    for (const option of await getAllTournaments(redisClient, serverName, interaction.user.username)) {
                        deleteOptions.push({
                            label: option[0].name,
                            value: option[1]
                        });
                    }
                }

                if (deleteOptions.length === 0) return interaction.reply({ content: "There is no tournament.", ephemeral: true})

                const deleteStringSelectMenu =  new StringSelectMenuBuilder()
                        .setCustomId(`removetournament-${interaction.user.id}`)
                        .setPlaceholder("Choose a tournament to delete")
                        .addOptions(deleteOptions)

                const deleteActionRow: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
                    .addComponents(deleteStringSelectMenu);

                const deleteResponse = await interaction.reply({components: [deleteActionRow], ephemeral: true});

                // collectors
                const deletestringselectcollector = deleteResponse.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 300_000 });
                deletestringselectcollector.on('collect', async i => {
                    const choice: string = i.values[0];
                    await redisClient.json.DEL(choice);
                    deletestringselectcollector.stop("selected");
                });

                deletestringselectcollector.on('end', async (i, reason) => {
                    if (reason == "selected") await deleteResponse.edit({ content: "Tournament deleted successfully !", components: [] });
                    else await deleteResponse.edit({ content: "No reply for 5 minutes, aborting task. ", components: [] });
                })
                
                break;

            case 'info':
                const showOptions = [];
                for (const option of await getAllTournaments(redisClient, serverName)) {
                    showOptions.push({
                        label: option[0].name,
                        value: option[1]
                    });
                }

                if (showOptions.length === 0) return interaction.reply({ content: "There is no tournament.", ephemeral: true})

                const showStringSelectMenu =  new StringSelectMenuBuilder()
                        .setCustomId(`showtournament-${interaction.user.id}`)
                        .setPlaceholder("Choose a tournament to show info")
                        .addOptions(showOptions)

                const showActionRow: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
                    .addComponents(showStringSelectMenu);
                
                const showResponse = await interaction.reply({components: [showActionRow], ephemeral: true});
                // collectors
                const showstringselectcollector = showResponse.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 300_000 });
                showstringselectcollector.on('collect', async i => {
                    const choice: string = i.values[0];
                    const showSelectedTournament: TournamentObject = await redisClient.json.GET(choice) as TournamentObject;
                    const showTournamentEmbed: EmbedBuilder = new EmbedBuilder()
                        .setTitle("Tournament info")
                        .setDescription(`Tournament name: ${showSelectedTournament.name}`)
                        .addFields(
                            { name: `Hosted by`, value: `${showSelectedTournament.host}`, inline: true },
                            { name: 'Participants', value: `${showSelectedTournament.participants.length}`, inline: true }
                        )
                        .setFooter({ text: "Wanna more info like the list of the participants ?\nDownload the infos into a file !"});

                    const downloadFilesButtons = createTournamentButtons();
                    const actionRowShowButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(downloadFilesButtons);

                    // create buttons, waiting for refactorization
                    const showTournamentMessage = await interaction.channel?.send({embeds: [showTournamentEmbed], components: [actionRowShowButtons] });

                    const showTournamentMessageCollector = showTournamentMessage?.createMessageComponentCollector({ componentType: ComponentType.Button, time: 300_000 });
                    showTournamentMessageCollector?.on('collect', async i => {
                        const showSelectedTournamentClass: Tournament = new Tournament(showSelectedTournament.name, showSelectedTournament.host, showSelectedTournament.participants);
                        console.log(i.customId);
                        switch (i.customId) {
                            case 'dltxt':
                                await i.reply({ files: [new AttachmentBuilder(showSelectedTournamentClass.toTxt(), {name: `${showSelectedTournamentClass.name}.txt`})] , ephemeral: true });
                                break;
                            case 'dlcsv':
                                await i.reply({ files: [new AttachmentBuilder(showSelectedTournamentClass.toCsv(), {name: `${showSelectedTournamentClass.name}.csv`})], ephemeral: true });
                                break;
                            case 'dljson':
                                await i.reply({ files: [new AttachmentBuilder(showSelectedTournamentClass.toJSON(), {name: `${showSelectedTournamentClass.name}.json`})], ephemeral: true });
                                break;
                        }
                    });

                    showstringselectcollector.stop("selected");
                });

                showstringselectcollector.on('end', async (i, reason) => {
                    if (reason == "selected") return await showResponse.delete();
                    else await showResponse.edit({ content: "No reply for 5 minutes, aborting task. ", components: [] });
                });

                break;
        }
    }
}