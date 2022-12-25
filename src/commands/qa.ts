import { AttachmentBuilder, EmbedBuilder, Message, SlashCommandBuilder } from 'discord.js';
import sharp from 'sharp';
import axios from 'axios';

export = {
    data: new SlashCommandBuilder()
            .setName('qa')
            .setDescription('Question')
            .addSubcommand(subcommand =>
                subcommand
                    .setName("question")
                    .setDescription("Regular question")
                    .addStringOption(option =>
                        option.setName('question')
                            .setDescription('(To be or not to be) that is the question !')
                            .setRequired(true)
                    ).addStringOption(option =>
                        option.setName('answers')
                            .setDescription('The answers, if multiple separate then with ";"')
                            .setRequired(true)
                    ).addStringOption(option => 
                        option.setName('quizzname')
                            .setDescription('Indicate the name of the quizz to score')
                    ).addIntegerOption(option =>
                        option.setName('time')
                            .setDescription('Set the time (in milliseconds)')
                    ).addAttachmentOption(option =>
                        option.setName("attachment")
                            .setDescription("Attach an image, a picture or a recording")
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('image')
                    .setDescription('Question using an image')
                    .addAttachmentOption(option =>
                        option.setName("attachment")
                            .setDescription("Attach an image, a picture or a recording")
                            .setRequired(true)
                    ).addStringOption(option =>
                        option.setName('question')
                            .setDescription('(To be or not to be) that is the question !')
                            .setRequired(true)
                    ).addStringOption(option =>
                        option.setName('answers')
                            .setDescription('The answers, if multiple separate then with ";"')
                            .setRequired(true)
                    ).addStringOption(option =>
                        option.setName("imageurl")
                            .setDescription("If you want to add an image by its URL")
                    ).addBooleanOption(option =>
                        option.setName('blur')
                            .setDescription('Blur the image ?')
                    ),
            ),
            
            //NOT IMPLEMENTED YET
            //.addIntegerOption(option => 
            //     option.setName('max')
            //         .setDescription('Set the max accepted answers')
            // ),
    async execute(redisClient: any, interaction: any) {
        
        const max_answers = interaction.options.get('max') ? interaction.options.get('max').value : 1;
        const timeAnswer = interaction.options.get('time') ? interaction.options.get('time').value : 60000;
        const quizzName = interaction.options.get('quizzname') ? interaction.options.get('quizzname').value : 'default';

        let [attachments, attachmentsUrl] = [interaction.options.get('attachment'), interaction.options.get('imageurl')];

        const optionChoice:string = interaction.options.getSubcommand();
        const blurred: boolean = interaction.options.get('blur').value;
        console.log(blurred)
        if (optionChoice === "image" && blurred === true) {
            const buffer = (await axios.get(attachments.attachment.attachment, { responseType: 'arraybuffer' })).data as Buffer;
            attachments.attachment.attachment = await sharp(buffer).blur(30).toBuffer();
        }
        
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

        if (await redisClient.exists(`${interaction.guild.id.toString()}:quizz:${quizzName}`)) {
            interaction.reply({ embeds: [embed], files: qAttachment, fetchReply: true })
            .then(() => {
                interaction.channel.awaitMessages({ filter, max: max_answers, time: timeAnswer, errors: ['time'] })
                    .then((collected: any) => {
                        redisClient.ZINCRBY(`${interaction.guild.id.toString()}:quizz:${quizzName}:leaderboard`,1, `${collected.first().author.toString()}`)
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