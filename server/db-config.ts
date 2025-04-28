// Tipo di database supportati
export type DatabaseType = 'sqlite' | 'postgres' | 'mysql' | 'mssql';

// Configurazione database
interface DatabaseConfig {
  type: DatabaseType;
  url?: string;
}

// Leggi la configurazione dall'ambiente o usa SQLite di default
export function getDatabaseConfig(): DatabaseConfig {
  // Controlla variabili d'ambiente per il tipo di DB
  const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase() as DatabaseType;
  
  switch (dbType) {
    case 'postgres':
      if (!process.env.DATABASE_URL) {
        console.warn('PostgreSQL richiesto ma DATABASE_URL non impostato. Utilizzando SQLite.');
        return { type: 'sqlite' };
      }
      return { 
        type: 'postgres',
        url: process.env.DATABASE_URL
      };
    case 'mysql':
      if (!process.env.MYSQL_URL) {
        console.warn('MySQL richiesto ma MYSQL_URL non impostato. Utilizzando SQLite.');
        return { type: 'sqlite' };
      }
      return { 
        type: 'mysql',
        url: process.env.MYSQL_URL
      };
    case 'mssql':
      if (!process.env.MSSQL_URL) {
        console.warn('MSSQL richiesto ma MSSQL_URL non impostato. Utilizzando SQLite.');
        return { type: 'sqlite' };
      }
      return { 
        type: 'mssql',
        url: process.env.MSSQL_URL
      };
    case 'sqlite':
    default:
      return { type: 'sqlite' };
  }
}