import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const aiChatCommand = {
  data: new SlashCommandBuilder()
    .setName('ai-chat')
    .setDescription('Chat with AI assistant')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Your message to the AI')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('personality')
        .setDescription('AI personality')
        .addChoices(
          { name: 'Helpful Assistant', value: 'helpful' },
          { name: 'Roblox Expert', value: 'roblox' },
          { name: 'Coding Helper', value: 'coding' },
          { name: 'Funny Friend', value: 'funny' }
        )),

  cooldown: 10,

  async execute(interaction, bot) {
    if (!process.env.OPENAI_API_KEY) {
      return interaction.reply({ 
        content: '❌ AI features are not configured. Please set up OpenAI API key.', 
        ephemeral: true 
      });
    }

    await interaction.deferReply();

    const message = interaction.options.getString('message');
    const personality = interaction.options.getString('personality') || 'helpful';

    const personalities = {
      helpful: "You are a helpful and friendly AI assistant. Be concise but informative.",
      roblox: "You are a Roblox expert who knows everything about Roblox development, scripting, and gameplay. Be enthusiastic about Roblox!",
      coding: "You are a programming expert who helps with coding questions. Provide clear explanations and code examples when helpful.",
      funny: "You are a funny and witty AI assistant. Make jokes and be entertaining while still being helpful."
    };

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: personalities[personality] },
          { role: "user", content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const response = completion.choices[0].message.content;

      const embed = new EmbedBuilder()
        .setColor('#9b59b6')
        .setTitle('🤖 AI Assistant')
        .addFields(
          { name: '💬 Your Message', value: message.substring(0, 1000) },
          { name: '🎭 Personality', value: personality.charAt(0).toUpperCase() + personality.slice(1), inline: true },
          { name: '🤖 AI Response', value: response.substring(0, 1000) }
        )
        .setFooter({ text: `Requested by ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('AI chat error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ AI Error')
        .setDescription('Failed to get AI response. Please try again later.');

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }
};
