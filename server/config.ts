// carica .env una sola volta
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

// Tipo di database supportati
export type DatabaseType = 'sqlite' | 'postgres' | 'mysql' | 'mssql';

// Interfaccia per le configurazioni del database
export interface DatabaseConfig {
  type: DatabaseType;
  url?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
}

// Interfaccia per tutte le configurazioni dell'applicazione
export interface AppConfig {
  env: string;
  port: number;
  host: string;
  database: DatabaseConfig;
  sessionSecret: string;
  cookieSecure: boolean;
  defaultLanguage: string;
  forceItalian: boolean;
}

// Valori predefiniti per le configurazioni
const DEFAULT_CONFIG: AppConfig = {
  env: 'development',
  port: 5000,
  host: '0.0.0.0',
  database: {
    type: 'sqlite'
  },
  sessionSecret: 'misericordia-dev-secret',
  cookieSecure: false,
  defaultLanguage: 'it',
  forceItalian: true
};

/**
 * Ottiene le configurazioni dell'applicazione dalle variabili d'ambiente
 * con fallback sui valori predefiniti
 */
export function getConfig(): AppConfig {
  // Configurazioni di base
  const config: AppConfig = {
    env: process.env.NODE_ENV || DEFAULT_CONFIG.env,
    port: parseInt(process.env.PORT || DEFAULT_CONFIG.port.toString(), 10),
    host: process.env.HOST || DEFAULT_CONFIG.host,
    database: getDatabaseConfig(),
    sessionSecret: process.env.SESSION_SECRET || DEFAULT_CONFIG.sessionSecret,
    cookieSecure: process.env.COOKIE_SECURE === 'true' || DEFAULT_CONFIG.cookieSecure,
    defaultLanguage: process.env.DEFAULT_LANGUAGE || DEFAULT_CONFIG.defaultLanguage,
    forceItalian: process.env.FORCE_ITALIAN === 'true' || DEFAULT_CONFIG.forceItalian
  };

  

  console.log(process.env)

  return config;
}

/**
 * Ottiene le configurazioni del database dalle variabili d'ambiente
 */
function getDatabaseConfig(): DatabaseConfig {
  const dbType = (process.env.DB_TYPE || DEFAULT_CONFIG.database.type) as DatabaseType;
  
  // Configurazione per SQLite (default)
  if (dbType === 'sqlite') {
    return {
      type: 'sqlite'
    };
  }

  // Configurazione per PostgreSQL
  if (dbType === 'postgres') {
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      host: process.env.PGHOST,
      port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : undefined,
      username: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE
    };
  }

  // Configurazione per MySQL
  if (dbType === 'mysql') {
    return {
      type: 'mysql',
      url: process.env.MYSQL_DATABASE_URL,
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : undefined,
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE
    };
  }

  // Configurazione per MS SQL Server
  if (dbType === 'mssql') {
    return {
      type: 'mssql',
      url: process.env.MSSQL_DATABASE_URL,
      host: process.env.MSSQL_HOST,
      port: process.env.MSSQL_PORT ? parseInt(process.env.MSSQL_PORT, 10) : undefined,
      username: process.env.MSSQL_USER,
      password: process.env.MSSQL_PASSWORD,
      database: process.env.MSSQL_DATABASE
    };
  }

  // Fallback su SQLite se il tipo non è supportato
  console.warn(`Tipo di database "${dbType}" non supportato. Utilizzo di SQLite.`);
  return {
    type: 'sqlite'
  };
}

/**
 * Aggiorna il file .env con le nuove configurazioni del database
 * @param dbConfig Configurazione del database da salvare
 */
// TODO: questa funzione non viene mai usata -> si può cancellare
export async function updateDatabaseConfig(dbConfig: DatabaseConfig): Promise<boolean> {
  try {
    // Percorso del file .env
    const envPath = path.resolve(process.cwd(), '.env');
    
    // Leggi il file .env se esiste
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Dividi il contenuto in righe
    const lines = envContent.split('\n');
    const newLines: string[] = [];
    
    // Variabili già aggiornate
    const updatedVars = new Set<string>();

    // Aggiorna le configurazioni esistenti
    for (const line of lines) {
      if (line.trim() === '' || line.startsWith('#')) {
        // Mantieni le righe vuote e i commenti
        newLines.push(line);
        continue;
      }

      const match = line.match(/^([^=]+)=(.*)/);
      if (!match) {
        // Mantieni le righe che non sono variabili
        newLines.push(line);
        continue;
      }

      const key = match[1].trim();
      
      // Aggiorna DB_TYPE
      if (key === 'DB_TYPE') {
        newLines.push(`DB_TYPE=${dbConfig.type}`);
        updatedVars.add('DB_TYPE');
        continue;
      }

      // Gestisci le variabili specifiche per il tipo di database
      if (dbConfig.type === 'postgres') {
        if (key === 'DATABASE_URL' && dbConfig.url) {
          newLines.push(`DATABASE_URL=${dbConfig.url}`);
          updatedVars.add('DATABASE_URL');
          continue;
        }
        if (key === 'PGHOST' && dbConfig.host) {
          newLines.push(`PGHOST=${dbConfig.host}`);
          updatedVars.add('PGHOST');
          continue;
        }
        if (key === 'PGPORT' && dbConfig.port) {
          newLines.push(`PGPORT=${dbConfig.port}`);
          updatedVars.add('PGPORT');
          continue;
        }
        if (key === 'PGUSER' && dbConfig.username) {
          newLines.push(`PGUSER=${dbConfig.username}`);
          updatedVars.add('PGUSER');
          continue;
        }
        if (key === 'PGPASSWORD' && dbConfig.password) {
          newLines.push(`PGPASSWORD=${dbConfig.password}`);
          updatedVars.add('PGPASSWORD');
          continue;
        }
        if (key === 'PGDATABASE' && dbConfig.database) {
          newLines.push(`PGDATABASE=${dbConfig.database}`);
          updatedVars.add('PGDATABASE');
          continue;
        }
      } else if (dbConfig.type === 'mysql') {
        if (key === 'MYSQL_DATABASE_URL' && dbConfig.url) {
          newLines.push(`MYSQL_DATABASE_URL=${dbConfig.url}`);
          updatedVars.add('MYSQL_DATABASE_URL');
          continue;
        }
        if (key === 'MYSQL_HOST' && dbConfig.host) {
          newLines.push(`MYSQL_HOST=${dbConfig.host}`);
          updatedVars.add('MYSQL_HOST');
          continue;
        }
        if (key === 'MYSQL_PORT' && dbConfig.port) {
          newLines.push(`MYSQL_PORT=${dbConfig.port}`);
          updatedVars.add('MYSQL_PORT');
          continue;
        }
        if (key === 'MYSQL_USER' && dbConfig.username) {
          newLines.push(`MYSQL_USER=${dbConfig.username}`);
          updatedVars.add('MYSQL_USER');
          continue;
        }
        if (key === 'MYSQL_PASSWORD' && dbConfig.password) {
          newLines.push(`MYSQL_PASSWORD=${dbConfig.password}`);
          updatedVars.add('MYSQL_PASSWORD');
          continue;
        }
        if (key === 'MYSQL_DATABASE' && dbConfig.database) {
          newLines.push(`MYSQL_DATABASE=${dbConfig.database}`);
          updatedVars.add('MYSQL_DATABASE');
          continue;
        }
      } else if (dbConfig.type === 'mssql') {
        if (key === 'MSSQL_DATABASE_URL' && dbConfig.url) {
          newLines.push(`MSSQL_DATABASE_URL=${dbConfig.url}`);
          updatedVars.add('MSSQL_DATABASE_URL');
          continue;
        }
        if (key === 'MSSQL_HOST' && dbConfig.host) {
          newLines.push(`MSSQL_HOST=${dbConfig.host}`);
          updatedVars.add('MSSQL_HOST');
          continue;
        }
        if (key === 'MSSQL_PORT' && dbConfig.port) {
          newLines.push(`MSSQL_PORT=${dbConfig.port}`);
          updatedVars.add('MSSQL_PORT');
          continue;
        }
        if (key === 'MSSQL_USER' && dbConfig.username) {
          newLines.push(`MSSQL_USER=${dbConfig.username}`);
          updatedVars.add('MSSQL_USER');
          continue;
        }
        if (key === 'MSSQL_PASSWORD' && dbConfig.password) {
          newLines.push(`MSSQL_PASSWORD=${dbConfig.password}`);
          updatedVars.add('MSSQL_PASSWORD');
          continue;
        }
        if (key === 'MSSQL_DATABASE' && dbConfig.database) {
          newLines.push(`MSSQL_DATABASE=${dbConfig.database}`);
          updatedVars.add('MSSQL_DATABASE');
          continue;
        }
      }

      // Mantieni le altre variabili d'ambiente invariate
      newLines.push(line);
    }

    // Aggiungi le variabili che non sono state aggiornate
    if (!updatedVars.has('DB_TYPE')) {
      newLines.push(`DB_TYPE=${dbConfig.type}`);
    }

    if (dbConfig.type === 'postgres') {
      if (dbConfig.url && !updatedVars.has('DATABASE_URL')) {
        newLines.push(`DATABASE_URL=${dbConfig.url}`);
      }
      if (dbConfig.host && !updatedVars.has('PGHOST')) {
        newLines.push(`PGHOST=${dbConfig.host}`);
      }
      if (dbConfig.port && !updatedVars.has('PGPORT')) {
        newLines.push(`PGPORT=${dbConfig.port}`);
      }
      if (dbConfig.username && !updatedVars.has('PGUSER')) {
        newLines.push(`PGUSER=${dbConfig.username}`);
      }
      if (dbConfig.password && !updatedVars.has('PGPASSWORD')) {
        newLines.push(`PGPASSWORD=${dbConfig.password}`);
      }
      if (dbConfig.database && !updatedVars.has('PGDATABASE')) {
        newLines.push(`PGDATABASE=${dbConfig.database}`);
      }
    } else if (dbConfig.type === 'mysql') {
      if (dbConfig.url && !updatedVars.has('MYSQL_DATABASE_URL')) {
        newLines.push(`MYSQL_DATABASE_URL=${dbConfig.url}`);
      }
      if (dbConfig.host && !updatedVars.has('MYSQL_HOST')) {
        newLines.push(`MYSQL_HOST=${dbConfig.host}`);
      }
      if (dbConfig.port && !updatedVars.has('MYSQL_PORT')) {
        newLines.push(`MYSQL_PORT=${dbConfig.port}`);
      }
      if (dbConfig.username && !updatedVars.has('MYSQL_USER')) {
        newLines.push(`MYSQL_USER=${dbConfig.username}`);
      }
      if (dbConfig.password && !updatedVars.has('MYSQL_PASSWORD')) {
        newLines.push(`MYSQL_PASSWORD=${dbConfig.password}`);
      }
      if (dbConfig.database && !updatedVars.has('MYSQL_DATABASE')) {
        newLines.push(`MYSQL_DATABASE=${dbConfig.database}`);
      }
    } else if (dbConfig.type === 'mssql') {
      if (dbConfig.url && !updatedVars.has('MSSQL_DATABASE_URL')) {
        newLines.push(`MSSQL_DATABASE_URL=${dbConfig.url}`);
      }
      if (dbConfig.host && !updatedVars.has('MSSQL_HOST')) {
        newLines.push(`MSSQL_HOST=${dbConfig.host}`);
      }
      if (dbConfig.port && !updatedVars.has('MSSQL_PORT')) {
        newLines.push(`MSSQL_PORT=${dbConfig.port}`);
      }
      if (dbConfig.username && !updatedVars.has('MSSQL_USER')) {
        newLines.push(`MSSQL_USER=${dbConfig.username}`);
      }
      if (dbConfig.password && !updatedVars.has('MSSQL_PASSWORD')) {
        newLines.push(`MSSQL_PASSWORD=${dbConfig.password}`);
      }
      if (dbConfig.database && !updatedVars.has('MSSQL_DATABASE')) {
        newLines.push(`MSSQL_DATABASE=${dbConfig.database}`);
      }
    }

    // Scrivi il nuovo contenuto nel file .env
    fs.writeFileSync(envPath, newLines.join('\n'));
    
    // Ricarica le variabili d'ambiente
    Object.keys(process.env).forEach(key => {
      if (key.startsWith('DB_') || key.startsWith('PG') || key.startsWith('MYSQL_') || key.startsWith('MSSQL_')) {
        delete process.env[key];
      }
    });
    
    return true;
  } catch (error) {
    console.error('Errore durante l\'aggiornamento del file .env:', error);
    return false;
  }
}

// Esporta le configurazioni
export const config = getConfig();
console.log(config)