import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const economyGambleCommand = {
  data: new SlashCommandBuilder()
    .setName('gamble')
    .setDescription('Gamble your coins')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount to gamble')
        .setRequired(true)
        .setMinValue(10))
    .addStringOption(option =>
      option.setName('game')
        .setDescription('Gambling game')
        .addChoices(
          { name: 'Coin Flip', value: 'coinflip' },
          { name: 'Dice Roll', value: 'dice' },
          { name: 'Slots', value: 'slots' }
        )),

  cooldown: 30,

  async execute(interaction, bot) {
    const amount = interaction.options.getInteger('amount');
    const game = interaction.options.getString('game') || 'coinflip';
    const userId = interaction.user.id;

    // Get user balance
    let user = await bot.database.getUser(userId);
    if (!user) {
      await bot.database.createUser(userId, interaction.user.username);
      user = { balance: 1000 };
    }

    const balance = user.balance || 1000;

    if (amount > balance) {
      return interaction.reply({ 
        content: '❌ You don\'t have enough coins to gamble that amount!', 
        ephemeral: true 
      });
    }

    let won = false;
    let winAmount = 0;
    let gameResult = '';

    switch (game) {
      case 'coinflip':
        const flip = Math.random() < 0.5 ? 'heads' : 'tails';
        const guess = Math.random() < 0.5 ? 'heads' : 'tails';
        won = flip === guess;
        winAmount = won ? amount * 2 : -amount;
        gameResult = `🪙 The coin landed on **${flip}**! You guessed **${guess}**.`;
        break;

      case 'dice':
        const roll = Math.floor(Math.random() * 6) + 1;
        won = roll >= 4; // Win on 4, 5, or 6
        winAmount = won ? Math.floor(amount * 1.5) : -amount;
        gameResult = `🎲 You rolled a **${roll}**! ${won ? 'You need 4+ to win!' : 'You need 4+ to win!'}`;
        break;

      case 'slots':
        const symbols = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎'];
        const slot1 = symbols[Math.floor(Math.random() * symbols.length)];
        const slot2 = symbols[Math.floor(Math.random() * symbols.length)];
        const slot3 = symbols[Math.floor(Math.random() * symbols.length)];
        
        if (slot1 === slot2 && slot2 === slot3) {
          won = true;
          winAmount = amount * 5; // Jackpot!
        } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
          won = true;
          winAmount = amount * 2; // Two matching
        } else {
          won = false;
          winAmount = -amount;
        }
        
        gameResult = `🎰 ${slot1} | ${slot2} | ${slot3}`;
        break;
    }

    // Update balance
    const newBalance = balance + winAmount;
    await bot.database.db.run(
      'UPDATE users SET balance = ? WHERE id = ?',
      newBalance,
      userId
    );

    const embed = new EmbedBuilder()
      .setColor(won ? '#00ff00' : '#ff0000')
      .setTitle(`🎲 ${game.charAt(0).toUpperCase() + game.slice(1)} Results`)
      .setDescription(gameResult)
      .addFields(
        { name: '💰 Bet Amount', value: `${amount} coins`, inline: true },
        { name: won ? '🎉 You Won!' : '💸 You Lost!', value: `${Math.abs(winAmount)} coins`, inline: true },
        { name: '💎 New Balance', value: `${newBalance} coins`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
  
