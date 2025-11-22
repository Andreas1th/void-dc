import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const muteCommand = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute a member')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to mute')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('Duration in minutes')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(40320)) // 28 days max
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the mute')
        .setRequired(false)),

  permissions: ['MODERATOR', 'ADMIN', 'OWNER'],

  async execute(interaction, bot) {
    const targetUser = interaction.options.getUser('user');
    const duration = interaction.options.getInteger('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = interaction.guild.members.cache.get(targetUser.id);

    if (!member) {
      return interaction.reply({ 
        content: '❌ User not found in this server!', 
        ephemeral: true 
      });
    }

    if (member.id === interaction.user.id) {
      return interaction.reply({ 
        content: '❌ You cannot mute yourself!', 
        ephemeral: true 
      });
    }

    if (member.id === process.env.OWNER_ID) {
      return interaction.reply({ 
        content: '❌ Cannot mute the bot owner!', 
        ephemeral: true 
      });
    }

    if (!member.moderatable) {
      return interaction.reply({ 
        content: '❌ I cannot mute this user! They may have higher permissions.', 
        ephemeral: true 
      });
    }

    try {
      const muteEndTime = new Date(Date.now() + duration * 60 * 1000);
      
      await member.timeout(duration * 60 * 1000, reason);

      // Send DM to muted user
      const dmEmbed = new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('🔇 You have been muted')
        .setDescription(`You were muted in **${interaction.guild.name}**`)
        .addFields(
          { name: '👮 Moderator', value: interaction.user.tag },
          { name: '📝 Reason', value: reason },
          { name: '⏰ Duration', value: `${duration} minute(s)` },
          { name: '🕐 Ends At', value: muteEndTime.toLocaleString() }
        )
        .setTimestamp();

      try {
        await member.send({ embeds: [dmEmbed] });
      } catch (error) {
        console.log('Could not send DM to muted user');
      }

      const successEmbed = new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('🔇 User Muted')
        .addFields(
          { name: '👤 User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: '👮 Moderator', value: interaction.user.tag, inline: true },
          { name: '📝 Reason', value: reason },
          { name: '⏰ Duration', value: `${duration} minute(s)`, inline: true },
          { name: '🕐 Ends At', value: muteEndTime.toLocaleString(), inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed] });

    } catch (error) {
      console.error('Mute error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Mute Failed')
        .setDescription('An error occurred while trying to mute the user.');

      await interaction.reply({ embeds: [errorEmbed] });
    }
  }
};
