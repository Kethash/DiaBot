import { ActionRowBuilder, Events, Interaction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { RedisClientType } from "redis";

/*
* 
* When user clicked on "Answer button" 
* 
*/
export = {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction) {
        if (interaction.user.bot) return;
        if (!interaction.isButton()) return;
        if (interaction.customId !== "answer-button") return;

        const answerInput = new TextInputBuilder()
                                .setCustomId(`answer-input:${interaction.message.id}`)
                                .setLabel("Please write your answer :)")
                                .setStyle(TextInputStyle.Short);

        const modal = new ModalBuilder()
                            .setTitle('Answer box')
                            .setCustomId(`answer-input:${interaction.message.id}`)
                            .addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(answerInput));

		await interaction.showModal(modal);
    }
}