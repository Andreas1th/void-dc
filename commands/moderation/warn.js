import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const warnCommand = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to warn')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the warning')
        .setRequired(true)),

  permissions: ['DEVELOPER', 'STAFF', 'MODERATOR', 'ADMIN', 'OWNER'],

  async execute(interaction, bot) {
    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    const member = interaction.guild.members.cache.get(targetUser.id);

    if (!member) {
      return interaction.reply({ 
        content: '❌ User not found in this server!', 
        ephemeral: true 
      });
    }

    if (member.id === interaction.user.id) {
      return interaction.reply({ 
        content: '❌ You cannot warn yourself!', 
        ephemeral: true 
      });
    }

    try {
      // Add warning to database
      await bot.database.addWarning(targetUser.id, interaction.user.id, reason);
      
      // Get user's total warnings
      const warnings = await bot.database.getWarnings(targetUser.id);
      const warningCount = warnings.length;

      // Send DM to warned user
      const dmEmbed = new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('⚠️ You have been warned')
        .setDescription(`You received a warning in **${interaction.guild.name}**`)
        .addFields(
          { name: '👮 Moderator', value: interaction.user.tag },
          { name: '📝 Reason', value: reason },
          { name: '📊 Total Warnings', value: warningCount.toString() }
        )
        .setTimestamp();

      try {
        await member.send({ embeds: [dmEmbed] });
      } catch (error) {
        console.log('Could not send DM to warned user');
      }

      const successEmbed = new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('⚠️ User Warned')
        .addFields(
          { name: '👤 User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: '👮 Moderator', value: interaction.user.tag, inline: true },
          { name: '📝 Reason', value: reason },
          { name: '📊 Total Warnings', value: warningCount.toString(), inline: true }
        )
        .setTimestamp();

      // Auto-actions based on warning count
      if (warningCount >= 5) {
        successEmbed.addFields({ 
          name: '🚨 Auto-Action', 
          value: 'User has 5+ warnings! Consider taking further action.' 
        });
      }

      await interaction.reply({ embeds: [successEmbed] });

    } catch (error) {
      console.error('Warn error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Warning Failed')
        .setDescription('An error occurred while warning the user.');

      await interaction.reply({ embeds: [errorEmbed] });
    }
  }
};
