import { Client, Collection, Events } from 'discord.js';
import fs from 'fs';
import connectToRedis from '../functions/connect-to-redis';
import path from 'node:path';
import * as Sentry from "@sentry/node";

class DiaBot extends Client {
    private diatabaseUnits = {
        'events': ['loveleave', 'startQuiz', 'onQuizzAnswer', 'removeQuiz', 'onQuizzSkip', 'onTournamentCreate'],
        'commands': ['setloveleavetime', 'setloveleavechannel', 'quizz', 'tournamentc', 'tournament']
    }

    commands = new Collection()

    async start(): Promise<void> {

        const [redisClient, redis_om] = await connectToRedis();

        const commandsPath = path.join(__dirname, '../commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = await import(filePath);
            // Set a new item in the Collection
            // With the key as the command name and the value as the exported module
            this.commands.set(command.data.name, command);
        }


        const eventsPath = path.join(__dirname, '../events');
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const event = require(filePath);
            if (event.once) {
                this.once(event.name, (...args) => {
                    try {
                        event.execute(...args);
                    } catch (e) {
                        Sentry.captureException(e);
                    }
                });
            } else if (this.diatabaseUnits["events"].includes(file.replace('.js', ''))) {
                this.on(event.name, (...args) => {
                    try {
                        event.execute(redisClient, ...args);
                    } catch (e) {
                        Sentry.captureException(e);
                    }
                });
            } else {
                this.on(event.name, (...args) => {
                    try {
                        event.execute(...args);
                    } catch (e) {
                        Sentry.captureException(e);
                    }
                });
            }
        }

        this.on(Events.InteractionCreate, async interaction => {
            if (!interaction.isChatInputCommand()) return;

            const command: any = this.commands.get(interaction.commandName);
            if (!command) return;

            try {
                if (this.diatabaseUnits["commands"].includes(interaction.commandName)) await command.execute(redisClient, interaction);
                else await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        });

        // Menu déroulant
        // this.on(Events.InteractionCreate, async interaction => {
        //     if (!interaction.isStringSelectMenu()) return;

        // })
    }

}

export { DiaBot }