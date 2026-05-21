const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { getShows } = require('../sheets');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('outgoing')
    .setDescription('Shows reviews that have been written but not edited/posted'),

  async execute(interaction) {
    await interaction.deferReply();

    const shows = await getShows();

    const date = new Date();

    const outgoing = shows.filter(show => {
        const currentYear = new Date().getFullYear();

        const showDate = new Date(`${show.date}, ${currentYear}`); // get show date

        const written = show.reviewWritten === 'TRUE'; // check if review has written
        
        const passed = showDate < date; // check if date is passed

        const posted = show.posted === 'TRUE'; // check if review is posted

        return written && passed && !posted; // only return shows that are written and past date
    });

    if (outgoing.length === 0) {
        return interaction.editReply(
            'No outgoing reviews right now.'
        );
    }

    const limited = outgoing.reverse().slice(0, 8);

    
    let description = '';

    limited.reverse().forEach((show, index) => {
        description += `• **${show.artist}** - ${show.date}\nReporter: ${show.reporter}\nEditor: ${show.editor || 'Unassigned'}\n\n`;
    });

    const embed = new EmbedBuilder()
        .setTitle('Outgoing Reviews')
        .setDescription(description);


    await interaction.editReply({
        embeds: [embed],
    });
  },
  
  

};