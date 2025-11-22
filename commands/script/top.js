import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const topScriptsCommand = {
  data: new SlashCommandBuilder()
    .setName('top-scripts')
    .setDescription('View the most popular scripts')
    .addIntegerOption(option =>
      option.setName('limit')
        .setDescription('Number of scripts to show (1-20)')
        .setMinValue(1)
        .setMaxValue(20)),

  async execute(interaction, bot) {
    const limit = interaction.options.getInteger('limit') || 10;

    try {
      const topScripts = await bot.database.getTopScripts(limit);

      if (topScripts.length === 0) {
        const noScriptsEmbed = new EmbedBuilder()
          .setColor('#ff9900')
          .setTitle('📜 No Scripts Found')
          .setDescription('No scripts in the database yet. Be the first to add one with `/add-script`!');

        return interaction.reply({ embeds: [noScriptsEmbed] });
      }

      const embed = new EmbedBuilder()
        .setColor('#ffd700')
        .setTitle('🏆 Top Scripts')
        .setDescription(`Showing top ${topScripts.length} most downloaded scripts`)
        .setTimestamp();

      topScripts.forEach((script, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        
        embed.addFields({
          name: `${medal} ${script.name}`,
          value: `**Game:** ${script.game_name}\n**Downloads:** ${script.downloads}\n**Rating:** ${'⭐'.repeat(Math.floor(script.rating || 3))}`,
          inline: true
        });
      });

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Top scripts error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error')
        .setDescription('Failed to fetch top scripts.');

      await interaction.reply({ embeds: [errorEmbed] });
    }
  }
};
