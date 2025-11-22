import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const aiImageCommand = {
  data: new SlashCommandBuilder()
    .setName('ai-image')
    .setDescription('Generate an image with AI')
    .addStringOption(option =>
      option.setName('prompt')
        .setDescription('Description of the image to generate')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('style')
        .setDescription('Image style')
        .addChoices(
          { name: 'Realistic', value: 'realistic' },
          { name: 'Cartoon', value: 'cartoon' },
          { name: 'Anime', value: 'anime' },
          { name: 'Digital Art', value: 'digital' }
        )),

  cooldown: 30,
  permissions: ['STAFF', 'MODERATOR', 'ADMIN', 'OWNER'],

  async execute(interaction, bot) {
    if (!process.env.OPENAI_API_KEY) {
      return interaction.reply({ 
        content: '❌ AI features are not configured. Please set up OpenAI API key.', 
        ephemeral: true 
      });
    }

    await interaction.deferReply();

    const prompt = interaction.options.getString('prompt');
    const style = interaction.options.getString('style') || 'realistic';

    const stylePrompts = {
      realistic: "photorealistic, high quality, detailed",
      cartoon: "cartoon style, colorful, fun",
      anime: "anime style, manga, japanese animation",
      digital: "digital art, concept art, artistic"
    };

    const fullPrompt = `${prompt}, ${stylePrompts[style]}`;

    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: fullPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard"
      });

      const imageUrl = response.data[0].url;

      const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('🎨 AI Generated Image')
        .setDescription(`**Prompt:** ${prompt}`)
        .addFields(
          { name: '🎭 Style', value: style.charAt(0).toUpperCase() + style.slice(1), inline: true },
          { name: '👤 Requested by', value: interaction.user.tag, inline: true }
        )
        .setImage(imageUrl)
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('AI image error:', error);
      
      let errorMessage = 'Failed to generate image. Please try again later.';
      
      if (error.message.includes('content_policy_violation')) {
        errorMessage = 'Your prompt violates content policy. Please try a different prompt.';
      }

      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Image Generation Failed')
        .setDescription(errorMessage);

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }
};
