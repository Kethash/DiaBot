import { ActionRowBuilder, Attachment, ButtonBuilder, ButtonStyle, CacheType, ChatInputCommandInteraction, EmbedBuilder, MessageComponentInteraction, SlashCommandBuilder, StringSelectMenuBuilder } from 'discord.js';
import axios from 'axios';
import { isValidQuizz } from '../functions/quizz';
import { createJoinLobbyMessageCollector, createStartGameMessageCollector } from '../functions/lobbyManager';

export = {
    data: new SlashCommandBuilder()
        .setName('quizz')
        .setDescription('Let\' play quizzssss !')
        .addSubcommand(subcommand =>
            subcommand.setName('play')
                .setDescription('Starts an automatic Quizz')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('import')
                .setDescription('Import a quizz from a JSON file')
                .addAttachmentOption(option =>
                    option.setName('file')
                        .setDescription("Drop the JSON file")
                        .setRequired(true)
                )
        ).addSubcommand(subcommand =>
            subcommand.setName('delete')
                .setDescription('Remove an imported quizz')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('stats')
                .setDescription('View a player\'s stats')
        ).addSubcommand(subcommand =>
            subcommand.setName('multiplayer')
                .setDescription("Play a multiplayer quizz")
        ),


    //NOT IMPLEMENTED YET
    //.addIntegerOption(option =>
    //     option.setName('max')
    //         .setDescription('Set the max accepted answers')
    // ),
    async execute(redisClient: any, interaction: ChatInputCommandInteraction<CacheType>) {
        const name: string = interaction.options.get('quizzname') ? (interaction.options.get('quizzname')?.value as string).toLowerCase() : "default";
        const title: string = interaction.options.get('title') ? interaction.options.get('title')?.value as string : "BUU BUU QUIZZ DESUWA !!";

        const optionChoice: string = interaction.options.getSubcommand();

        console.log(optionChoice)

        if (optionChoice == 'import') {

            const attachment = interaction.options.getAttachment('file') as Attachment;
            const response = await axios.get(attachment.url, {
                headers: { "Accept-Encoding": "gzip,deflate,compress", accept: 'application/json' },
                responseType: 'json'
            });


            const json: jsonquizz = response.data; // All the questions from the JSON file

            // Check the quizz structure
            if (!(isValidQuizz(json))) {
                await interaction.reply({
                    content: "The quizz structure is invalid, the JSON file must be like" +
                        "```json\n{\n\tname: string,\n\tdescription: string,\n\tquizzs: [{\n\ttitle: string,\n\timageLink: string,\n\tblurImage: boolean,\n\tblurRate: number,\n\tanswers: string\n\t}]\n}```",
                    ephemeral: true
                });
                return;
            }


            const name: string = json.name.toLowerCase().split(' ').join('-');
            redisClient.json.set(`quizz:${name}`, '.', json);
            await interaction.reply({ content: "Quizz imported", ephemeral: true });
        } else if (optionChoice == 'play') {
            const quizzs = await redisClient.KEYS('quizz:*');
            if (quizzs.length == 0 || quizzs == null) {
                await interaction.reply({ content: 'There is no quizz' });
                return;
            };
            const options = [];
            for (const quiz of quizzs) {
                const [name, description]: [string, string] = await redisClient.json.get(quiz, { path: '$["name","description"]' });
                options.push({
                    label: name,
                    description: description,
                    value: quiz,
                });
            }

            const row: ActionRowBuilder<any> = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('selectquiz')
                        .setPlaceholder('Please select a quizz')
                        .addOptions(options),
                );

            const embed: EmbedBuilder = new EmbedBuilder()
                .setColor("#FD5E53")
                .setTitle('Which quiz you want to start ?');

            await interaction.reply({ embeds: [embed], components: [row] });
        } else if (optionChoice == 'stats') {
            let player = interaction.user;
            let playerId = interaction.user.id;
            const playerStats = await redisClient.json.get(`answer:player:${playerId}`, '.');
            if (playerStats == null) {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#FD5E53")
                            .setTitle(`BUU BUU DESUWA !`)
                            .setDescription(`There is no data !`)
                    ]
                })
                return;
            }
            let quizzIds = Object.keys(playerStats.quizzs);
            let quizzsPromises = quizzIds.map((quizzId) => redisClient.json.get(quizzId, '.'));
            let quizzs = await Promise.all(quizzsPromises);
            // @ts-ignore
            let description: string = Object.values(playerStats.quizzs).map(({ playCount, quizz_id }, index) => {
                return `- ${quizzs[index].name} : ${playCount} plays`
            }).reduce((previousValue, currentValue) => {
                return previousValue === '' ? currentValue : previousValue + '\n'
            }, '');

            console.log(description)
            const embed: EmbedBuilder = new EmbedBuilder()
                .setColor("#FD5E53")
                .setTitle(`${player.username} stats`)
                .setDescription(description);

            await interaction.reply({ embeds: [embed] });
        } else if (optionChoice == 'delete') {
            const quizzs = await redisClient.KEYS('quizz:*');
            if (quizzs.length == 0 || quizzs == null) {
                await interaction.reply({ content: 'There is no quizz' });
                return;
            };
            const options = [];
            for (const quiz of quizzs) {
                const [name, description]: [string, string] = await redisClient.json.get(quiz, { path: '$["name","description"]' });
                options.push({
                    label: name,
                    description: description,
                    value: quiz,
                });
            }

            const row: ActionRowBuilder<any> = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('removequizz')
                        .setPlaceholder('Please select a quizz')
                        .addOptions(options),
                );

            const embed: EmbedBuilder = new EmbedBuilder()
                .setColor("#FD5E53")
                .setTitle('Which quiz you want to remove ?');

            await interaction.reply({ embeds: [embed], components: [row] });
        } else if (optionChoice === 'multiplayer') {
            console.log('multiplayer')
            // QUIZZ SELECTION
            const quizzs = await redisClient.KEYS('quizz:*');
            if (quizzs.length == 0 || quizzs == null) {
                await interaction.reply({ content: 'There is no quizz available :/' });
                return;
            };
            const options = [];
            for (const quiz of quizzs) {
                const [name, description]: [string, string] = await redisClient.json.get(quiz, { path: '$["name","description"]' });
                options.push({
                    label: name,
                    description: description,
                    value: quiz,
                });
            }

            const rowSelectQuizz: ActionRowBuilder<any> = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('selectquiz')
                        .setPlaceholder('Select a quizz')
                        .addOptions(options),
                );

            const embed: EmbedBuilder = new EmbedBuilder()
                .setColor('#FD5E53')
                .setTitle('Which quizz do you want to play ?');

            const gameId: string = `${interaction.user.id}:${Date.now()}`;
            const ownerId: string = interaction.user.id;
            const joinId = `multiplayerjoin-${ownerId}`;
            const startId = `multiplayerstart-${ownerId}`;

            // SEND QUIZZ SELECTION AND WAIT FOR RESPONSE
            let response = await interaction.reply({ embeds: [embed], components: [rowSelectQuizz] })

            const filter = (i: any) => (i.user.id === ownerId);
            const collector = response.createMessageComponentCollector({ filter, time: 6000, max: 1 })

            collector.on('collect', async (i: any) => {
                // ON QUIZZ SELECTION RESPONSE, ALLOW TO JOIN AND START GAME
                const quizzId = i.values[0];
                await redisClient.json.set(`quizz:multiplayer:lobby:${gameId}`,'.', {
                    guildId: interaction.guildId,
                    quizzEndCounter: 20,
                    quizzId: quizzId,
                    players: {},
                    actualQuizzCount: 0,
                })

                const joinButton = new ButtonBuilder()
                .setCustomId(joinId)
                .setLabel('Join party')
                .setStyle(ButtonStyle.Primary)

                const startButton = new ButtonBuilder()
                    .setCustomId(startId)
                    .setLabel('Start !')
                    .setStyle(ButtonStyle.Success)

                const row: ActionRowBuilder<any> = new ActionRowBuilder()
                    .addComponents(joinButton, startButton);

                const messageLobby: string = `${interaction.user.toString()} started a multiplayer lobby !`;

                createStartGameMessageCollector(redisClient, interaction, quizzId ,startId, ownerId, gameId);
                createJoinLobbyMessageCollector(redisClient, interaction, joinId, gameId);

                await interaction.reply({ content: messageLobby, components: [row] });
            });


        }
    }
}