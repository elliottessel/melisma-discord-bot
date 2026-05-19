const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { getShows } = require('../sheets');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('outgoing')
    .setDescription('Shows reviews that have been covered and not posted'),

  async execute(interaction) {
    await interaction.deferReply();

    const shows = await getShows();

    const date = new Date();

   
    shows.forEach(show => {
        if (show.artist?.toLowerCase().includes('yhwh')) {
            console.log('YHWH show:', JSON.stringify(show));
        }
    });

    const outgoing = shows.filter(show => {
        const currentYear = new Date().getFullYear();

        const showDate = new Date(`${show.date}, ${currentYear}`); // get show date

        const attended = show.attended === 'TRUE'; // check if attended

        const missing = show.reviewWritten !== 'TRUE'; // check if review is missing
        
        const passed = showDate < date; // check if date is passed

        return attended && missing && passed; // only return shows that are missing and past date
    });

    if (outgoing.length === 0) {
        return interaction.editReply(
            'No outgoing reviews right now.'
        );
    }

    

    const limited = outgoing.reverse().slice(0, 8);

    
    let description = '';

    limited.reverse().forEach((show, index) => {
        description += `• **${show.artist}**\nReporter: ${show.reporter || 'Unassigned'}\nDate: ${show.date}\n\n`;
    });

    const embed = new EmbedBuilder()
        .setTitle('Outgoing Reviews')
        .setDescription(description);

    // const message = limited.map(show =>

    //     `• ${show.artist}
    //     Reporter: ${show.reporter || 'Unassigned'}
    //     Date: ${show.date}`

    // ).join('\n\n');

    await interaction.editReply({
        embeds: [embed],
    });
  },
  
  

};