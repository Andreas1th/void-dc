import { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export const addScriptCommand = {
  data: new SlashCommandBuilder()
    .setName('add-script')
    .setDescription('Add a new script to the database')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Name of the script')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('game')
        .setDescription('Game the script is for')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Brief description of the script')
        .setRequired(false)),

  permissions: ['DEVELOPER', 'STAFF', 'MODERATOR', 'ADMIN', 'OWNER'],

  async execute(interaction, bot) {
    const name = interaction.options.getString('name');
    const game = interaction.options.getString('game');
    const description = interaction.options.getString('description') || 'No description provided';

    // Create modal for script content
    const modal = new ModalBuilder()
      .setCustomId('add-script-modal')
      .setTitle('Add Script Content');

    const scriptInput = new TextInputBuilder()
      .setCustomId('script-content')
      .setLabel('Script Code')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Paste your script code here...')
      .setRequired(true)
      .setMaxLength(4000);

    const actionRow = new ActionRowBuilder().addComponents(scriptInput);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);

    // Handle modal submission
    const filter = (modalInteraction) => modalInteraction.customId === 'add-script-modal';
    
    try {
      const modalSubmission = await interaction.awaitModalSubmit({ filter, time: 300000 });
      const scriptContent = modalSubmission.fields.getTextInputValue('script-content');

      // Add script to database
      await bot.database.addScript(name, game, scriptContent, interaction.user.id);

      const successEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Script Added Successfully')
        .addFields(
          { name: '📜 Name', value: name, inline: true },
          { name: '🎮 Game', value: game, inline: true },
          { name: '👤 Author', value: interaction.user.username, inline: true },
          { name: '📝 Description', value: description }
        )
        .setTimestamp();

      await modalSubmission.reply({ embeds: [successEmbed] });

    } catch (error) {
      console.error('Add script error:', error);
      
      if (error.code === 'InteractionCollectorError') {
        await interaction.followUp({ 
          content: '❌ Modal timed out. Please try again.', 
          ephemeral: true 
        });
      }
    }
  }
};
      
