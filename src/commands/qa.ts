import { AttachmentBuilder, EmbedBuilder, Message, SlashCommandBuilder } from 'discord.js';

export = {
    data: new SlashCommandBuilder()
            .setName('qa')
            .setDescription('Question')
            .addStringOption(option => 
                option.setName('question')
                    .setDescription('(To be or not to be) that is the question !')
                    .setRequired(true)
            ).addStringOption(option =>
                option.setName('answers')
                    .setDescription('The answers, if multiple separate then with ";"')
                    .setRequired(true)
            ).addIntegerOption(option =>
                option.setName('time')
                    .setDescription('Set the time (in milliseconds)')
            ).addAttachmentOption(option =>
                option.setName("attachment")
                    .setDescription("Attach an image, a picture or a recording")
            ).addStringOption(option =>
                option.setName("imageurl")
                    .setDescription("If you want to add an image by its URL")
            ),
            
            //NOT IMPLEMENTED YET
            //.addIntegerOption(option => 
            //     option.setName('max')
            //         .setDescription('Set the max accepted answers')
            // ),
    async execute(interaction: any, redisClient: any) {

        const max_answers = interaction.options.get('max') ? interaction.options.get('max').value : 1;
        const timeAnswer = interaction.options.get('time') ? interaction.options.get('time').value : 60000;

        const [attachments, attachmentsUrl] = [interaction.options.get('attachment'), interaction.options.get('imageurl')];

        const item = {
            "question": interaction.options.get('question').value,
            "answers": interaction.options.get('answers').value.split(";").map((answer: string) => answer.toLowerCase()),
        };
        const filter = (response: Message) => {
            return item.answers.some((answer: string) => answer.toLowerCase() === response.content.toLowerCase());
        };

        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor('#FD5E53')
            .setTitle(`**Question:** ${item.question}\nYou have ${timeAnswer/1000} seconds to answer !`)
            .setImage(attachmentsUrl ? attachmentsUrl.value: null)

        const qAttachment: Array<AttachmentBuilder> | null = attachments ? [new AttachmentBuilder(attachments.attachment.attachment)] : null;

        if (await redisClient.exists(`${interaction.guild.id.toString()}:quizz`)) {
            interaction.reply({ embeds: [embed], files: qAttachment, fetchReply: true })
            .then(() => {
                interaction.channel.awaitMessages({ filter, max: max_answers, time: timeAnswer, errors: ['time'] })
                    .then((collected: any) => {
                        redisClient.ZINCRBY(`${interaction.guild.id.toString()}:quizz:leaderboard`,1, `${collected.first().author.toString()}`)
                        interaction.followUp(`${collected.first().author} got the correct answer! ❤`);
                    })
                    .catch((collected: any) => {
                        interaction.followUp('BUU BUU DESUWAAA !! Looks like nobody got the answer this time.');
                    });
            });
        } else {
            interaction.reply({ embeds: [embed],files: qAttachment, fetchReply: true })
            .then(() => {
                interaction.channel.awaitMessages({ filter, max: max_answers, time: timeAnswer, errors: ['time'] })
                    .then((collected: any) => {
                        interaction.followUp(`${collected.first().author} got the correct answer! ❤`);
                    })
                    .catch((collected: any) => {
                        interaction.followUp('BUU BUU DESUWAAA !! Looks like nobody got the answer this time.');
                    });
            });
        }
    }
}