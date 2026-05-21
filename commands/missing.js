const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { getShows } = require('../sheets');

// TODO: Add "Urgent Tag" if show was > 2 weeks ago && not written

module.exports = {
  data: new SlashCommandBuilder()
    .setName('missing')
    .setDescription('Shows reviews that have been not written yet'),

  async execute(interaction) {
    await interaction.deferReply();

    const shows = await getShows();

    const date = new Date();
    const twoWeeks = new Date(date.getTime() + 14 * 24 * 60 * 60 * 1000);

    const missing = shows.filter(show => {
        const currentYear = new Date().getFullYear();

        const showDate = new Date(`${show.date}, ${currentYear}`); // get show date

        const attended = show.attended === 'TRUE'; // check if attended

        const missing = show.reviewWritten !== 'TRUE'; // check if review is missing
        
        const passed = showDate < date; // check if date is passed

        return attended && missing && passed; // only return shows that are missing and past date
    });

    if (missing.length === 0) {
        return interaction.editReply(
            'No missing reviews right now.'
        );
    }

    
    let description = '';

    missing.forEach((show, index) => {
        const withinTwoWeeks = new Date(`${show.date}, ${new Date().getFullYear()}`) <= twoWeeks;
        if (!withinTwoWeeks) {
            description += `• **${show.artist}**\nReporter: ${show.reporter || 'Unassigned'}\nDate: ${show.date}\n\n`;
        } else {
            description += `• **${show.artist}** - :rotating_light: Overdue :rotating_light:\nReporter: ${show.reporter || 'Unassigned'}\nDate: ${show.date}\n\n`;
        }
    });

    const embed = new EmbedBuilder()
        .setTitle('Missing Reviews')
        .setDescription(description);

    await interaction.editReply({
        embeds: [embed],
    });
  },
  
  

};