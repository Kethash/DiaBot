import { Client, Guild } from "discord.js";
import connectToRedis from "../functions/connect-to-redis";
import { createClient } from "redis";
import { Client as OmClient } from 'redis-om'
import { serverconfig, ServerConfigSchema } from "../models/diatabase";
import { getAllConfigs } from "../controllers/server-configs";

export = {
    name: 'ready',
	once: true,
	async execute(client: Client) {

		const [redisClient, redis_om]: [ReturnType<typeof createClient>, OmClient] = await connectToRedis();
		const serverSettingsRepository = redis_om.fetchRepository(serverconfig);
		
		const Guilds: { id: string; name: string; }[] = client.guilds.cache.map( (guild: Guild) => {
			return {
				id: guild.id,
				name: guild.name
			}
		});
		const serverRepositories: ServerConfigSchema[] = await getAllConfigs();
		
		for (const guild of Guilds) {
			serverSettingsRepository.createAndSave({
				guildId: guild.id,
				guildName: guild.name,
				loveleaveChannelId: '',
				loveleaveTime: 5
			});
		}

		await redisClient.quit();

		console.log("Diatabase initialized");
		console.log(`${client.user?.tag} BUU BUU DESUWA !`);
	}
}