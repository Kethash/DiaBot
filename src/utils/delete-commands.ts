import { SlashCommandBuilder, Routes } from 'discord.js';
import { REST } from '@discordjs/rest';
import config from '../../config.json';

const token = config.token;
const guildID = config.guildID;
const clientID = config.clientID;

const rest = new REST({ version: '10' }).setToken(token);

// DELETE ALL COMMANDS

// for guild-based commands
// rest.put(Routes.applicationGuildCommands(clientID, '768507412155334707'), { body: [] })
// 	.then(() => console.log('Successfully deleted all guild commands.'))
// 	.catch(console.error);

// // for global commands
rest.put(Routes.applicationCommands(clientID), { body: [] })
	.then(() => console.log('Successfully deleted all application commands.'))
	.catch(console.error);


