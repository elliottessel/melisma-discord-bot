const { SlashCommandBuilder } = require('discord.js');

const { getShows } = require('../sheets');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('outgoing')
    .setDescription('Shows reviews that are overdue'),

  async execute(interaction) {
    const shows = await getShows();

    const date = new Date();
   

    const outgoing = shows.filter(show => {
        const showDate = new Date(`${show.date}, 2026`); // get show date

        const missing = show.reviewWritten !== 'TRUE'; // check if review is missing

        const passed = showDate < date; // check if date is passed

        return missing && passed; // only return shows that are missing and past date
    });

    if (outgoing.length === 0) {
        return interaction.reply(
            'No outgoing reviews right now.'
        );
    }

    const message = outgoing.map(show =>
        `• ${show.artist} — ${show.reporter || 'Unassigned'} — ${show.date}`
        ).join('\n');

    await interaction.reply({
        content: `Outgoing Reviews:\n\n${message}`,
    });
  },
  
  

};