import { Client, Guild } from "discord.js";
import connectToRedis from "../functions/connect-to-redis";
import { createClient } from "redis";
import { Client as OmClient } from 'redis-om'
import { serverconfig, ServerConfigSchema } from "../models/diatabase";
import { getAllConfigs, getAllIds, getAllServerconfigs } from "../controllers/server-configs";

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
		const serverIDs: string[] = await getAllIds();
		
		// entering new servers into the database
		for (const guild of Guilds) {
			if (!serverIDs.includes(guild.id)) {
				serverSettingsRepository.createAndSave({
					guildId: guild.id,
					guildName: guild.name,
					loveleaveChannelId: '',
					loveleaveTime: 5
				});
			}
		}

		await redisClient.quit();

		console.log("Diatabase initialized");
		console.log(`${client.user?.tag} BUU BUU DESUWA !`);
	}
}