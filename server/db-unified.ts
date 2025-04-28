import * as schema from '@shared/schema';
import { getDatabaseConfig, DatabaseType } from './db-config';
import { Pool } from '@neondatabase/serverless';
import { drizzle as drizzlePostgres } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { join } from 'path';
import fs from 'fs';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

// Configura Neon per WebSocket
neonConfig.webSocketConstructor = ws;

// Directory per SQLite
const DB_DIR = './db';

// Ottieni la configurazione del database
const dbConfig = getDatabaseConfig();

// Inizializza l'oggetto DB appropriato
let db: any;
let pool: Pool | null = null;
let sqliteDb: Database.Database | null = null;

console.log(`Utilizzando database di tipo: ${dbConfig.type}`);

switch (dbConfig.type) {
  case 'postgres':
    pool = new Pool({ connectionString: dbConfig.url });
    db = drizzlePostgres({ client: pool, schema });
    console.log('Database PostgreSQL inizializzato');
    break;
  
  case 'sqlite':
  default:
    // Assicura che la directory esista
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    
    sqliteDb = new Database(join(DB_DIR, 'inventory.db'));
    db = drizzleSQLite(sqliteDb, { schema });
    console.log('Database SQLite inizializzato');
    break;
}

export { db, pool, sqliteDb, dbConfig };