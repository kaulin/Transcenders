import { ServiceConfig, ServiceConfigType } from '@transcenders/contracts';
import fs from 'fs/promises';
import path from 'path';
import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { ENV } from './env.hook.js';

type ServiceKey = keyof typeof ServiceConfig;

/**
 * Usage:
 *   const userDB = await DatabaseManager.for('USER').open();
 *   ...
 *   await DatabaseManager.for('USER').close();
 */
export class DatabaseManager {
  private static instances = new Map<ServiceKey, DatabaseManager>();

  /** Clear all instances (useful for development restarts) */
  static clearInstances(): void {
    this.instances.clear();
  }

  /** Get (or create) a manager for a given service key */
  static for(service: ServiceKey): DatabaseManager {
    let inst = this.instances.get(service);
    if (!inst) {
      inst = new DatabaseManager(service);
      this.instances.set(service, inst);
    }
    return inst;
  }

  /** Close ALL open DBs */
  static async closeAll(): Promise<void> {
    await Promise.all(Array.from(this.instances.values()).map((m) => m.close()));
  }

  private db: Database | null = null;
  private readonly cfg: ServiceConfigType;
  private readonly dir: string;
  private readonly file: string;
  private readonly initSql: string;

  private constructor(private readonly key: ServiceKey) {
    this.cfg = ServiceConfig[key];
    const { dir, file, initSql } = this.buildPaths();
    this.dir = dir;
    this.file = file;
    this.initSql = initSql;
  }

  /** Return existing connection or open a new one */
  private openPromise?: Promise<Database>;
  async open(): Promise<Database> {
    if (this.db) {
      try {
        await this.checkDatabaseFileExists();
        return this.db;
      } catch (error) {
        console.log(`Database ${this.key} appears to be corrupted/missing, recreating...`);
        this.db = null;
      }
    }
    if (this.openPromise) return this.openPromise;

    // Ensure dir exists
    await this.ensureDir(this.dir);

    // Open sqlite
    this.db = await this.openSqlite(this.file, ENV.NODE_ENV === 'development');

    // ownership fix based on env
    await this.ensureOwnership(this.file, this.dir);

    // Enforce FKs
    await this.db.run('PRAGMA foreign_keys = ON');

    // Init schema
    await this.initSchema(this.db, this.initSql);

    return this.db;
  }

  /** Close this DB connection (if open) */
  async close(): Promise<void> {
    if (!this.db) return;
    await this.db.close();
    this.db = null;
  }

  /** Drop the handle and re-open fresh */
  async refresh(): Promise<Database> {
    await this.close();
    return this.open();
  }

  // =========================
  // Private helpers
  // =========================
  private buildPaths() {
    const dir = path.resolve(ENV.PROJECT_ROOT, this.cfg.baseDir);
    const file = path.join(dir, this.cfg.dbFile);

    const initSql = this.cfg.initSql;
    return { dir, file, initSql };
  }

  private async checkDatabaseFileExists(): Promise<void> {
    try {
      await fs.access(this.file, fs.constants.F_OK | fs.constants.R_OK);
    } catch (error) {
      throw new Error(`Database file does not exist or is not accessible: ${this.file}`);
    }
  }

  private async ensureDir(dir: string): Promise<void> {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  private async openSqlite(filename: string, verbose: boolean): Promise<Database> {
    const driver = verbose ? sqlite3.verbose().Database : sqlite3.Database;
    const db = await open({ filename, driver });

    if (verbose) {
      db.on('trace', (sql: string) => console.debug(`[SQL TRACE ${this.key}]`, sql));
      db.on('profile', (sql: string, time: number) =>
        console.debug(`[SQL PROFILE ${this.key}] ${time}ms`, sql),
      );
    }
    return db;
  }

  private async getSqlFromFile(filePath: string): Promise<string | null> {
    try {
      await fs.access(filePath);
    } catch {
      console.log(`SQL file not found: ${filePath}`);
      return null;
    }
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  }

  private async initSchema(db: Database, sqlPath: string): Promise<void> {
    const schema = await this.getSqlFromFile(sqlPath);
    if (!schema) {
      throw new Error(`init.sql not found for ${this.key} at ${sqlPath}`);
    }
    await db.exec(schema);
  }

  private async ensureOwnership(file: string, dir: string): Promise<void> {
    const uid = ENV.HOST_UID;
    const gid = ENV.HOST_GID;
    try {
      await fs.chown(file, uid, gid);
      await fs.chown(dir, uid, gid);
    } catch (error: unknown) {
      console.debug(String(error));
    }
  }
}
