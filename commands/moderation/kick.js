import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export const kickCommand = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to kick')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the kick')
        .setRequired(false)),

  permissions: ['DEVELOPER', 'MODERATOR', 'ADMIN', 'OWNER'],

  async execute(interaction, bot) {
    const targetUser = interaction.options.getUser('user');
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
        content: '❌ You cannot kick yourself!', 
        ephemeral: true 
      });
    }

    if (member.id === process.env.OWNER_ID) {
      return interaction.reply({ 
        content: '❌ Cannot kick the bot owner!', 
        ephemeral: true 
      });
    }

    if (!member.kickable) {
      return interaction.reply({ 
        content: '❌ I cannot kick this user! They may have higher permissions.', 
        ephemeral: true 
      });
    }

    try {
      // Send DM to user before kicking
      const dmEmbed = new EmbedBuilder()
        .setColor('#ff4757')
        .setTitle('🦶 You have been kicked')
        .setDescription(`You were kicked from **${interaction.guild.name}**`)
        .addFields(
          { name: '👮 Moderator', value: interaction.user.tag },
          { name: '📝 Reason', value: reason }
        )
        .setTimestamp();

      try {
        await member.send({ embeds: [dmEmbed] });
      } catch (error) {
        console.log('Could not send DM to kicked user');
      }

      await member.kick(reason);

      const successEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ User Kicked')
        .addFields(
          { name: '👤 User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: '👮 Moderator', value: interaction.user.tag, inline: true },
          { name: '📝 Reason', value: reason }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed] });

    } catch (error) {
      console.error('Kick error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Kick Failed')
        .setDescription('An error occurred while trying to kick the user.');

      await interaction.reply({ embeds: [errorEmbed] });
    }
  }
};
