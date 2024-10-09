import connectToRedis from "../functions/connect-to-redis";
import { music, Music } from "../models/music";
import { createClient } from "redis";
import { Client as OmClient } from 'redis-om';
import axios, { AxiosResponse } from "axios";

export async function getMusicbyTitle(searchedTitle: string) {
    // const [_redis, om]: [ReturnType<typeof createClient>, OmClient] = await connectToRedis();
    // const musicRepository = om.fetchRepository(music);
    // await musicRepository.createIndex();
    // const fetchedmusic: Music[] = await musicRepository.search().where('title').match(searchedTitle).return.all();
    // return fetchedmusic;
    const res: AxiosResponse = await axios.get(`http://diaflask:5000/find/${searchedTitle.replace(' ','_')}`, { responseType: "json" });
    return res.data;
}

export async function getMusicbyGroup(searchedGroup: string) {
    const [_redis, om]: [ReturnType<typeof createClient>, OmClient] = await connectToRedis();
    const musicRepository = om.fetchRepository(music);
    await musicRepository.createIndex();
    const fetchedmusic: Music[] = await musicRepository.search().where('group').match(searchedGroup).return.all();
    return fetchedmusic;
}
