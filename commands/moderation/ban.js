import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const banCommand = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to ban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the ban')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('delete-days')
        .setDescription('Days of messages to delete (0-7)')
        .setMinValue(0)
        .setMaxValue(7)),

  permissions: ['DEVELOPER', 'ADMIN', 'OWNER'],

  async execute(interaction, bot) {
    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const deleteDays = interaction.options.getInteger('delete-days') || 0;
    const member = interaction.guild.members.cache.get(targetUser.id);

    if (member) {
      if (member.id === interaction.user.id) {
        return interaction.reply({ 
          content: '❌ You cannot ban yourself!', 
          ephemeral: true 
        });
      }

      if (member.id === process.env.OWNER_ID) {
        return interaction.reply({ 
          content: '❌ Cannot ban the bot owner!', 
          ephemeral: true 
        });
      }

      if (!member.bannable) {
        return interaction.reply({ 
          content: '❌ I cannot ban this user! They may have higher permissions.', 
          ephemeral: true 
        });
      }
    }

    try {
      // Send DM to user before banning
      if (member) {
        const dmEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('🔨 You have been banned')
          .setDescription(`You were banned from **${interaction.guild.name}**`)
          .addFields(
            { name: '👮 Moderator', value: interaction.user.tag },
            { name: '📝 Reason', value: reason }
          )
          .setTimestamp();

        try {
          await member.send({ embeds: [dmEmbed] });
        } catch (error) {
          console.log('Could not send DM to banned user');
        }
      }

      await interaction.guild.members.ban(targetUser.id, { 
        reason: `${reason} | Banned by ${interaction.user.tag}`,
        deleteMessageDays: deleteDays
      });

      const successEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🔨 User Banned')
        .addFields(
          { name: '👤 User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: '👮 Moderator', value: interaction.user.tag, inline: true },
          { name: '📝 Reason', value: reason },
          { name: '🗑️ Messages Deleted', value: `${deleteDays} day(s)`, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed] });

    } catch (error) {
      console.error('Ban error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Ban Failed')
        .setDescription('An error occurred while trying to ban the user.');

      await interaction.reply({ embeds: [errorEmbed] });
    }
  }
};
      
