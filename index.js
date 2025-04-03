// Require the necessary discord.js classes
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { createRequire } from "module";
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';
import path from 'node:path'
import fs from 'node:fs';
import 'dotenv/config'

const __filename = fileURLToPath(import.meta.url);
const require = createRequire(import.meta.url);
const __dirname = path.dirname(__filename);
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

for(const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder); 
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for(const file of commandFiles) {
		try {
			const filePath = path.join(commandsPath, file);
			const command = await import(pathToFileURL(filePath));
	
			if(command.default.data && command.default.execute) {
				client.commands.set(command.default.data.name, command);
			} else {
				console.error(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
			}
		} catch (error) {
			console.error(error);
		}
	}
}

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if(!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if(!command) {
		console.error(`No matching command 4head, ${interaction.commandName} not found stoopid`);
		return;
	}

	try {
		await command.default.execute(interaction);
	} catch (error) {
		console.error(error);

		if(interaction.replied || interaction.deffered) {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});

client.login(process.env.BOT_TOKEN);