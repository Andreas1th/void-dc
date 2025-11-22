import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

class Database {
  constructor() {
    this.db = null;
  }

  async initialize() {
    try {
      this.db = await open({
        filename: process.env.DATABASE_PATH || './bot_database.db',
        driver: sqlite3.Database
      });

      await this.createTables();
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
    }
  }

  async createTables() {
    // User data table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT,
        warnings INTEGER DEFAULT 0,
        reputation INTEGER DEFAULT 0,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Scripts table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS scripts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        game_name TEXT,
        script_content TEXT,
        author_id TEXT,
        downloads INTEGER DEFAULT 0,
        rating REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Warnings table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS warnings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        moderator_id TEXT,
        reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Server settings table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS server_settings (
        guild_id TEXT PRIMARY KEY,
        welcome_channel TEXT,
        log_channel TEXT,
        auto_mod_enabled BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async getUser(userId) {
    return await this.db.get('SELECT * FROM users WHERE id = ?', userId);
  }

  async createUser(userId, username) {
    return await this.db.run(
      'INSERT OR REPLACE INTO users (id, username) VALUES (?, ?)',
      userId, username
    );
  }

  async addWarning(userId, moderatorId, reason) {
    await this.db.run(
      'INSERT INTO warnings (user_id, moderator_id, reason) VALUES (?, ?, ?)',
      userId, moderatorId, reason
    );
    
    await this.db.run(
      'UPDATE users SET warnings = warnings + 1 WHERE id = ?',
      userId
    );
  }

  async getWarnings(userId) {
    return await this.db.all(
      'SELECT * FROM warnings WHERE user_id = ? ORDER BY created_at DESC',
      userId
    );
  }

  async addScript(name, gameName, scriptContent, authorId) {
    return await this.db.run(
      'INSERT INTO scripts (name, game_name, script_content, author_id) VALUES (?, ?, ?, ?)',
      name, gameName, scriptContent, authorId
    );
  }

  async searchScripts(query) {
    return await this.db.all(
      'SELECT * FROM scripts WHERE name LIKE ? OR game_name LIKE ? ORDER BY downloads DESC LIMIT 10',
      `%${query}%`, `%${query}%`
    );
  }

  async getTopScripts(limit = 10) {
    return await this.db.all(
      'SELECT * FROM scripts ORDER BY downloads DESC LIMIT ?',
      limit
    );
  }
}

export default Database;
