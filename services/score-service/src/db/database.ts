import { DatabaseHelper } from '@transcenders/contracts';
import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { DatabaseConfig, DatabaseInitResult } from '../types/database.types';

console.log('Loading database.ts file...');
let db: Database | null = null;

function getDatabaseConfig(): DatabaseConfig {
  const moduleRoot = path.resolve(import.meta.dirname, '../..');
  const filename = path.resolve(moduleRoot, './data/users.db');
  const fileDir = path.resolve(moduleRoot, './data/');
  const verbose = process.env.NODE_ENV === 'development';

  console.log(`Score-module path: ${moduleRoot}`);
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
      await fs.chmod(config.fileDir, 0o777);
      console.log('Database dir permissions set');
    } catch (error: any) {
      console.warn('Could not set database permissions:', error.message);
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
      indexesCreated: [],
      tablesCreated: ['scores'],
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
