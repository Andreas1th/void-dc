import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const funRoastCommand = {
  data: new SlashCommandBuilder()
    .setName('roast')
    .setDescription('Get a friendly roast')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to roast (optional)')
        .setRequired(false)),

  cooldown: 10,

  async execute(interaction, bot) {
    const targetUser = interaction.options.getUser('user') || interaction.user;

    const roasts = [
      "You're like a software update. Whenever I see you, I think 'not now.'",
      "I'd explain it to you, but I don't have any crayons with me.",
      "You're not stupid; you just have bad luck thinking.",
      "I'm not saying you're dumb, but you'd struggle to pour water out of a boot with instructions on the heel.",
      "You're like a cloud. When you disappear, it's a beautiful day.",
      "I'd agree with you, but then we'd both be wrong.",
      "You're proof that even evolution makes mistakes sometimes.",
      "I'm not insulting you, I'm describing you.",
      "You're like a participation trophy - not really earned, but here you are.",
      "If ignorance is bliss, you must be the happiest person alive!"
    ];

    const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];

    const embed = new EmbedBuilder()
      .setColor('#e74c3c')
      .setTitle('🔥 Friendly Roast')
      .setDescription(`${targetUser}, ${randomRoast}`)
      .setFooter({ text: 'This is all in good fun! 😄' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
