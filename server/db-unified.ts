import { getDatabaseConfig } from "./db-config";
import * as schema from "@shared/schema-unified";

// Importa le configurazioni specifiche per ogni database
import { db as sqliteDb } from "./db-sqlite";
import { db as postgresDb } from "./db";

// Configurazione del database
export const dbConfig = getDatabaseConfig();

// Esporta l'istanza del database appropriata in base alla configurazione
export const db = dbConfig.type === 'sqlite' ? sqliteDb : postgresDb;

// Esporta anche il tipo di database attivo
export const databaseType = dbConfig.type;

console.log(`Database attivo: ${databaseType}`);