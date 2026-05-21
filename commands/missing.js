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

    const limited = missing.reverse().slice(0, 8);
    
    let description = '';

    limited.reverse().forEach((show, index) => {
        description += `• **${show.artist}**\nReporter: ${show.reporter || 'Unassigned'}\nDate: ${show.date}\n\n`;
    });

    const embed = new EmbedBuilder()
        .setTitle('Missing Reviews')
        .setDescription(description);

    await interaction.editReply({
        embeds: [embed],
    });
  },
  
  

};