import dbCommands from '../../db_commands/db_commands.js'
import { SlashCommandBuilder } from 'discord.js'
import pg from "pg";

export default  {
	data: new SlashCommandBuilder()
		.setName('add_to_party')
		.setDescription('List out all members of a party')
		.addUserOption(option =>
            option.setName('new_member')
                .setDescription('The input should be the new members @ handle: "@newMember"')
                .setRequired(true)
		)
		.addStringOption(option => 
			option.setName('party_name')
				.setDescription('The name of the party you want to add the new member to. (case sensitive)')
				.setRequired(true)
		),
	async execute(interaction) {
		const newMember = interaction.options.getUser('new_member');
		const partyName = interaction.options.getString('party_name');
		const db = new pg.Client({
			user: process.env.DB_USER,
			host: process.env.DB_HOST,
			database: process.env.DB_NAME,
			password: process.env.DB_PASSWORD,
			port: parseInt(process.env.DB_PORT),
		});

		let replyStr = ``;
		
		db.connect();
		
		//Add user to users table if they havent been added already
		try {
			const response = await db.query(`INSERT INTO users (discord_id) VALUES($1)`, [newMember.id]);
		} catch (error) {
			console.error(error.message);
		}

		try {
			const curUser = await dbCommands.getUser(newMember.id, db);
			const curParty = await dbCommands.getParty(partyName, db);
			const curPartyMembers = await db.query(`SELECT user_id FROM user_parties WHERE party_id = $1`, [curParty.id]);

			//Check if new member is already in party
			curPartyMembers.rows.forEach(({ user_id }) => {
				if(user_id === curUser.id) {
					replyStr = "The person you wanted to add is already in this party."
					throw new Error("User is already in party");
				}
			});

			//Update party member list and size
			await db.query(`INSERT INTO user_parties (user_id, party_id) VALUES ($1, $2)`, [curUser.id, curParty.id]);

			await db.query(`UPDATE parties SET size = $1 WHERE name = $2`, [curParty.size + 1, curParty.name]);

			replyStr = "Successfully added member to party!";
		} catch (error) {
			console.error(error.message);
			if(replyStr.length === 0) {
				replyStr = "There was an error running this command."
			}
		}
		
		await db.end();

		await interaction.reply(replyStr);
	},
};