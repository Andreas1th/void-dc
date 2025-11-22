import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const economyDailyCommand = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily reward'),

  cooldown: 86400, // 24 hours

  async execute(interaction, bot) {
    const userId = interaction.user.id;
    
    // Get or create user
    let user = await bot.database.getUser(userId);
    if (!user) {
      await bot.database.createUser(userId, interaction.user.username);
      user = await bot.database.getUser(userId);
    }

    const dailyAmount = Math.floor(Math.random() * 500) + 100; // 100-600 coins
    const bonusAmount = Math.floor(Math.random() * 100); // 0-100 bonus

    // Update user balance
    await bot.database.db.run(
      'UPDATE users SET balance = COALESCE(balance, 1000) + ? WHERE id = ?',
      dailyAmount + bonusAmount,
      userId
    );

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('🎁 Daily Reward Claimed!')
      .setDescription(`You received your daily reward!`)
      .addFields(
        { name: '💎 Base Reward', value: `${dailyAmount} coins`, inline: true },
        { name: '🎲 Bonus', value: `${bonusAmount} coins`, inline: true },
        { name: '💰 Total', value: `${dailyAmount + bonusAmount} coins`, inline: true }
      )
      .setFooter({ text: 'Come back tomorrow for another reward!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
