import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { DatabaseConfig, DatabaseInitResult, DatabaseStatus } from '../types/database.types';
import { DatabaseHelper } from '../utils/DatabaseHelper';

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
  const moduleRoot = path.resolve(import.meta.dirname, '../..');
  const filename = path.resolve(moduleRoot, './data/users.db');
  const fileDir = path.resolve(moduleRoot, './data/');
  const verbose = process.env.NODE_ENV === 'development';

  console.log(`User-module path: ${moduleRoot}`);
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

    try {
      await fs.chmod(config.filename, 0o666);
      console.log('Database file permissions set');
    } catch (permError) {
      console.warn('Could not set database permissions:', permError.message);
    }

    if (config.verbose) {
      database.on('trace', (sql: string) => {
        console.log('SQL:', sql);
      });
      database.on('profile', (sql: string, time: number) => {
        console.log(`⏱️  SQL took ${time}ms:`, sql);
      });
    }

    const init_path = path.resolve(import.meta.dirname, 'init.sql');
    const schema = DatabaseHelper.getSqlFromFile(init_path);
    if (schema) {
      console.log('executing schema...');
      await database.exec(schema);
      console.log('schema executed');
    } else {
      throw new Error('init.sql file not found');
    }

    return {
      success: true,
      databasePath: config.filename,
      indexesCreated: [
        'idx_users_username',
        'idx_users_email',
        'idx_users_created_at',
        'idx_friendships_user2',
        'idx_friend_requests_recipient',
      ],
      tablesCreated: ['users', 'friend_requests', 'friendships'],
      triggersCreated: ['friend_requests_updated_at', 'users_updated_at'],
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
