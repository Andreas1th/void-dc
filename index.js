import { Client, GatewayIntentBits, Collection, REST, Routes, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from './database.js';
import { setupCommands } from './commands/index.js';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class RobloxBot {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences
      ]
    });

    this.commands = new Collection();
    this.cooldowns = new Collection();
    this.database = new Database();
    
    this.setupEventHandlers();
    this.loadCommands();
  }

  setupEventHandlers() {
    this.client.once('ready', () => {
      console.log(`🤖 ${this.client.user.tag} is online!`);
      console.log(`📊 Serving ${this.client.guilds.cache.size} servers`);
      
      this.client.user.setActivity('Roblox Scripts | /help', { type: 'WATCHING' });
      this.database.initialize();
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = this.commands.get(interaction.commandName);
      if (!command) return;

      // Check permissions
      if (!await this.checkPermissions(interaction, command)) {
        return interaction.reply({
          content: '❌ You don\'t have permission to use this command!',
          ephemeral: true
        });
      }

      // Check cooldowns
      if (!this.checkCooldown(interaction, command)) {
        return;
      }

      try {
        await command.execute(interaction, this);
      } catch (error) {
        console.error('Command execution error:', error);
        const errorEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Command Error')
          .setDescription('An error occurred while executing this command.')
          .setTimestamp();

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
        } else {
          await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
      }
    });

    this.client.on('guildMemberAdd', async (member) => {
      const welcomeChannel = member.guild.channels.cache.find(
        channel => channel.name === 'welcome' || channel.name === 'general'
      );

      if (welcomeChannel) {
        const welcomeEmbed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('🎉 Welcome to the Server!')
          .setDescription(`Welcome ${member.user}, enjoy your stay in our Roblox exploitation community!`)
          .setThumbnail(member.user.displayAvatarURL())
          .addFields(
            { name: '📋 Rules', value: 'Please read the rules channel', inline: true },
            { name: '🎮 Scripts', value: 'Check out our script collection', inline: true }
          )
          .setTimestamp();

        welcomeChannel.send({ embeds: [welcomeEmbed] });
      }
    });

    this.client.on('messageCreate', async (message) => {
      if (message.author.bot) return;

      // Auto-moderation
      await this.autoModerate(message);
    });
  }

  async loadCommands() {
    const commands = await setupCommands();
    
    for (const command of commands) {
      this.commands.set(command.data.name, command);
    }

    // Register slash commands
    await this.registerSlashCommands();
  }

  async registerSlashCommands() {
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);
    const commandData = Array.from(this.commands.values()).map(cmd => cmd.data.toJSON());

    try {
      console.log('🔄 Refreshing slash commands...');
      
      if (process.env.GUILD_ID) {
        // Guild-specific commands (faster for development)
        await rest.put(
          Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
          { body: commandData }
        );
      } else {
        // Global commands
        await rest.put(
          Routes.applicationCommands(process.env.CLIENT_ID),
          { body: commandData }
        );
      }

      console.log('✅ Slash commands registered successfully!');
    } catch (error) {
      console.error('❌ Error registering slash commands:', error);
    }
  }

  async checkPermissions(interaction, command) {
    const userId = interaction.user.id;
    const member = interaction.member;

    // Owner always has access
    if (userId === process.env.OWNER_ID) return true;

    // Check if command requires specific permissions
    if (!command.permissions) return true;

    // Check role-based permissions
    const userRoles = member.roles.cache;
    const hasRequiredRole = command.permissions.some(permission => {
      if (permission === 'OWNER') return userId === process.env.OWNER_ID;
      if (permission === 'ADMIN') return userRoles.some(role => 
        role.name.toLowerCase().includes('admin') || 
        role.permissions.has(PermissionFlagsBits.Administrator)
      );
      if (permission === 'DEVELOPER') return userRoles.some(role => 
        role.name.toLowerCase().includes('developer') || 
        role.name.toLowerCase().includes('dev')
      );
      if (permission === 'MODERATOR') return userRoles.some(role => 
        role.name.toLowerCase().includes('mod') || 
        role.permissions.has(PermissionFlagsBits.ModerateMembers)
      );
      if (permission === 'STAFF') return userRoles.some(role => 
        role.name.toLowerCase().includes('staff') ||
        role.name.toLowerCase().includes('helper')
      );
      return false;
    });

    return hasRequiredRole;
  }

  checkCooldown(interaction, command) {
    if (!command.cooldown) return true;

    const now = Date.now();
    const timestamps = this.cooldowns.get(command.data.name) || new Collection();
    const cooldownAmount = command.cooldown * 1000;

    if (timestamps.has(interaction.user.id)) {
      const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        interaction.reply({
          content: `⏰ Please wait ${timeLeft.toFixed(1)} more seconds before using this command again.`,
          ephemeral: true
        });
        return false;
      }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    this.cooldowns.set(command.data.name, timestamps);

    return true;
  }

  async autoModerate(message) {
    const content = message.content.toLowerCase();
    
    // Spam detection
    const spamWords = ['discord.gg/', 'free robux', 'hack account'];
    if (spamWords.some(word => content.includes(word))) {
      await message.delete();
      
      const warningEmbed = new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('⚠️ Auto-Moderation')
        .setDescription(`${message.author}, your message was removed for containing prohibited content.`)
        .setTimestamp();

      message.channel.send({ embeds: [warningEmbed] });
    }
  }

  async start() {
    try {
      await this.client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
      console.error('❌ Failed to start bot:', error);
      process.exit(1);
    }
  }
}

// Start the bot
const bot = new RobloxBot();
bot.start();

export default RobloxBot;
