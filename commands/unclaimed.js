const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

const { updateReporter, getShows } = require('../sheets');

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
    const rows = [];

    let description = '';

    unclaimed.forEach((show, index) => {
        description +=
        `${index + 1}. ${show.artist}\n${show.date} @ ${show.venue}\n
        `;
    });

    const embed = new EmbedBuilder()
        .setTitle('Unclaimed Press (Click number to claim)')
        .setDescription(description);

    unclaimed.forEach((show, index) => {
        const button =
            new ButtonBuilder()
            .setCustomId(
                `claim_${show.rowNumber}_${show.artist}`
            )
            .setLabel(`${index + 1}`)
            .setStyle(ButtonStyle.Secondary);

        buttons.push(button);
    });

    for (let i = 0; i < buttons.length; i += 5) {

        const row =
            new ActionRowBuilder()
            .addComponents(
                buttons.slice(i, i + 5)
            );

        rows.push(row);
    }

    await interaction.editReply({
        embeds : [embed],
        components: rows,
    });

    const message = await interaction.fetchReply();

    const collector = message.createMessageComponentCollector();

    collector.on('collect', async i => {    
        if(!i.isButton()) return;

        const parts = i.customId.split('_');
        const rowNumber = parts[1];
        const artist = parts.slice(2).join('_'); // handles artists with underscores in name



        // update sheets with reporter 
        updateReporter(rowNumber, i.member.nickname);
 

        await i.reply({
            content: `${i.member.nickname} has claimed ${artist}.`,
            ephemeral: false,
        });

    });

  },

};