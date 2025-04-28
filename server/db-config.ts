/**
 * Configurazione del database
 * Supporta più tipi di database: SQLite, PostgreSQL, MySQL, MS SQL
 */

import dotenv from 'dotenv';

// Carica le variabili d'ambiente se non è già stato fatto
if (!process.env.DB_TYPE) {
  dotenv.config();
}

export type DatabaseType = 'sqlite' | 'postgres' | 'mysql' | 'mssql';

export interface DatabaseConfig {
  type: DatabaseType;
  url?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
}

/**
 * Ottiene la configurazione del database dalle variabili d'ambiente
 * Se non è specificato un tipo di database, SQLite è il default
 */
export function getDatabaseConfig(): DatabaseConfig {
  const dbType = (process.env.DB_TYPE || 'sqlite') as DatabaseType;
  
  // Configurazione di base
  const config: DatabaseConfig = {
    type: dbType
  };
  
  // Configurazione specifica per ogni tipo di database
  switch (dbType) {
    case 'postgres':
      config.url = process.env.DATABASE_URL;
      break;
    case 'mysql':
    case 'mssql':
      config.host = process.env.DB_HOST;
      config.port = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined;
      config.username = process.env.DB_USER;
      config.password = process.env.DB_PASSWORD;
      config.database = process.env.DB_NAME;
      break;
    case 'sqlite':
    default:
      // Per SQLite nessuna configurazione aggiuntiva è necessaria
      break;
  }
  
  return config;
}