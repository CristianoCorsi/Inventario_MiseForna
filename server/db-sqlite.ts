import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '@shared/schema';
import { join } from 'path';
import fs from 'fs';

// Assicura che la directory esista
const DB_DIR = './db';
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const sqlite = new Database(join(DB_DIR, 'inventory.db'));
export const db = drizzle(sqlite, { schema });