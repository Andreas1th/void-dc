import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const helpCommand = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows all available commands')
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Command category to view')
        .addChoices(
          { name: 'Utility', value: 'utility' },
          { name: 'Scripts', value: 'scripts' },
          { name: 'Moderation', value: 'moderation' },
          { name: 'AI', value: 'ai' },
          { name: 'Economy', value: 'economy' },
          { name: 'Fun', value: 'fun' }
        )),

  async execute(interaction, bot) {
    const category = interaction.options.getString('category');

    if (!category) {
      const mainEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🤖 Roblox Bot Commands')
        .setDescription('Use `/help <category>` to see commands in a specific category')
        .addFields(
          { name: '🔧 Utility', value: 'Basic bot utilities', inline: true },
          { name: '📜 Scripts', value: 'Roblox script management', inline: true },
          { name: '🛡️ Moderation', value: 'Server moderation tools', inline: true },
          { name: '🤖 AI', value: 'AI-powered features', inline: true },
          { name: '💰 Economy', value: 'Virtual economy system', inline: true },
          { name: '🎉 Fun', value: 'Entertainment commands', inline: true }
        )
        .setFooter({ text: 'Made for Roblox Exploitation Community' })
        .setTimestamp();

      return interaction.reply({ embeds: [mainEmbed] });
    }

    const categoryEmbeds = {
      utility: new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🔧 Utility Commands')
        .addFields(
          { name: '/ping', value: 'Check bot latency' },
          { name: '/serverinfo', value: 'Display server information' },
          { name: '/userinfo', value: 'Display user information' }
        ),

      scripts: new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle('📜 Script Commands')
        .addFields(
          { name: '/search-scripts', value: 'Search for Roblox game scripts' },
          { name: '/add-script', value: 'Add a new script to the database' },
          { name: '/top-scripts', value: 'View most popular scripts' },
          { name: '/random-script', value: 'Get a random script' }
        ),

      moderation: new EmbedBuilder()
        .setColor('#ff4757')
        .setTitle('🛡️ Moderation Commands')
        .addFields(
          { name: '/kick', value: 'Kick a member from the server' },
          { name: '/ban', value: 'Ban a member from the server' },
          { name: '/warn', value: 'Warn a member' },
          { name: '/mute', value: 'Mute a member' },
          { name: '/clear', value: 'Delete messages in bulk' },
          { name: '/lockdown', value: 'Lock/unlock a channel' }
        ),

      ai: new EmbedBuilder()
        .setColor('#a55eea')
        .setTitle('🤖 AI Commands')
        .addFields(
          { name: '/ai-chat', value: 'Chat with AI assistant' },
          { name: '/ai-image', value: 'Generate images with AI' },
          { name: '/translate', value: 'Translate text to any language' }
        ),

      economy: new EmbedBuilder()
        .setColor('#26de81')
        .setTitle('💰 Economy Commands')
        .addFields(
          { name: '/balance', value: 'Check your balance' },
          { name: '/daily', value: 'Claim daily rewards' },
          { name: '/gamble', value: 'Gamble your coins' }
        ),

      fun: new EmbedBuilder()
        .setColor('#feca57')
        .setTitle('🎉 Fun Commands')
        .addFields(
          { name: '/meme', value: 'Get a random meme' },
          { name: '/8ball', value: 'Ask the magic 8-ball' },
          { name: '/roast', value: 'Roast someone (friendly)' }
        )
    };

    const embed = categoryEmbeds[category];
    if (embed) {
      embed.setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.reply({ content: '❌ Invalid category!', ephemeral: true });
    }
  }
};
           
