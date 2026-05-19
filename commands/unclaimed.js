const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const { getShows } = require('../sheets');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unclaimed')
    .setDescription('Unclaimed Press'),

  async execute(interaction) {
    await interaction.deferReply();

    const shows = await getShows();

    const date = new Date();
    const unclaimed = shows.filter(show => {
        const noReporter =
            !show.reporter;

        return noReporter;
    });
  
  }

};