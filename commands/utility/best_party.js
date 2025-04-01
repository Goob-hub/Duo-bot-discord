import { SlashCommandBuilder } from 'discord.js'

export default  {
	data: new SlashCommandBuilder()
		.setName('bestParty')
		.setDescription('Find out which party has the best W/L ratio!'),
	async execute(interaction) {
		await interaction.reply('This has not been implemented yet.');
	},
};