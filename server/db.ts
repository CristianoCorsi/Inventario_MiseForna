import * as schema from "@shared/schema";
import fs from 'fs';
import path from 'path';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { Pool } from '@neondatabase/serverless';
import session from 'express-session';
import SqliteStore from 'better-sqlite3-session-store';
import connectPg from 'connect-pg-simple';

/**
 * Crea la directory dei dati per SQLite
 */
function createDataDirectory() {
  const DATA_DIR = path.join(process.cwd(), 'data');
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`Directory creata per SQLite: ${DATA_DIR}`);
  }
  return DATA_DIR;
}

/**
 * Ottiene il percorso al database SQLite
 */
function getSQLitePath() {
  const DATA_DIR = createDataDirectory();
  return path.join(DATA_DIR, 'inventario.db');
}

// Inizializza SQLite come database predefinito
const DATABASE_PATH = getSQLitePath();
console.log(`Utilizzo database SQLite: ${DATABASE_PATH}`);
const sqlite = new Database(DATABASE_PATH);

// Crea l'istanza del database con Drizzle ORM
export const db = drizzle(sqlite, { schema });

// Funzione per inizializzare le tabelle se non esistono
export async function initializeDatabase() {
  try {
    // Verifica se le tabelle esistono
    const tablesExist = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").all().length > 0;
    
    if (!tablesExist) {
      console.log('Creazione tabelle del database...');
      
      // Crea tabelle usando le definizioni dello schema
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          item_id TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          description TEXT,
          location TEXT,
          photo_url TEXT,
          origin TEXT DEFAULT 'purchased',
          donor_name TEXT,
          date_added TEXT DEFAULT CURRENT_TIMESTAMP,
          qr_code TEXT,
          barcode TEXT,
          status TEXT DEFAULT 'available'
        );
        
        CREATE TABLE IF NOT EXISTS locations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          description TEXT
        );
        
        CREATE TABLE IF NOT EXISTS loans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          item_id INTEGER NOT NULL,
          borrower_name TEXT NOT NULL,
          borrower_email TEXT,
          borrower_phone TEXT,
          loan_date TEXT DEFAULT CURRENT_TIMESTAMP,
          due_date TEXT NOT NULL,
          return_date TEXT,
          notes TEXT,
          status TEXT DEFAULT 'active'
        );
        
        CREATE TABLE IF NOT EXISTS activities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          item_id INTEGER,
          activity_type TEXT NOT NULL,
          description TEXT NOT NULL,
          timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
          metadata TEXT
        );
        
        CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT NOT NULL UNIQUE,
          value TEXT
        );
        
        CREATE TABLE IF NOT EXISTS qr_codes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          qr_code_id TEXT NOT NULL UNIQUE,
          description TEXT,
          date_generated TEXT DEFAULT CURRENT_TIMESTAMP,
          is_assigned INTEGER DEFAULT 0,
          assigned_to_item_id INTEGER,
          date_assigned TEXT
        );
        
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          email TEXT,
          full_name TEXT,
          role TEXT DEFAULT 'staff' NOT NULL,
          is_active INTEGER DEFAULT 1,
          last_login TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          profile_picture TEXT,
          preferences TEXT
        );
        
        CREATE TABLE IF NOT EXISTS sessions (
          sid TEXT PRIMARY KEY,
          sess TEXT NOT NULL,
          expire TEXT NOT NULL
        );
      `);
      
      console.log('Database inizializzato con successo');
    } else {
      console.log('Le tabelle del database esistono già');
    }
  } catch (error) {
    console.error('Errore durante l\'inizializzazione del database:', error);
    throw error;
  }
}

// Crea lo store di sessione per autenticazione
const SQLiteStore = SqliteStore(session);
export const sessionStore = new SQLiteStore({
  client: sqlite,
  expired: {
    clear: true,
    intervalMs: 24 * 60 * 60 * 1000 // Cancella sessioni scadute ogni 24 ore
  }
});

// Configura pool di connessione per PostgreSQL (usato solo se PostgreSQL è attivo)
let pool: any = null;
if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    console.log('Pool PostgreSQL configurato');
  } catch (error) {
    console.error('Errore durante la configurazione del pool PostgreSQL:', error);
  }
}

// Esporta pool e sqlite per altre parti dell'applicazione che lo richiedono
export { pool, sqlite };