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
        const noReporter = !show.reporter;

        const offered = show.pressOffer === 'TRUE';

        const currentYear = new Date().getFullYear();

        const showDate = new Date(`${show.date}, ${currentYear}`); // get show date

        const future = showDate > date; // check if date is passed

        return noReporter && offered && future; // only return shows that are unclaimed, offered, and future date
    });

    if (unclaimed.length === 0) {
        return interaction.editReply(
            'No unclaimed press right now.'
        );
    }

    const components = [];
    const buttons = [];

    let description = '';

    // for (const show of unclaimed) {
    //     const embed = new EmbedBuilder()
    //         .setTitle(show.artist)
    //         .addFields(
    //             { name: 'Date', value: show.date, inline: true },
    //             { name: 'Venue', value: show.venue, inline: true },
    //         );

    //     const button = new ButtonBuilder()
    //         .setCustomId(`claim_${show.rowNumber}`)
    //         .setLabel('Claim')
    //         .setStyle(ButtonStyle.Primary);

    //     const row = new ActionRowBuilder().addComponents(button);

    //     embeds.push(embed);
    //     components.push(row);
    // }

    unclaimed.forEach((show, index) => {
        description +=
        `${index + 1}. ${show.artist}\n${show.date} @ ${show.venue}\n
        `;
    });

    const embed = new EmbedBuilder()
        .setTitle('Unclaimed Press')
        .setDescription(description);

    unclaimed.forEach((show, index) => {
        const button =
            new ButtonBuilder()
            .setCustomId(
                `claim_${show.rowNumber}`
            )
            .setLabel(`${index + 1}`)
            .setStyle(ButtonStyle.Primary);

        buttons.push(button);
    });

    const row = new ActionRowBuilder().addComponents(buttons);

    await interaction.editReply({
        embeds : [embed],
        components: [row],
    });
  
  },

};