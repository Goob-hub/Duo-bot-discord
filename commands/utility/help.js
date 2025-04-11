import { SlashCommandBuilder } from 'discord.js';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { createRequire } from "module";
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';
import path, { dirname } from 'node:path'
import fs from 'node:fs';
import 'dotenv/config'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const foldersPath = path.join(__dirname);
const commandFolders = fs.readdirSync(foldersPath);
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

export default  {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Replies with a list of commands that the bot will listen to and what those commands do'),
	async execute(interaction) {
		let replyStr = "Hey there! Here is a list of valid commands:"
		try {
			const files = fs.readdirSync(__dirname);
			files.forEach(file => {
				let name = file.split(".js")[0];
				replyStr += `\n/${name}`;
			});
		} catch (err) {
			console.error("Error reading directory:", err);
		}
		await interaction.reply(replyStr);
	},
};