import { SlashCommandBuilder } from 'discord.js'

export default  {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Im gonna hand you a friggen packet yo!'),
	async execute(interaction) {
		await interaction.reply('Im gonna hand you a friggen packet yo!');
	},
};