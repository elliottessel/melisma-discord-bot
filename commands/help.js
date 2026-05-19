const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const fs = require('fs');
const path = require('path');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Lists avaiable commands'),

  async execute(interaction) {

    const commands = [];
    const commandFiles = fs.readdirSync(__dirname).filter(f => f.endsWith('.js') && f !== 'help.js');

    let embedDescription = '';

    for (const file of commandFiles) {
        const command = require(path.join(__dirname, file));
        commands.push({
            name: command.data.name,
            description: command.data.description,
        });
        embedDescription += `**/${command.data.name}**: ${command.data.description}\n\n`;
    }

    const embed = new EmbedBuilder()
        .setTitle('Available Commands')
        .setDescription(embedDescription);

    await interaction.reply({
        embeds: [embed],
        ephemeral: true,
    });

  }

}