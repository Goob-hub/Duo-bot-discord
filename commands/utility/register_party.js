import dbCommands from '../../db_commands/db_commands.js'
import { SlashCommandBuilder } from 'discord.js';
import 'dotenv/config';
import pg from 'pg';

export default {
    data: new SlashCommandBuilder()
        .setName('register_party')
        .setDescription('This command will register a party and its members to the database.')
        .addUserOption(option =>
            option.setName('party_leader')
                .setDescription('The input should be @yourusername and nothing else.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('party_name')
                .setDescription('A name for this party. (case sensitive)')
                .setRequired(true)
        ),
    async execute(interaction) {
        const partyLeader = interaction.options.getUser('party_leader');
        const partyName = interaction.options.getString('party_name');

        const db = new pg.Client({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: parseInt(process.env.DB_PORT),
        });
        
        db.connect();
        
        try {
            const response = await db.query(`INSERT INTO users (discord_id) VALUES($1)`, [partyLeader.id]);
        } catch (error) {
            console.error(error.message);
        }

        try {
            const user = await dbCommands.getUser(partyLeader.id, db);
            const response = await db.query(`INSERT INTO parties (name, leader, size, wins, losses) VALUES($1, $2, $3, $4, $5) RETURNING id`, [partyName, partyLeader.id, 1, 0, 0]);
            
            await db.query(`INSERT INTO user_parties (user_id, party_id) VALUES ($1, $2)`, [user.id, response.rows[0].id]);
        } catch (error) {
            console.error(error.message);
            await interaction.reply(`Failed to register party.`);
            await db.end();
            return;
        }

        await interaction.reply(`Successfully registered party!`);

        await db.end();
    },
};