import * as schema from "@shared/schema";
import Database from "better-sqlite3";
import { config } from "./config";

// driver-specific drizzle factories
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { Pool } from "pg";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import mysql from "mysql2/promise";
import { drizzle as drizzleMysql } from "drizzle-orm/mysql2";

// db può essere sqlite, postgres-js o mysql2
export let db:
  | ReturnType<typeof drizzleSqlite>
  | ReturnType<typeof drizzlePg>
  | ReturnType<typeof drizzleMysql>;

// pool per Postgres o MySQL (null se sqlite)
export let pool: Pool | mysql.Pool | null = null;

async function init() {
  switch (config.database.type) {
    case "sqlite": {
      const sqliteDb = new Database(config.database.path!, {
        fileMustExist: false,
        // verbose: console.log // Opzionale: logga anche le chiamate del driver better-sqlite3
      });
      // Abilita il logger di Drizzle qui
      db = drizzleSqlite(sqliteDb, { schema, logger: true }); // <-- AGGIUNGI logger: true
      break;
    }
    case "postgres": {
      pool = new Pool({ connectionString: config.database.url! });
      // Abilita il logger di Drizzle qui
      db = drizzlePg(pool, { schema, logger: true }); // <-- AGGIUNGI logger: true
      break;
    }
    case "mysql": {
      pool = await mysql.createPool({ uri: config.database.url! });
      // Abilita il logger di Drizzle qui
      db = drizzleMysql(pool, { schema, mode: "full", logger: true }); // <-- AGGIUNGI logger: true
      break;
    }
    // MSSQL NOT SUPPORTED BY NOW
    //case "mssql": {
    //  pool = new ConnectionPool(config.database.url!);
    //  await pool.connect();
    //  db = drizzleMssql(pool, { schema });
    //  break;
    //}
    default:
      throw new Error(`Unsupported DB type: ${config.database.type}`);
  }
}

// Invochiamo init in IIFE per non usare top-level await
(async () => {
  try {
    await init();
    console.log(`Database inizializzato (${config.database.type})`);
  } catch (e) {
    console.error("Errore inizializzazione DB:", e);
    process.exit(1);
  }
})();
