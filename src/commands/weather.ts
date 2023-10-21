import { CacheType, ChatInputCommandInteraction, Embed, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import axios, { AxiosError, AxiosResponse } from 'axios';
import config from '../../config.json';

export = {
    data: new SlashCommandBuilder()
            .setName('weather')
            .setDescription("What's the weather like ?")
            .addStringOption(option =>
                option.setName("city")
                .setDescription("Select the city")
                .setRequired(true)
            ),

    async execute(interaction: ChatInputCommandInteraction<CacheType>) {
        const apiKey: string = config.weatherAPItoken;
        const BASE_URL: string = "http://api.weatherapi.com/v1/current.json";
        const params = {
            key: apiKey,
            q: interaction.options.getString("city"),
            aqi: "no" // air quality
        };

        await axios.get(BASE_URL, { params: params }).then(async (response: AxiosResponse) => {
            if(response.status != 200) throw Error;

            const body = response.data;
            const location = body["location"];
            const current = body["current"];
            const air_quality = body["current"]["air_quality"];

            const embed: EmbedBuilder = new EmbedBuilder()
                .setColor("#FD5E53")
                .setTitle("Weather in " + location["name"])
                .setDescription(location["country"])
                .setThumbnail(`http://${current["condition"]["icon"]}`)
                .addFields(
                    { name: "Condition", value: current["condition"]["text"] },
                    { name: "Temp °C", value: `${current["temp_c"]}`, inline: true },
                    { name: "Temp °F", value: `${current["temp_f"]}`, inline: true }
                )
                .addFields(
                    { name: "Precip_mm", value: `${current["precip_mm"]}`, inline: true },
                    { name: "Humidity", value: `${current["humidity"]}`, inline: true },
                    { name: "Cloud", value: `${current["cloud"]}`},
                );

            await interaction.reply({ embeds: [embed] });


        }).catch((error: Error | AxiosError)=> {
            if (axios.isAxiosError(error)) {
                console.error("Axios error occured:", error);
            } else {
                console.error("An error occured: ", error);
            }
        });
    }
}