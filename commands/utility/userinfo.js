import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const userInfoCommand = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Display information about a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to get info about')
        .setRequired(false)),

  async execute(interaction, bot) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`👤 ${user.username} Info`)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: '🏷️ Tag', value: user.tag, inline: true },
        { name: '🆔 ID', value: user.id, inline: true },
        { name: '📅 Account Created', value: user.createdAt.toDateString(), inline: true }
      );

    if (member) {
      embed.addFields(
        { name: '📅 Joined Server', value: member.joinedAt.toDateString(), inline: true },
        { name: '🎭 Roles', value: member.roles.cache.map(role => role.name).join(', ') || 'None', inline: false }
      );
    }

    await interaction.reply({ embeds: [embed] });
  }
};
