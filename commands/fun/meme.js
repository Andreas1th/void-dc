import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import axios from 'axios';

export const funMemeCommand = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Get a random meme')
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Meme category')
        .addChoices(
          { name: 'Programming', value: 'ProgrammerHumor' },
          { name: 'Gaming', value: 'gaming' },
          { name: 'Wholesome', value: 'wholesomememes' },
          { name: 'Random', value: 'memes' }
        )),

  cooldown: 5,

  async execute(interaction, bot) {
    await interaction.deferReply();

    const category = interaction.options.getString('category') || 'memes';

    try {
      const response = await axios.get(`https://www.reddit.com/r/${category}/random.json`, {
        headers: {
          'User-Agent': 'Discord Bot'
        }
      });

      const memeData = response.data[0].data.children[0].data;
      
      if (!memeData.url.match(/\.(jpeg|jpg|gif|png)$/)) {
        throw new Error('Not an image');
      }

      const embed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle(memeData.title.length > 256 ? memeData.title.substring(0, 253) + '...' : memeData.title)
        .setImage(memeData.url)
        .addFields(
          { name: '👍 Upvotes', value: memeData.ups.toString(), inline: true },
          { name: '💬 Comments', value: memeData.num_comments.toString(), inline: true },
          { name: '📱 Subreddit', value: `r/${memeData.subreddit}`, inline: true }
        )
        .setFooter({ text: `Requested by ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Meme error:', error);
      
      // Fallback memes
      const fallbackMemes = [
        'https://i.imgur.com/dQw4w9W.gif',
        'https://i.imgur.com/j5n8Ztx.jpg',
        'https://i.imgur.com/9nVMRqa.jpg'
      ];

      const randomMeme = fallbackMemes[Math.floor(Math.random() * fallbackMemes.length)];

      const embed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle('🎭 Random Meme')
        .setDescription('Here\'s a meme for you!')
        .setImage(randomMeme)
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    }
  }
};
    
