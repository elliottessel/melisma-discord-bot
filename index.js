require('dotenv').config();

const fs = require('fs');
const path = require('path');

const {
  Client,
  Collection,
  GatewayIntentBits,
  Events,
} = require('discord.js');

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