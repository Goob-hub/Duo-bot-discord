import { SlashCommandBuilder } from 'discord.js'

export default  {
	data: new SlashCommandBuilder()
		.setName('updatePartyRecord')
		.setDescription('Add a win or a loss to your parties total win/loss count!'),
	async execute(interaction) {
		await interaction.reply('This has not been implemented yet.');
	},
};