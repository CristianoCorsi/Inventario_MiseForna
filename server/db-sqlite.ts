import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema-unified";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

// Assicurati che esista la directory per i dati
const DATA_DIR = join(process.cwd(), "data");
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
  console.log(`Directory creata: ${DATA_DIR}`);
}

// Percorso del database SQLite
const DATABASE_PATH = join(DATA_DIR, "inventory.db");
console.log(`Utilizzando database SQLite in: ${DATABASE_PATH}`);

// Crea e collega al database SQLite
const sqlite = new Database(DATABASE_PATH);
export const db = drizzle(sqlite, { schema });
