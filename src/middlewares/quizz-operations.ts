import connectToRedis from "../functions/connect-to-redis";
import { quizz, quizzplayer, QuizzPlayerSchema, QuizzSchema } from "../models/diatabase";
import { Client as OmClient } from 'redis-om';
import { createClient } from 'redis';
import { getQuizzPlayer, searchQuizz } from "controllers/quizz";

export async function incrementPlayerScore(playername: string, guildID: string, quizzName: string): Promise<void> {
    const [_redis, om]: [ReturnType<typeof createClient>, OmClient] = await connectToRedis();
    const playersRepository = om.fetchRepository(quizzplayer);
    await playersRepository.createIndex();
    const player: QuizzPlayerSchema | null = await getQuizzPlayer(playername, guildID, quizzName);
    player?.increment();
}