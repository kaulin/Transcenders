import fs from 'fs/promises';
import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { DatabaseConfig, DatabaseInitResult, DatabaseStatus } from '../types/database.types';
import 'dotenv/config';

console.log('Loading database.ts file...');
let db: Database | null = null;
let dbStatus: DatabaseStatus = {
  connected: false,
  databasePath: '',
  tablesCount: 0,
};

// Environment-aware database configuration with env variable support
function getDatabaseConfig(): DatabaseConfig {
  // Use environment variables with sensible defaults
  const filename = process.env.DATABASE_PATH || './data/users.db';
  const fileDir = process.env.DATABASE_DIR || './data';
  const verbose = process.env.NODE_ENV === 'development';

  console.log(`Database path: ${filename}`);
  console.log(`Database directory: ${fileDir}`);
  console.log(`Verbose mode: ${verbose}`);

  return {
    filename,
    fileDir,
    verbose,
  };
}

async function ensureDataDir(dataPath: string): Promise<void> {
  try {
    await fs.access(dataPath);
    console.log('Data directory exists');
  } catch {
    await fs.mkdir(dataPath, { recursive: true });
    console.log('Created data directory');
  }
}

async function initDB(config: DatabaseConfig): Promise<DatabaseInitResult> {
  console.log('Init database...');

  await ensureDataDir(config.fileDir);
  console.log('Database path: ', config.filename);
  try {
    const database = await open({
      filename: config.filename,
      driver: config.verbose ? sqlite3.verbose().Database : sqlite3.Database,
    });
    console.log('Database connection opened');

    if (config.verbose) {
      database.on('trace', (sql: string) => {
        console.log('SQL:', sql);
      });
      database.on('profile', (sql: string, time: number) => {
        console.log(`⏱️  SQL took ${time}ms:`, sql);
      });
    }

    const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      display_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      modified_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

    CREATE TABLE friend_requests (
      id            INTEGER PRIMARY KEY,
      initiator_id  INTEGER NOT NULL,
      recipient_id  INTEGER NOT NULL,
      state         TEXT NOT NULL CHECK (state IN ('pending', 'declined')),
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (initiator_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE (initiator_id, recipient_id),
      CHECK (initiator_id <> recipient_id)
    );

    CREATE TABLE friendships (
      user1_id   INTEGER NOT NULL,
      user2_id   INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user1_id, user2_id),
      FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
      CHECK (user1_id < user2_id)  -- guarantees canonical order and uniqueness
    );

    CREATE TRIGGER IF NOT EXISTS users_updated_at
    AFTER UPDATE ON users
    BEGIN
      UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

    CREATE TRIGGER IF NOT EXISTS friend_relationships_updated_at
    AFTER UPDATE ON friend_relationships
    BEGIN
      UPDATE friend_relationships SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `;
    // trigger for updating modified_at,
    // and other init stuff

    console.log('executing schema...');
    await database.exec(schema);
    console.log('schema executed');

    return {
      success: true,
      databasePath: config.filename,
      indexesCreated: ['idx_users_username', 'idx_users_email', 'idx_users_created_at'],
      tablesCreated: ['users'],
      triggersCreated: [],
    };
  } catch (error) {
    console.error('Database init failed:', error);
    throw error;
  }
}

//  Check if database file exists

async function databaseFileExists(filepath: string): Promise<boolean> {
  try {
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
}

export async function getDB(): Promise<Database> {
  const config: DatabaseConfig = getDatabaseConfig();
  const fileExists = await databaseFileExists(config.filename);
  if (!fileExists && db) {
    console.log('Database file missing, reinitializing...');
    try {
      await db.close();
    } catch (error) {
      console.log('error closing db connection', error);
    }
    db = null;
  }
  if (!db) {
    const initResult = await initDB(config);
    db = await open({
      filename: config.filename,
      driver: sqlite3.Database,
    });
    console.log('Database ready:', initResult.databasePath);
  }
  return db;
}

console.log('database.ts file loaded successfully');
