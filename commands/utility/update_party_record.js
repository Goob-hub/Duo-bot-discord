import { SlashCommandBuilder } from 'discord.js';
import db_commands from '../../db_commands/db_commands.js';
import pg from "pg";

export default  {
	data: new SlashCommandBuilder()
		.setName('update_party_record')
		.setDescription('Update your parties win/loss record! (only leader of party can do this)')
        .addStringOption(option =>
            option.setName('party_name')
                .setDescription('The name of the party you wish to update.')
                .setRequired(true)
        ),
	async execute(interaction) {
		const interactionUser = await interaction.guild.members.fetch(interaction.user.id);
		const partyName = interaction.options.getString('party_name');
		const userId = `@<${interactionUser.user.id}>`;

		const db = new pg.Client({
			user: process.env.DB_USER,
			host: process.env.DB_HOST,
			database: process.env.DB_NAME,
			password: process.env.DB_PASSWORD,
			port: parseInt(process.env.DB_PORT),
		});
		
		db.connect();

		try {
			const party = await db_commands.getParty(partyName, db);

			if(party.leader !== userId) {
				throw new Error("Person using command is not party leader, abort!");
			}

			//Update win loss
			
		} catch (error) {
			console.error(error.message);
			await db.end();
			await interaction.reply('Something went wrong :(!');
			return;
		}

		await db.end();

		await interaction.reply('This command is in progress. Stop or i will hand you a friggen packet yo');
	},
};