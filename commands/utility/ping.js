import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const pingCommand = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot\'s latency'),

  async execute(interaction, bot) {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('🏓 Pong!')
      .addFields(
        { 
          name: 'Bot Latency', 
          value: `${sent.createdTimestamp - interaction.createdTimestamp}ms`, 
          inline: true 
        },
        { 
          name: 'API Latency', 
          value: `${Math.round(bot.client.ws.ping)}ms`, 
          inline: true 
        }
      )
      .setTimestamp();

    await interaction.editReply({ content: null, embeds: [embed] });
  }
};
