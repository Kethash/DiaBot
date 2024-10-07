import connectToRedis from "../functions/connect-to-redis";
import { music, Music } from "../models/music";
import { createClient } from "redis";
import { Client as OmClient } from 'redis-om';

export async function getMusicbyTitle(searchedTitle: string): Promise<Music[]> {
    const [_redis, om]: [ReturnType<typeof createClient>, OmClient] = await connectToRedis();
    const musicRepository = om.fetchRepository(music);
    await musicRepository.createIndex();
    const fetchedmusic: Music[] = await musicRepository.search().where('title').match(searchedTitle).return.all();
    return fetchedmusic;
}

export async function getMusicbyGroup(searchedGroup: string): Promise<Music[]> {
    const [_redis, om]: [ReturnType<typeof createClient>, OmClient] = await connectToRedis();
    const musicRepository = om.fetchRepository(music);
    await musicRepository.createIndex();
    const fetchedmusic: Music[] = await musicRepository.search().where('group').match(searchedGroup).return.all();
    return fetchedmusic;
}
