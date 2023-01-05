// Require the necessary discord.js classes
import * as Sentry from "@sentry/node";
import "@sentry/tracing";
import config from '../config.json';

Sentry.init({
    dsn: config.SENTRY_DNS,

    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,
});

// TEST

const transaction = Sentry.startTransaction({
    op: "test",
    name: "My First Test Transaction",
});

setTimeout(() => {
    try {
        throw new DOMException();
    } catch (e) {
        Sentry.captureException(e);
    } finally {
        transaction.finish();
    }
}, 99);

import { GatewayIntentBits, Partials } from 'discord.js';
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
