import { SlashCommandBuilder } from 'discord.js'

export default  {
	data: new SlashCommandBuilder()
		.setName('get_party_members')
		.setDescription('Gets the members of a specified party'),
	async execute(interaction) {
		await interaction.reply('Im gonna hand you a friggen packet yo!');
	},
};