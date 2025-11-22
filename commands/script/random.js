import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

export const randomScriptCommand = {
  data: new SlashCommandBuilder()
    .setName('random-script')
    .setDescription('Get a random script from the database'),

  cooldown: 5,

  async execute(interaction, bot) {
    try {
      // Get all scripts and pick a random one
      const allScripts = await bot.database.getTopScripts(1000); // Get many scripts
      
      if (allScripts.length === 0) {
        const noScriptsEmbed = new EmbedBuilder()
          .setColor('#ff9900')
          .setTitle('📜 No Scripts Found')
          .setDescription('No scripts in the database yet. Add some with `/add-script`!');

        return interaction.reply({ embeds: [noScriptsEmbed] });
      }

      const randomScript = allScripts[Math.floor(Math.random() * allScripts.length)];

      const embed = new EmbedBuilder()
        .setColor('#9b59b6')
        .setTitle('🎲 Random Script')
        .addFields(
          { name: '📜 Name', value: randomScript.name, inline: true },
          { name: '🎮 Game', value: randomScript.game_name, inline: true },
          { name: '📊 Downloads', value: randomScript.downloads.toString(), inline: true },
          { name: '⭐ Rating', value: '⭐'.repeat(Math.floor(randomScript.rating || 3)), inline: true }
        )
        .setTimestamp();

      const downloadButton = new ButtonBuilder()
        .setCustomId(`download-script-${randomScript.id}`)
        .setLabel('📥 Download')
        .setStyle(ButtonStyle.Primary);

      const actionRow = new ActionRowBuilder().addComponents(downloadButton);

      await interaction.reply({ embeds: [embed], components: [actionRow] });

      // Handle button interaction
      const filter = (buttonInteraction) => 
        buttonInteraction.customId === `download-script-${randomScript.id}` && 
        buttonInteraction.user.id === interaction.user.id;

      const collector = interaction.channel.createMessageComponentCollector({ 
        filter, 
        time: 60000 
      });

      collector.on('collect', async (buttonInteraction) => {
        // Increment download count
        await bot.database.db.run(
          'UPDATE scripts SET downloads = downloads + 1 WHERE id = ?',
          randomScript.id
        );

        // Send script content in DM
        try {
          const scriptEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle(`📜 ${randomScript.name}`)
            .setDescription('```lua\n' + (randomScript.script_content || 'Script content not available') + '\n```')
            .addFields(
              { name: '🎮 Game', value: randomScript.game_name },
              { name: '⚠️ Disclaimer', value: 'Use scripts at your own risk. We are not responsible for any bans or issues.' }
            );

          await buttonInteraction.user.send({ embeds: [scriptEmbed] });
          
          await buttonInteraction.reply({ 
            content: '✅ Script sent to your DMs!', 
            ephemeral: true 
          });
        } catch (error) {
          await buttonInteraction.reply({ 
            content: '❌ Could not send DM. Please enable DMs from server members.', 
            ephemeral: true 
          });
        }
      });

    } catch (error) {
      console.error('Random script error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error')
        .setDescription('Failed to get random script.');

      await interaction.reply({ embeds: [errorEmbed] });
    }
  }
};
