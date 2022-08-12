// Connect to redis
import {createClient} from 'redis';
import { Client as OmClient } from 'redis-om'

export default async function connectToRedis() {
    // Default port: 6379
    const redisClient = createClient({
        socket: {
            host: 'diatabase',
            port: 6379
        }
    });
    await redisClient.connect();
    redisClient.on('connect', function() {
        console.log('Diatabase connected!');
    });

    const redis_om = await new OmClient().use(redisClient);
    
    return [redisClient, redis_om];
}