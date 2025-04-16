import { SlashCommandBuilder } from 'discord.js';
import db_commands from '../../db_commands/db_commands.js';
import 'dotenv/config';
import pg from "pg";

export default  {
	data: new SlashCommandBuilder()
		.setName('get_party_members')
		.setDescription('Gets the members of a specified party')
		.addStringOption(option =>
            option.setName('party_name')
                .setDescription('The name of the party you wish to get the members of.')
                .setRequired(true)
        ),
	async execute(interaction) {
		const partyName = interaction.options.getString("party_name");
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
			const partyData = await db_commands.getParty(partyName, db);
			const userIds = await db.query("SELECT user_id FROM user_parties WHERE party_id = $1", [partyData.id]);

			let idQuery = ""

			userIds.rows.forEach(({user_id}, index) => {
				if(index === userIds.rows.length - 1) {
					idQuery += `${user_id}`;
				} else {
					idQuery += `${user_id}, `;
				}
			});

			const partyMembersData = await db.query(`SELECT discord_id FROM users WHERE id in (${idQuery})`);
			const memberNicknames = await getMemberNicknames(partyMembersData.rows, interaction);

			if(memberNicknames !== undefined && memberNicknames.length > 0) {
				replyStr = `The party members of ${partyName} are:`
	
				memberNicknames.forEach(nickname => {
					replyStr += `\n ${nickname}`;
				});
			} else {
				replyStr = "Failed to get party members";
			}

		} catch (error) {
			console.error(error);
			if(replyStr === undefined) {
				replyStr = "Something went wrong";
			}
		}
		
		await db.end();

		await interaction.reply(replyStr);
	},
};

async function getMemberNicknames(discordIds, interaction) {
	const nicknames = [];
			
	for (let i = 0; i < discordIds.length; i++) {
		const {discord_id} = discordIds[i];
		const interactionUser = await interaction.guild.members.fetch(discord_id);
		
		nicknames.push(interactionUser.nickname);
	}

	return nicknames;
}