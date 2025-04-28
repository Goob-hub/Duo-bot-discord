import db_commands from '../../db_commands/db_commands.js'
import { SlashCommandBuilder } from 'discord.js';
import 'dotenv/config';
import pg from 'pg';

export default  {
	data: new SlashCommandBuilder()
		.setName('delete_party')
		.setDescription("delete a party you own and all of it's related data.")
        .addStringOption(option =>
            option.setName('party_name')
                .setDescription('The name of the party you wish to delete.')
                .setRequired(true)
        ),
	async execute(interaction) {
        const {user: interactionUser} = await interaction.guild.members.fetch(interaction.user.id);
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
            const partyQuery = await db.query("SELECT * FROM parties WHERE name = $1", [partyName]);
            
            if(partyQuery.rows.length === 0) {
                replyStr = "There are no parties that go by that name.";
                throw new Error("There are no parties that go by that name");
            } else if(interactionUser.id !== partyQuery.rows[0].leader) {
                replyStr = "Only the party leader can delete the party!";
                throw new Error("The user running this command is not the party leader, kill them!");
            }
            
            const partyId = partyQuery.rows[0].id;
            const deleteMembers = await db.query("DELETE from user_parties WHERE party_id = $1", [partyId]);
            const deleteParty = await db.query("DELETE from parties WHERE id = $1", [partyId]);

            replyStr = `Command was successfully run! ${partyName} and all of its related data have been deleted!`;

        } catch (error) {
            console.error(error.message);

            if(replyStr.length === 0) {
                replyStr = "There was an error while using this command";
            }
        }

        await db.end();

		await interaction.reply(replyStr);
	},
};