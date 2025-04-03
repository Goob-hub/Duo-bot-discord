import { SlashCommandBuilder } from 'discord.js'

export default  {
	data: new SlashCommandBuilder()
		.setName('get_user_data')
		.setDescription('List the parties that this user is assosiated with.'),
	async execute(interaction) {
		await interaction.reply('This has not been implemented yet.');
	},
};