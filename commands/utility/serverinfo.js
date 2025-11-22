import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const serverInfoCommand = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Display information about the server'),

  async execute(interaction, bot) {
    const guild = interaction.guild;
    
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`📊 ${guild.name} Server Info`)
      .setThumbnail(guild.iconURL())
      .addFields(
        { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: '👥 Members', value: guild.memberCount.toString(), inline: true },
        { name: '📅 Created', value: guild.createdAt.toDateString(), inline: true },
        { name: '🌍 Region', value: guild.preferredLocale || 'Unknown', inline: true },
        { name: '🔒 Verification Level', value: guild.verificationLevel.toString(), inline: true },
        { name: '📢 Channels', value: guild.channels.cache.size.toString(), inline: true }
      )
      .setFooter({ text: `Server ID: ${guild.id}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
