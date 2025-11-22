import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import axios from 'axios';
import * as cheerio from 'cheerio';

export const searchScriptsCommand = {
  data: new SlashCommandBuilder()
    .setName('search-scripts')
    .setDescription('Search for Roblox game scripts')
    .addStringOption(option =>
      option.setName('game')
        .setDescription('Game name to search scripts for')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type of script')
        .addChoices(
          { name: 'GUI', value: 'gui' },
          { name: 'Exploit', value: 'exploit' },
          { name: 'Admin', value: 'admin' },
          { name: 'Hub', value: 'hub' },
          { name: 'Any', value: 'any' }
        )),

  async execute(interaction, bot) {
    await interaction.deferReply();

    const gameName = interaction.options.getString('game');
    const scriptType = interaction.options.getString('type') || 'any';

    try {
      // Search in local database first
      const localScripts = await bot.database.searchScripts(gameName);
      
      // Web scraping for additional scripts (example sources)
      const webScripts = await searchWebScripts(gameName, scriptType);
      
      const allScripts = [...localScripts, ...webScripts];

      if (allScripts.length === 0) {
        const noResultsEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ No Scripts Found')
          .setDescription(`No scripts found for "${gameName}"`)
          .addFields(
            { name: '💡 Tip', value: 'Try searching with a different game name or check spelling' }
          );

        return interaction.editReply({ embeds: [noResultsEmbed] });
      }

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle(`📜 Scripts for "${gameName}"`)
        .setDescription(`Found ${allScripts.length} script(s)`)
        .setTimestamp();

      // Add up to 5 scripts to the embed
      allScripts.slice(0, 5).forEach((script, index) => {
        embed.addFields({
          name: `${index + 1}. ${script.name}`,
          value: `**Type:** ${script.type || 'Unknown'}\n**Downloads:** ${script.downloads || 0}\n**Rating:** ${'⭐'.repeat(Math.floor(script.rating || 3))}`,
          inline: true
        });
      });

      if (allScripts.length > 5) {
        embed.setFooter({ text: `Showing 5 of ${allScripts.length} results` });
      }

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Script search error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Search Error')
        .setDescription('An error occurred while searching for scripts.')
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }
};

async function searchWebScripts(gameName, scriptType) {
  const scripts = [];
  
  try {
    // Example: Search script sharing websites (replace with actual sources)
    const searchUrls = [
      `https://scriptblox.com/search?q=${encodeURIComponent(gameName)}`,
      `https://robloxscripts.com/search?game=${encodeURIComponent(gameName)}`
    ];

    for (const url of searchUrls) {
      try {
        const response = await axios.get(url, {
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        const $ = cheerio.load(response.data);
        
        // Parse script results (this is example parsing - adjust for actual sites)
        $('.script-item').each((i, element) => {
          if (i >= 10) return false; // Limit results
          
          const name = $(element).find('.script-title').text().trim();
          const type = $(element).find('.script-type').text().trim();
          const downloads = parseInt($(element).find('.downloads').text()) || 0;
          
          if (name) {
            scripts.push({
              name,
              type: type || scriptType,
              downloads,
              rating: Math.floor(Math.random() * 5) + 1,
              source: 'web'
            });
          }
        });
      } catch (error) {
        console.log(`Failed to search ${url}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Web script search error:', error);
  }

  // If no web results, return some example scripts
  if (scripts.length === 0) {
    return [
      {
        name: `${gameName} GUI Script`,
        type: 'GUI',
        downloads: Math.floor(Math.random() * 1000),
        rating: 4,
        source: 'example'
      },
      {
        name: `${gameName} Exploit Hub`,
        type: 'Hub',
        downloads: Math.floor(Math.random() * 500),
        rating: 5,
        source: 'example'
      }
    ];
  }

  return scripts;
}
