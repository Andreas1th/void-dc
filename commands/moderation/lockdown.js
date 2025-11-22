import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export const lockdownCommand = {
  data: new SlashCommandBuilder()
    .setName('lockdown')
    .setDescription('Lock or unlock a channel')
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Lock or unlock the channel')
        .setRequired(true)
        .addChoices(
          { name: 'Lock', value: 'lock' },
          { name: 'Unlock', value: 'unlock' }
        ))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to lock/unlock (current channel if not specified)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the lockdown')
        .setRequired(false)),

  permissions: ['ADMIN', 'OWNER'],

  async execute(interaction, bot) {
    const action = interaction.options.getString('action');
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      const everyone = interaction.guild.roles.everyone;

      if (action === 'lock') {
        await channel.permissionOverwrites.edit(everyone, {
          SendMessages: false,
          AddReactions: false,
          CreatePublicThreads: false,
          CreatePrivateThreads: false
        });

        const lockEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('🔒 Channel Locked')
          .setDescription(`${channel} has been locked by ${interaction.user}`)
          .addFields(
            { name: '📝 Reason', value: reason }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [lockEmbed] });

      } else {
        await channel.permissionOverwrites.edit(everyone, {
          SendMessages: null,
          AddReactions: null,
          CreatePublicThreads: null,
          CreatePrivateThreads: null
        });

        const unlockEmbed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('🔓 Channel Unlocked')
          .setDescription(`${channel} has been unlocked by ${interaction.user}`)
          .addFields(
            { name: '📝 Reason', value: reason }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [unlockEmbed] });
      }

    } catch (error) {
      console.error('Lockdown error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Lockdown Failed')
        .setDescription('An error occurred while trying to lock/unlock the channel.');

      await interaction.reply({ embeds: [errorEmbed] });
    }
  }
};
