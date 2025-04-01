import { SlashCommandBuilder } from 'discord.js'

export default  {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Replies with a list of commands that the bot will listen to and what those commands do'),
	async execute(interaction) {
		await interaction.reply('Hey there! Here is a list of valid commands: /ping, /help, /registerParty, /updatePartyRecord, /getUserData, /findParty, /bestParty');
	},
};