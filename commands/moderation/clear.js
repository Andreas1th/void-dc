import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const clearCommand = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete messages in bulk')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100))
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Only delete messages from this user')
        .setRequired(false)),

  permissions: ['MODERATOR', 'ADMIN', 'OWNER'],

  async execute(interaction, bot) {
    const amount = interaction.options.getInteger('amount');
    const targetUser = interaction.options.getUser('user');

    try {
      const messages = await interaction.channel.messages.fetch({ limit: amount });
      
      let messagesToDelete = messages;
      
      if (targetUser) {
        messagesToDelete = messages.filter(msg => msg.author.id === targetUser.id);
      }

      const deletedMessages = await interaction.channel.bulkDelete(messagesToDelete, true);

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('🗑️ Messages Cleared')
        .addFields(
          { name: '📊 Deleted', value: deletedMessages.size.toString(), inline: true },
          { name: '👮 Moderator', value: interaction.user.tag, inline: true }
        );

      if (targetUser) {
        embed.addFields({ name: '👤 Target User', value: targetUser.tag, inline: true });
      }

      embed.setTimestamp();

      const reply = await interaction.reply({ embeds: [embed] });
      
      // Delete the confirmation message after 5 seconds
      setTimeout(() => {
        reply.delete().catch(() => {});
      }, 5000);

    } catch (error) {
      console.error('Clear error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Clear Failed')
        .setDescription('An error occurred while trying to delete messages. Messages older than 14 days cannot be bulk deleted.');

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
};
