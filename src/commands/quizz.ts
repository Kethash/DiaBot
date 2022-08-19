import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import getPairs from '../functions/arrays';


export = {
    data: new SlashCommandBuilder()
            .setName('quizz')
            .setDescription('Start a quiz !')
            .addIntegerOption(option =>
                option.setName('options')
                    .setDescription('Start or Stop a quizz')
                    .setRequired(true)
                    .addChoices(
                        { name: 'start', value: 1 },
                        { name: 'stop', value: 0 },
                    ))
            .addStringOption(option => 
                option.setName('name')
                    .setDescription('Set the name of the quizz')
            ),
            
            //NOT IMPLEMENTED YET
            //.addIntegerOption(option => 
            //     option.setName('max')
            //         .setDescription('Set the max accepted answers')
            // ),
    async execute(redisClient: any, interaction: any) {
        const name:string = interaction.options.get('name') ? interaction.options.get('name').value : "This is a quizz";

        const optionChoice: number = interaction.options.get('options').value;

        if(optionChoice === 1) {
            const embed: EmbedBuilder = new EmbedBuilder()
                .setColor('#FD5E53')
                .setTitle('QUIZZ TIME !')
                .setAuthor({ name: 'Dia Kurosawa'})
                .setDescription(`Theme: ${name}`);
            const key: string = `${interaction.guild.id.toString()}:quizz`;
            await redisClient.HSET(key, "name", name);
            await interaction.reply({embeds: [embed]});
        } else {
            const templeaderboard = await redisClient.sendCommand(["ZRANGE",`${interaction.guild.id.toString()}:quizz:leaderboard`,"0","10","WITHSCORES","REV"]);
            const leaderboard = getPairs(templeaderboard).map((e: any[]) => {
                return {
                    "name": e[1],
                    "value": e[0]
                }
            });

            const embed: EmbedBuilder = new EmbedBuilder()
                .setColor('#FD5E53')
                .setTitle('QUIZZ IS OVER !')
                .setAuthor({ name: 'Dia Kurosawa'})
                .setDescription(`Here is the leaderboard`)
                .setFields(leaderboard);
            await interaction.reply({embeds: [embed]});

            await redisClient.multi()
            .DEL(`${interaction.guild.id.toString()}:quizz`)
            .DEL(`${interaction.guild.id.toString()}:quizz:leaderboard`)
            .exec();
        }
    }
}