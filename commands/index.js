import { SlashCommandBuilder } from 'discord.js';

// Import all command modules
import { helpCommand } from './utility/help.js';
import { pingCommand } from './utility/ping.js';
import { serverInfoCommand } from './utility/serverinfo.js';
import { userInfoCommand } from './utility/userinfo.js';

import { searchScriptsCommand } from './scripts/search.js';
import { addScriptCommand } from './scripts/add.js';
import { topScriptsCommand } from './scripts/top.js';
import { randomScriptCommand } from './scripts/random.js';

import { kickCommand } from './moderation/kick.js';
import { banCommand } from './moderation/ban.js';
import { warnCommand } from './moderation/warn.js';
import { muteCommand } from './moderation/mute.js';
import { clearCommand } from './moderation/clear.js';
import { lockdownCommand } from './moderation/lockdown.js';

import { aiChatCommand } from './ai/chat.js';
import { aiImageCommand } from './ai/image.js';
import { translateCommand } from './ai/translate.js';

import { economyBalanceCommand } from './economy/balance.js';
import { economyDailyCommand } from './economy/daily.js';
import { economyGambleCommand } from './economy/gamble.js';

import { funMemeCommand } from './fun/meme.js';
import { fun8ballCommand } from './fun/8ball.js';
import { funRoastCommand } from './fun/roast.js';

export async function setupCommands() {
  const commands = [
    // Utility Commands
    helpCommand,
    pingCommand,
    serverInfoCommand,
    userInfoCommand,

    // Script Commands
    searchScriptsCommand,
    addScriptCommand,
    topScriptsCommand,
    randomScriptCommand,

    // Moderation Commands
    kickCommand,
    banCommand,
    warnCommand,
    muteCommand,
    clearCommand,
    lockdownCommand,

    // AI Commands
    aiChatCommand,
    aiImageCommand,
    translateCommand,

    // Economy Commands
    economyBalanceCommand,
    economyDailyCommand,
    economyGambleCommand,

    // Fun Commands
    funMemeCommand,
    fun8ballCommand,
    funRoastCommand
  ];

  return commands;
}
