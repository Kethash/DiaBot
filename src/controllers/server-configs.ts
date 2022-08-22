import connectToRedis from "../functions/connect-to-redis";
import { serverconfig, ServerConfigSchema } from "../models/diatabase";
import { Client as OmClient } from 'redis-om';
import { createClient } from 'redis';

export async function getAllConfigs(): Promise<ServerConfigSchema[]> {
    const [_redis, om]: [ReturnType<typeof createClient>, OmClient] = await connectToRedis();
    const serverconfigRepository = om.fetchRepository(serverconfig);
    serverconfigRepository.createIndex();
    const res: ServerConfigSchema[] = await serverconfigRepository.search().return.all();
    serverconfigRepository.dropIndex();
    return res;
}

export async function getAllServerconfigs(): Promise<Record<string, any>[]> {
    const [_redis, om]: [ReturnType<typeof createClient>, OmClient] = await connectToRedis();
    const serverconfigRepository = om.fetchRepository(serverconfig);
    serverconfigRepository.createIndex();
    const res: ServerConfigSchema[] = await serverconfigRepository.search().return.all();
    serverconfigRepository.dropIndex();
    return res.map(e => e.toJSON());
}

export async function getAllIds(): Promise<string[]> {
    const [_redis, om]: [ReturnType<typeof createClient>, OmClient] = await connectToRedis();
    const serverconfigRepository = om.fetchRepository(serverconfig);
    serverconfigRepository.createIndex();
    const repositories = await serverconfigRepository.search().return.all()
    const res: string[] = repositories.map(e => e.toJSON().entityId);

    serverconfigRepository.dropIndex();
    return res;
}