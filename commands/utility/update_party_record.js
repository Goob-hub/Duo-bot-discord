import { SlashCommandBuilder } from 'discord.js';
import db_commands from '../../db_commands/db_commands.js';
import 'dotenv/config';
import pg from "pg";

export default  {
	data: new SlashCommandBuilder()
		.setName('update_party_record')
		.setDescription('Update your parties win/loss record! (only leader of party can do this)')
        .addStringOption(option =>
            option.setName('party_name')
                .setDescription('The name of the party you wish to update.')
                .setRequired(true)
        )
		.addBooleanOption(option => 
			option.setName("did_you_win")
				.setDescription("Select true for win and false for loss.")
				.setRequired(true)
		),
	async execute(interaction) {
		const interactionUser = await interaction.guild.members.fetch(interaction.user.id);
		const partyName = interaction.options.getString('party_name');
		const isWin = interaction.options.getBoolean('did_you_win');
		const userId = interactionUser.user.id;
		const db = new pg.Client({
			user: process.env.DB_USER,
			host: process.env.DB_HOST,
			database: process.env.DB_NAME,
			password: process.env.DB_PASSWORD,
			port: parseInt(process.env.DB_PORT),
		});

		let replyStr;
		
		db.connect();

		try {
			const party = await db_commands.getParty(partyName, db);

			if(party.leader !== userId) {
				replyStr = "Command failed. Only the party leader may update the party."
				throw new Error("Person using command is not party leader, abort!");
			}

			if(isWin) {
				party.wins += 1;
			} else {
				party.losses += 1;
			}

			const updateParty = await db.query("UPDATE parties SET wins = $1, losses = $2 WHERE name = $3", [party.wins, party.losses, party.name]);

			replyStr = "Successfully updated party record!";
			
		} catch (error) {
			console.error(error.message);
			
			if(replyStr === undefined) {
				replyStr = "Something went wrong :(!"
			}
		}

		await db.end();

		await interaction.reply(replyStr);
	},
};