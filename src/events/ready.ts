import { Client } from "discord.js";

export = {
    name: 'ready',
	once: true,
	execute(client: Client) {
		console.log(`${client.user?.tag} BUU BUU DESUWA !`);
	}
}