/**
 * Configurazione dei database supportati
 * Questo file gestisce la configurazione e la selezione del database
 */

// Tipi di database supportati
export type DatabaseType = 'sqlite' | 'postgres' | 'mysql' | 'mssql';

// Interfaccia di configurazione del database
interface DatabaseConfig {
  type: DatabaseType;
  url?: string;
}

/**
 * Ottiene la configurazione del database dalle variabili d'ambiente
 * Se non è specificato un tipo di database, SQLite è il default
 */
export function getDatabaseConfig(): DatabaseConfig {
  // Verifica se è impostato un tipo specifico di database
  const dbType = process.env.DB_TYPE as DatabaseType;
  
  // Se non è specificato, usa SQLite come database predefinito
  if (!dbType || !['sqlite', 'postgres', 'mysql', 'mssql'].includes(dbType)) {
    return {
      type: 'sqlite'
    };
  }
  
  // Configura in base al tipo di database
  switch(dbType) {
    case 'postgres':
      if (!process.env.DATABASE_URL) {
        console.warn('PostgreSQL selezionato ma DATABASE_URL non impostato, utilizzando SQLite');
        return { type: 'sqlite' };
      }
      return {
        type: 'postgres',
        url: process.env.DATABASE_URL
      };
      
    case 'mysql':
      if (!process.env.MYSQL_DATABASE_URL) {
        console.warn('MySQL selezionato ma MYSQL_DATABASE_URL non impostato, utilizzando SQLite');
        return { type: 'sqlite' };
      }
      return {
        type: 'mysql',
        url: process.env.MYSQL_DATABASE_URL
      };
      
    case 'mssql':
      if (!process.env.MSSQL_DATABASE_URL) {
        console.warn('Microsoft SQL Server selezionato ma MSSQL_DATABASE_URL non impostato, utilizzando SQLite');
        return { type: 'sqlite' };
      }
      return {
        type: 'mssql',
        url: process.env.MSSQL_DATABASE_URL
      };
      
    case 'sqlite':
    default:
      return {
        type: 'sqlite'
      };
  }
}