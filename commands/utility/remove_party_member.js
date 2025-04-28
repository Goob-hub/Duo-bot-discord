import db_commands from '../../db_commands/db_commands.js'
import { SlashCommandBuilder } from 'discord.js';
import 'dotenv/config';
import pg from 'pg';

export default  {
	data: new SlashCommandBuilder()
		.setName('remove_party_member')
		.setDescription('Remove a specified member from your party.')
		.addUserOption(option =>
            option.setName('user')
                .setDescription('The user that you wish to remove from your party')
                .setRequired(true)
        )
		.addStringOption(option =>
            option.setName('party_name')
                .setDescription('The name of the party that you are changing.')
                .setRequired(true)
        ),
	async execute(interaction) {
		const {user: interactionUser} = await interaction.guild.members.fetch(interaction.user.id);
		const {id: userId} = interaction.options.getUser("user");
		const partyName = interaction.options.getString("party_name");
		const db = new pg.Client({
			user: process.env.DB_USER,
			host: process.env.DB_HOST,
			database: process.env.DB_NAME,
			password: process.env.DB_PASSWORD,
			port: parseInt(process.env.DB_PORT),
		});

		let replyStr = ``;
		
		db.connect();

		try {
			const party = await db_commands.getParty(partyName, db);
			const user = await db_commands.getUser(userId, db);
			
			if(party === undefined) {
				replyStr = "Command failed. There is no party that goes by that name.";
				throw new Error("There is no party by the specified name.");
			} else if(party.leader !== interactionUser.id) {
				replyStr = "Command failed. Only the party leader may update the party."
				throw new Error("Person using command is not party leader, abort!");
			} else if(party.leader === userId) {
				replyStr = "Command failed. You cannot remove the party leader from the party!";
				throw new Error("Cant remove party leader from party.");
			}

			const removeUser = await db.query("DELETE from user_parties WHERE party_id = $1 AND user_id = $2", [party.id, user.id]);

			replyStr = "Successfully removed user from party!";

		} catch (error) {
			console.error(error.message);

			if(replyStr.length === 0) {
				replyStr = "There was an error running this command.";
			}
		}

		await db.end();

		await interaction.reply(replyStr);
	},
};