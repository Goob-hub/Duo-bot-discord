import dbCommands from '../../db_commands/db_commands.js'
import { SlashCommandBuilder } from 'discord.js';
import 'dotenv/config';
import pg from 'pg';

export default  {
	data: new SlashCommandBuilder()
		.setName('get_user_parties')
		.setDescription('List the parties that the specified user is assosiated with.')
		.addUserOption(option =>
            option.setName('user')
                .setDescription('The input should be @username and nothing else.')
                .setRequired(true)
        ),
	async execute(interaction) {
		const user = interaction.options.getUser("user");
		const db = new pg.Client({
			user: process.env.DB_USER,
			host: process.env.DB_HOST,
			database: process.env.DB_NAME,
			password: process.env.DB_PASSWORD,
			port: parseInt(process.env.DB_PORT),
		});

		let replyStr = `${user.globalName} is a part of the following parties:`;
		
		db.connect();

		try {
			const userData = await db.query(`SELECT * FROM users WHERE discord_id = $1`, [user.id]);
			const userPartiesIds = await db.query("SELECT * FROM user_parties WHERE user_id = $1", [userData.rows[0].id]);

			for (let i = 0; i < userPartiesIds.rows.length; i++) {
				const partyId = userPartiesIds.rows[i].party_id;
				const response = await db.query("SELECT * FROM parties WHERE id = $1", [partyId]);

				if(response.rows[0] !== undefined) {
					let partyName = response.rows[0].name;
					replyStr += `\n${partyName}`;
				}
			}
			
		} catch (error) {
			console.error(error.message);
			db.end();
			await interaction.reply("There was an error fetching data");
		}

		db.end();

		await interaction.reply(replyStr);
	},
};