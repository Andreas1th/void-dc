import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const translateCommand = {
  data: new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Translate text to any language')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to translate')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('language')
        .setDescription('Target language')
        .setRequired(true)
        .addChoices(
          { name: 'Spanish', value: 'Spanish' },
          { name: 'French', value: 'French' },
          { name: 'German', value: 'German' },
          { name: 'Italian', value: 'Italian' },
          { name: 'Portuguese', value: 'Portuguese' },
          { name: 'Russian', value: 'Russian' },
          { name: 'Japanese', value: 'Japanese' },
          { name: 'Korean', value: 'Korean' },
          { name: 'Chinese', value: 'Chinese' },
          { name: 'Arabic', value: 'Arabic' }
        )),

  cooldown: 5,

  async execute(interaction, bot) {
    if (!process.env.OPENAI_API_KEY) {
      return interaction.reply({ 
        content: '❌ AI features are not configured. Please set up OpenAI API key.', 
        ephemeral: true 
      });
    }

    await interaction.deferReply();

    const text = interaction.options.getString('text');
    const targetLanguage = interaction.options.getString('language');

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: `You are a professional translator. Translate the given text to ${targetLanguage}. Only provide the translation, no additional text.` 
          },
          { role: "user", content: text }
        ],
        max_tokens: 500,
        temperature: 0.3
      });

      const translation = completion.choices[0].message.content;

      const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setTitle('🌐 Translation')
        .addFields(
          { name: '📝 Original Text', value: text.substring(0, 1000) },
          { name: '🎯 Target Language', value: targetLanguage, inline: true },
          { name: '✅ Translation', value: translation.substring(0, 1000) }
        )
        .setFooter({ text: `Translated by ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Translation error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Translation Failed')
        .setDescription('Failed to translate text. Please try again later.');

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }
};
