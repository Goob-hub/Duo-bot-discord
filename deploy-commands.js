import { REST, Routes } from 'discord.js';
import { createRequire } from "module";
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';
import path from 'node:path';
import fs from 'node:fs';
import 'dotenv/config';
import { error } from 'node:console';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
const commands = [];

for(const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
		try {
			const filePath = path.join(commandsPath, file);
			const command = await import(pathToFileURL(filePath));

			if (command.default.data && command.default.execute) {
				commands.push(command.default.data.toJSON());
			} else {
				console.error(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
			}
		} catch (error) {
			console.error(error);
		}
	}
}

const rest = new REST().setToken(process.env.BOT_TOKEN);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		const data = await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
			{ body: commands },
		);
		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();