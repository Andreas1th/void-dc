import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const economyBalanceCommand = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your or someone else\'s balance')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check balance for')
        .setRequired(false)),

  async execute(interaction, bot) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    
    // Get or create user in database
    let user = await bot.database.getUser(targetUser.id);
    if (!user) {
      await bot.database.createUser(targetUser.id, targetUser.username);
      user = await bot.database.getUser(targetUser.id);
    }

    const balance = user.balance || 1000; // Default starting balance
    const reputation = user.reputation || 0;

    const embed = new EmbedBuilder()
      .setColor('#f39c12')
      .setTitle('💰 Balance')
      .setThumbnail(targetUser.displayAvatarURL())
      .addFields(
        { name: '👤 User', value: targetUser.tag, inline: true },
        { name: '💎 Coins', value: balance.toLocaleString(), inline: true },
        { name: '⭐ Reputation', value: reputation.toString(), inline: true }
      )
      .setTimestamp();

    if (targetUser.id === interaction.user.id) {
      embed.setDescription('Here\'s your current balance!');
    } else {
      embed.setDescription(`Here's ${targetUser.username}'s balance!`);
    }

    await interaction.reply({ embeds: [embed] });
  }
};
