import axios, { AxiosResponse } from "axios";
import { StringSelectMenuInteraction, CacheType } from "discord.js";

export async function downloadMusic(searchedTitle: string): Promise<{data: {buffer: Buffer,title: string, link: string} | null, succeed: boolean}> {
    let audioBuffer: Buffer | null = null;
    let music_data = null;
    try {
        const music = await axios.get(`http://diaflask:5000/get/${searchedTitle.replace(' ','_')}`, { responseType: "json" });
        music_data = music.data[0];
        const res: AxiosResponse = await axios.get(music_data.audio_url, { responseType: "arraybuffer" });
        audioBuffer = Buffer.from(res.data, 'binary');
    } catch(error) {
        console.error(`Couldn't download: ${searchedTitle}`)
        return {data: null, succeed: false};
    }

    return {data: {buffer: audioBuffer, title: music_data.title, link: music_data.link}, succeed: true};
}

export async function createReply(interaction: StringSelectMenuInteraction<CacheType>) {

}
