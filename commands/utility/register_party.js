import { SlashCommandBuilder } from 'discord.js';
import pg from 'pg';

export default {
    data: new SlashCommandBuilder()
        .setName('register_party')
        .setDescription('This command will register a party and its members to the database.')
        .addStringOption(option =>
            option.setName('party_members')
                .setDescription('A list of users in this party, should list party members like this: @user1,@user2,@user3')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('party_name')
                .setDescription('A name for this party.')
                .setRequired(true)
        ),
    async execute(interaction) {
        const input1 = interaction.options.getString('party_members');
        const input2 = interaction.options.getString('party_name');
        
        //Connect to database and store data in respective tables

        await interaction.reply(`Input 1: ${input1}, Input 2: ${input2}`);
    },
};