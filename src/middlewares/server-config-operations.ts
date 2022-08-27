import connectToRedis from "../functions/connect-to-redis";
import { serverconfig } from "../models/diatabase";
import { Client as OmClient } from 'redis-om';
import { createClient } from 'redis';

export async function setloveleavechannel(serverconfigId: string, newLLChannelId: string): Promise<void> {
    const [_redis, om]: [ReturnType<typeof createClient>, OmClient] = await connectToRedis();
    const serverconfigRepository = om.fetchRepository(serverconfig);
    await serverconfigRepository.createIndex();
    const sc = await serverconfigRepository.fetch(serverconfigId);
    sc.loveleaveChannelId = newLLChannelId;
    await serverconfigRepository.save(sc);
}

export async function setloveleavetime(serverconfigId: string, newLLTime: number): Promise<void> {
    const [_redis, om]: [ReturnType<typeof createClient>, OmClient] = await connectToRedis();
    const serverconfigRepository = om.fetchRepository(serverconfig);
    await serverconfigRepository.createIndex();
    const sc = await serverconfigRepository.fetch(serverconfigId);
    sc.loveleaveTime = newLLTime;
    await serverconfigRepository.save(sc);
}