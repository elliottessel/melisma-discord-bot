const { SlashCommandBuilder } = require('discord.js');

const { getShows } = require('../sheets');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('outgoing')
    .setDescription('Shows reviews that are overdue'),

  async execute(interaction) {
    await interaction.deferReply();

    const shows = await getShows();

    const date = new Date();
   

    const outgoing = shows.filter(show => {
        const showDate = new Date(`${show.date}, 2026`); // get show date

        const attended = show.attended === 'TRUE'; // check if attended
        console.log(show.attended);

        const missing = show.reviewWritten !== 'TRUE'; // check if review is missing

        const passed = showDate < date; // check if date is passed

        return attended && missing && passed; // only return shows that are missing and past date
    });

    if (outgoing.length === 0) {
        return interaction.editReply(
            'No outgoing reviews right now.'
        );
    }

    const limited = outgoing.slice(0, 5);

    const message = limited.map(show =>

        `• ${show.artist}
        Reporter: ${show.reporter || 'Unassigned'}
        Date: ${show.date}`

    ).join('\n\n');

    await interaction.editReply({
        content: `Outgoing Reviews:\n\n${message}`,
    });
  },
  
  

};