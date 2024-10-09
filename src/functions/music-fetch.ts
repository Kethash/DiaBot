import axios, { AxiosResponse } from "axios";
import { Music } from "../models/music";

export async function downloadMusic(url: string): Promise<{data: Buffer | null, succeed: boolean}> {
    let audioBuffer: Buffer | null = null;

    try {
        const res: AxiosResponse = await axios.get(`https://static.wikia.nocookie.net/love-live/images/${url}`, { responseType: "arraybuffer" });
        audioBuffer = Buffer.from(res.data, 'binary');
    } catch(error) {
        console.error(`Couldn't download: ${url}`)
        return {data: null, succeed: false};
    }

    return {data: audioBuffer, succeed: true};
}
