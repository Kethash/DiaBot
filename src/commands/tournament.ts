import { ActionRowBuilder, CacheType, ChatInputCommandInteraction, ComponentType, EmbedBuilder, PermissionsBitField, Role, SlashCommandBuilder, StringSelectMenuBuilder } from "discord.js";
import challonge_config from "../../challonge-config.json";
import { createTournamentParticipantsCollector, getAllTournaments } from "../functions/tournament";
import { createClient } from "redis";

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

                const deleteResponse = await interaction.reply({components: [deleteActionRow], ephemeral: true})

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
        }
    }
}