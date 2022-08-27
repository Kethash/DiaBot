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
    await serverconfigRepository.createIndex();
    const repositories = await serverconfigRepository.search().return.all();
    const res: string[] = repositories.map(e => e.toJSON().guildId);
    serverconfigRepository.dropIndex();
    return res;
}

export async function createConfig(guildID: string, guildName: string): Promise<ServerConfigSchema> {
    const [_redis, om]: [ReturnType<typeof createClient>, OmClient] = await connectToRedis();
    const serverconfigRepository = om.fetchRepository(serverconfig);
    const rep = serverconfigRepository.createAndSave({
        guildId: guildID,
        guildName: guildName,
        loveleaveChannelId: '',
        loveleaveTime: 5
    });
    return rep;
}

export async function getGuildConfig(guildID: string): Promise<ServerConfigSchema | null> {
    const [_redis, om]: [ReturnType<typeof createClient>, OmClient] = await connectToRedis();
    const serverconfigRepository = om.fetchRepository(serverconfig);
    await serverconfigRepository.createIndex();
    const res = await serverconfigRepository.search().where('guildId').matches(guildID).return.first();
    return res == null ? null : res;
}

export async function guildExists(guildID: string): Promise<Boolean> {
    const [_redis, om]: [ReturnType<typeof createClient>, OmClient] = await connectToRedis();
    const serverconfigRepository = om.fetchRepository(serverconfig);
    await serverconfigRepository.createIndex();
    const res: ServerConfigSchema | null = await serverconfigRepository.search().where('guildId').matches(guildID).return.first();
    return res == null ? false : true;
}