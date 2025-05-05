import session from 'express-session';
import createMemoryStore from 'memorystore';
import connectPgSimple from 'connect-pg-simple';
import { config } from './config';
import { pool } from './db'; // il pool di Postgres creato in db.ts

// MemoryStore per default (es. sviluppo, SQLite, MySQL, MSSQL)
const MemoryStore = createMemoryStore(session);

// Store Postgres
const PgStore = connectPgSimple(session);

export const sessionStore = (() => {
  if (config.database.type === 'postgres' && pool) {
    return new PgStore({
      pool,             // usa il pool di neon/postgres
      tableName: 'session'
    });
  }
  // fallback: in-memory store
  return new MemoryStore({
    checkPeriod: 24 * 60 * 60 * 1000 // elimina le sessioni scadute ogni 24h
  });
})();
