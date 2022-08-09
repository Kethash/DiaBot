import { Client, Guild } from "discord.js";
import { createClient } from "redis";

export = {
    name: 'ready',
	once: true,
	async execute(client: Client) {
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

		redisClient.set('584018480853155842:loveleavechannel', '807908826840825856') // default channel # in lovelivefr
		
		const Guilds: string[] = client.guilds.cache.map( (guild: Guild) => guild.id);
		for (const id of Guilds) {
			redisClient.set(`${id}:loveleavetime`, 5); // default loveleave time (5 minutes)
		}

		await redisClient.quit();

		console.log("Diatabase initialized");
		console.log(`${client.user?.tag} BUU BUU DESUWA !`);
	}
}