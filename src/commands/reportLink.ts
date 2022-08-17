import { reportLink } from "../controllers/report-link";
import { ChatInputCommandInteraction, EmbedBuilder, Message, SlashCommandBuilder } from "discord.js";

export = {
    data: new SlashCommandBuilder()
        .setName("reportlink")
        .setDescription("Report a message containing a malicious link which has not been detected by Dia saaan !")
        .addStringOption(option =>
            option.setName('messageid')
                .setDescription('Put the message ID')
                .setRequired(true)
        )
    ,

    async execute(interaction: ChatInputCommandInteraction) {
        const messageId: string = interaction.options.get('messageid')?.value as string;
        const message: Message | undefined = interaction.channel?.messages.cache.get(messageId);
        if (message === undefined) {
            interaction.reply({content: 'Sorry, the message is not found', ephemeral: true});
            return;
        }
        if (["http://", "https://"].some(e => message.content.includes(e))) {
            const member = interaction.member;
            const reportId: string = await reportLink(
                interaction.guild?.id.toString() as string, 
                message.content,
                member?.user.toString() as string,
                `${member?.user.username}#${member?.user.discriminator}` as string
            );
            const reportEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor("#FD5E53")
                .setTitle("The message has been reported")
                .setAuthor({name: "Dia Kurosawa"})
                .setDescription(`Report ID: ${reportId}`);
            interaction.reply({embeds: [reportEmbed], ephemeral: true});
        } else {
            interaction.reply({content: "There is no link in the reported message !", ephemeral: true});
        }
        
    }
}