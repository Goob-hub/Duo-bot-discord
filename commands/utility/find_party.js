import { SlashCommandBuilder } from 'discord.js'

export default  {
	data: new SlashCommandBuilder()
		.setName('find_party')
		.setDescription('Find a party and its members by name.'),
	async execute(interaction) {
		await interaction.reply('This has not been implemented yet.');
	},
};