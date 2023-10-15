// Permet d'enregistrer des commandes, à lancer qu'une seule fois
import fs from 'fs';
import path from 'node:path';
import { SlashCommandBuilder, Routes } from 'discord.js';
import { REST } from '@discordjs/rest';
import config from '../../config.json';

const token = config.token;
const guildID = config.guildID;
const clientID = config.clientID;


const commands = [];
const commandsPath = path.join(__dirname, '../commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

// GLOBAL
rest.put(Routes.applicationCommands(clientID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);

// FOR A SPECIFIC GUILD
// rest.put(Routes.applicationGuildCommands(clientID, '768507412155334707'), { body: commands })
// 	.then(() => console.log('Successfully registered application commands for guild'))
// 	.catch((err) => console.error(err));
