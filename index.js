require('dotenv').config();

const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const {
  Client,
  Collection,
  GatewayIntentBits,
  Events,
  EmbedBuilder,
} = require('discord.js');

const { getShows } = require('./sheets');

const client = new Client({
  intents: [GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent],
});

client.commands = new Collection();

const commandsPath =
  path.join(__dirname, 'commands');

const commandFiles =
  fs.readdirSync(commandsPath)
    .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {

  const command =
    require(`./commands/${file}`);

  client.commands.set(
    command.data.name,
    command
  );
}

client.once(Events.ClientReady, readyClient => {

  console.log(
    `Logged in as ${readyClient.user.tag}`
  );

  cron.schedule('* 9 * * 3,6', async () => {
    try {
      const shows = await getShows();

      const date = new Date();
      const twoWeeksAgo = new Date(date.getTime() - 14 * 24 * 60 * 60 * 1000);

      const missing = shows.filter(show => {
          const currentYear = new Date().getFullYear();
          const showDate = new Date(`${show.date}, ${currentYear}`);

          const attended = show.attended === 'TRUE';
          const reviewMissing = show.reviewWritten !== 'TRUE';
          const isOverdue = showDate < twoWeeksAgo;

          return attended && reviewMissing && isOverdue;
      });

      if (missing.length === 0) return;

      const channel = await readyClient.channels.fetch(process.env.CHANNEL_ID);

      let description = '';
      missing.forEach(show => {
          const msPerDay = 24 * 60 * 60 * 1000;
          const showDate = new Date(`${show.date}, ${currentYear}`);
          const daysSinceShow = (date - showDate) / msPerDay; // date = new Date(), "today"
          const daysOverdue = Math.ceil(daysSinceShow - 14);
          description += `• **${show.artist}** - :rotating_light: Overdue :rotating_light:\nReporter: ${show.reporter || 'Unassigned'}\nDate Covered: ${show.date}\n**${daysOverdue} day(s) Overdue.**\n\n`;
      });

      const embed = new EmbedBuilder()
          .setTitle('Overdue Reviews')
          .setDescription(description);

      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Overdue check failed:', error);
    }
}, {
    timezone: 'America/New_York'
})
});


client.on(
  Events.InteractionCreate,
  async interaction => {

    if (!interaction.isChatInputCommand())
      return;

    const command =
      client.commands.get(
        interaction.commandName
      );

    if (!command) return;

    try {

      await command.execute(interaction);

    } catch (error) {

      console.error(error);

      if (
        interaction.replied ||
        interaction.deferred
      ) {

        await interaction.followUp({
          content:
            'There was an error executing this command.',
          ephemeral: true,
        });

      } else {

        await interaction.deferReply({
          content:
            'There was an error executing this command.',
          ephemeral: true,
        });
      }
    }
  }
);

client.login(process.env.DISCORD_TOKEN);