import connectToRedis from "../functions/connect-to-redis";
import { quizz, quizzplayer, QuizzPlayerSchema, QuizzSchema } from "../models/diatabase";
import { Client as OmClient } from 'redis-om';
import { createClient } from 'redis';

export async function createQuizz(guildID: string, quizzName: string): Promise<string> {
    const [_redis, om]: [ReturnType<typeof createClient>, OmClient] = await connectToRedis();
    const quizzRepository = om.fetchRepository(quizz);
    const newQuizz = await quizzRepository.createAndSave({
        name: quizzName,
        guildID: guildID,
        players: [],
    })

    return newQuizz.entityId;
}

export async function searchQuizz(guildID: string, quizzName: string): Promise<Record<string, any> | null> {
    const [_redis, om]: [ReturnType<typeof createClient>, OmClient] = await connectToRedis();
    const quizzRepository = om.fetchRepository(quizz);
    await quizzRepository.createIndex();
    const res: QuizzSchema | null = await quizzRepository.search().where('guildID').equals(guildID).and('name').matches(quizzName).return.first();
    return res == null ? null : res.toJSON();
}

export async function getQuizzs(guildID: string) {
    const [_redis, om]: [ReturnType<typeof createClient>, OmClient] = await connectToRedis();
    const quizzRepository = om.fetchRepository(quizz);
    await quizzRepository.createIndex();
    const res: QuizzSchema[] = await quizzRepository.search().where('guildID').matches(guildID).return.all();
    return res.map(e => e.toJSON());
}

export async function deleteQuizz(guildID: string, quizzName: string): Promise<void> {
    const [_redis, om]: [ReturnType<typeof createClient>, OmClient] = await connectToRedis();
    const quizzRepository = om.fetchRepository(quizz);
    const quizzToDeleteId: string = (await searchQuizz(guildID, quizzName))?.entityId;
    await deletePlayers(guildID, quizzName);
    await quizzRepository.remove(quizzToDeleteId);
}

// Players

export async function createPlayer(playername: string, guildID: string, quizzName: string): Promise<void> {
    const [_redis, om]: [ReturnType<typeof createClient>, OmClient] = await connectToRedis();
    const playersRepository = om.fetchRepository(quizzplayer);
    const quizz = await searchQuizz(guildID, quizzName);
    const player = await playersRepository.createAndSave({
        name: playername,
        quizzID: quizz?.entityId,
        score: 0
    })
    quizz?.addPlayer(player.entityId);
}

export async function searchPlayer(playername: string): Promise<Record<string, any>[]> {
    const [_redis, om]: [ReturnType<typeof createClient>, OmClient] = await connectToRedis();
    const playersRepository = om.fetchRepository(quizzplayer);
    await playersRepository.createIndex();
    const res: QuizzPlayerSchema[] = await playersRepository.search().where('name').matches(playername).return.all();
    return res.map(e => e.toJSON());
}

export async function getQuizzPlayer(playername: string, guildID: string, quizzName: string): Promise<QuizzPlayerSchema | null> {
    const [_redis, om]: [ReturnType<typeof createClient>, OmClient] = await connectToRedis();
    const playersRepository = om.fetchRepository(quizzplayer);
    await playersRepository.createIndex();
    const quizzID = (await searchQuizz(guildID, quizzName))?.entityId;
    const res = await playersRepository.search().where('name').matches(playername).and('quizzID').equals(quizzID).return.first();
    return res == null ? null : res;
}

export async function getQuizzAllPlayers(guildID: string, quizzName: string): Promise<Record<string, any>[]> {
    const [_redis, om]: [ReturnType<typeof createClient>, OmClient] = await connectToRedis();
    const playersRepository = om.fetchRepository(quizzplayer);
    await playersRepository.createIndex();
    const quizzID: string = (await searchQuizz(guildID, quizzName))?.entityId;
    const res: QuizzPlayerSchema[] = await playersRepository.search().where('quizzID').matches(quizzID).return.all();
    return res.map(e => e.toJSON());
}

export async function deletePlayers(guildID: string, quizzName: string): Promise<void> {
    const [_redis, om]: [ReturnType<typeof createClient>, OmClient] = await connectToRedis();
    const playersRepository = om.fetchRepository(quizzplayer);
    const playerIDs: string[] = (await getQuizzAllPlayers(guildID, quizzName)).map(e => e.entityId);
    playerIDs.forEach(async (e) => await playersRepository.remove(e));
}