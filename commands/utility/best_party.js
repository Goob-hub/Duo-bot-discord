import dbCommands from '../../db_commands/db_commands.js'
import { SlashCommandBuilder } from 'discord.js';
import 'dotenv/config';
import pg from 'pg';

export default  {
	data: new SlashCommandBuilder()
		.setName('best_party')
		.setDescription('Find out which party has the best W-L ratio. (calculated by Wins - Losses)'),
	async execute(interaction) {
		const db = new pg.Client({
			user: process.env.DB_USER,
			host: process.env.DB_HOST,
			database: process.env.DB_NAME,
			password: process.env.DB_PASSWORD,
			port: parseInt(process.env.DB_PORT),
		});

		let bestParty;
		let replyStr;
		
		db.connect();

		try {
			const parties = await db.query("SELECT * FROM parties");

			if(parties.rows.length === 0) {
				replyStr = "No parties have been created yet.";
			}

			parties.rows.forEach(({name, wins, losses}) => {
				const ratio = wins - losses;

				if(bestParty === undefined) {
					bestParty = {name, ratio};
				} else if(bestParty.ratio < ratio) {
					bestParty = {name, ratio};
				}
			});
			
		} catch (error) {
			console.error(error.message);
			replyStr = "There was an error running this command.";
			return;
		}

		await db.end();

		if(bestParty !== undefined) {
			replyStr = `The best party is ${bestParty.name}. Their W-L ratio is ${bestParty.ratio}`
		}

		await interaction.reply(replyStr);
	},
};