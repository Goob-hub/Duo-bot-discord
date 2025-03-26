// Require the necessary discord.js classes
import 'dotenv/config'
import fs from 'node:fs';
import path from 'node:path'
import { fileURLToPath } from 'url';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

async function loadFromPath(path) {
	const { default: module } = await import(path);
	console.log(module);
	return module;
}

for(const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder); 
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for(const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = loadFromPath(filePath);

		if('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command)
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// When the client is ready, run this code (only once).
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
		await command.execute(interaction);
	} catch (error) {
		console.error(error);

		if(interaction.replied || interaction.deffered) {
			await interaction.followUp({content: "There was an error or something"})
		} else {
			await interaction.reply({content: "I'm gonna hand you a friggen packet yo"})
		}
	}
});

// Log in to Discord with your client's token
client.login(process.env.BOT_TOKEN);