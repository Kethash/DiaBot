// Require the necessary discord.js classes
import { GatewayIntentBits, Partials } from 'discord.js';
import config from '../config.json';
import { DiaBot } from './structures/DiaBot';

// Create a new client instance
const client = new DiaBot({
    intents: [GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions],
    partials: [Partials.Reaction]
});
client.start();

// Login to Discord with your client's token
client.login(config.token);
