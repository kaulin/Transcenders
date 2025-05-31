import fs from 'fs/promises';
import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';

console.log('🔄 Loading db.ts file...');
let db: Database | null = null;

async function ensureDataDir() {
  const dataDir = '/app/data';
  try {
    await fs.access(dataDir);
    console.log('📁 Data directory exists');
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
    console.log('📁 Created data directory');
  }
}

async function initDB(): Promise<Database> {
  console.log('Init database...');

  await ensureDataDir();

  const dbPath = '/app/data/users.db';
  console.log('Database path: ', dbPath);

  const database = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
  console.log('✅ Database connection opened');

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
  `;

  console.log('executing schema...');
  await database.exec(schema);
  console.log('schema executed');

  return database;
}

export async function getDB(): Promise<Database> {
  if (!db) {
    db = await initDB();
  }
  return db;
}

export async function testDatabase() {
  console.log('🧪 testDatabase function called');

  try {
    const database = await getDB();

    // Insert a test user
    console.log('📝 Inserting test user...');
    await database.run(
      'INSERT OR IGNORE INTO users (username, email, display_name) VALUES (?, ?, ?)',
      ['testuser', 'test@example.com', 'Test User'],
    );

    // Get all users
    const users = await database.all('SELECT * FROM users');
    console.log('👥 Users in database:', users);

    // Check tables
    const tables = await database.all("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('📊 Tables in database:', tables);

    return {
      message: 'Database test completed successfully',
      timestamp: new Date().toISOString(),
      tables: tables,
      users: users,
    };
  } catch (error) {
    console.error('❌ Database error:', error);
    throw error;
  }
}

console.log('✅ db.ts file loaded successfully');
