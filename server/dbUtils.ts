/**
 * Utility per la gestione dei tipi di dati con diversi database
 * Fornisce funzioni per convertire i tipi di dati tra l'applicazione e il database
 */

import { getDatabaseConfig } from './db-config';

// Ottieni il tipo di database
const DB_TYPE = getDatabaseConfig().type || 'sqlite';

/**
 * Converte un valore Date in un formato adatto al tipo di database
 * @param value Il valore Date da convertire
 * @returns Il valore convertito nel formato appropriato per il database
 */
export function dateToDb(value: Date | null | undefined): string | Date | null {
  if (value === null || value === undefined) return null;
  
  // SQLite utilizza stringhe ISO per le date
  if (DB_TYPE === 'sqlite') {
    return value instanceof Date ? value.toISOString() : value;
  }
  
  // Altri database possono usare direttamente l'oggetto Date
  return value;
}

/**
 * Converte un valore dal database in un oggetto Date
 * @param value Il valore dal database
 * @returns Un oggetto Date
 */
export function dbToDate(value: string | Date | null | undefined): Date | null {
  if (value === null || value === undefined) return null;
  
  // Se è già un oggetto Date, return direttamente
  if (value instanceof Date) return value;
  
  // Per SQLite, converte la stringa ISO in Date
  if (typeof value === 'string') {
    const parsedDate = new Date(value);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  }
  
  return null;
}

/**
 * Converte un valore booleano in un formato adatto al tipo di database
 * @param value Il valore booleano da convertire
 * @returns Il valore convertito nel formato appropriato per il database
 */
export function booleanToDb(value: boolean | null | undefined): number | boolean | null {
  if (value === null || value === undefined) return null;
  
  // SQLite utilizza 0/1 per i booleani
  if (DB_TYPE === 'sqlite') {
    return value ? 1 : 0;
  }
  
  // Altri database possono usare direttamente i booleani
  return value;
}

/**
 * Converte un valore dal database in un booleano
 * @param value Il valore dal database
 * @returns Un valore booleano
 */
export function dbToBoolean(value: number | boolean | null | undefined): boolean | null {
  if (value === null || value === undefined) return null;
  
  // Se è già un booleano, return direttamente
  if (typeof value === 'boolean') return value;
  
  // Per SQLite, converte 0/1 in booleano
  if (typeof value === 'number') {
    return value !== 0;
  }
  
  return null;
}

/**
 * Converte un oggetto JSON in un formato adatto al tipo di database
 * @param value L'oggetto da convertire
 * @returns L'oggetto convertito nel formato appropriato per il database
 */
export function jsonToDb(value: any): string | object | null {
  if (value === null || value === undefined) return null;
  
  // SQLite richiede JSON come stringa
  if (DB_TYPE === 'sqlite') {
    return typeof value === 'string' ? value : JSON.stringify(value);
  }
  
  // Altri database possono usare direttamente l'oggetto
  return value;
}

/**
 * Converte un valore dal database in un oggetto JSON
 * @param value Il valore dal database
 * @returns Un oggetto JSON
 */
export function dbToJson(value: string | object | null | undefined): any {
  if (value === null || value === undefined) return null;
  
  // Se è già un oggetto, return direttamente
  if (typeof value === 'object' && value !== null) return value;
  
  // Per SQLite, converte la stringa JSON in oggetto
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error('Errore durante il parsing JSON:', e);
      return null;
    }
  }
  
  return null;
}

/**
 * Prepara un oggetto per l'inserimento nel database
 * Converte tutti i tipi di dati nel formato appropriato per il database
 * @param obj L'oggetto da preparare
 * @returns L'oggetto convertito
 */
export function prepareForDb<T extends object>(obj: T): any {
  if (!obj) return obj;
  
  const result: any = { ...obj };
  
  // Itera attraverso le proprietà dell'oggetto
  for (const [key, value] of Object.entries(result)) {
    // Converti Date
    if (value instanceof Date) {
      result[key] = dateToDb(value);
    }
    // Converti booleani
    else if (typeof value === 'boolean') {
      result[key] = booleanToDb(value);
    }
    // Converti oggetti (JSON)
    else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
      result[key] = jsonToDb(value);
    }
  }
  
  return result;
}

/**
 * Converte un oggetto dal database nel formato appropriato per l'applicazione
 * @param obj L'oggetto dal database
 * @returns L'oggetto convertito
 */
export function convertFromDb<T extends object>(obj: T, dateFields: string[] = [], boolFields: string[] = [], jsonFields: string[] = []): any {
  if (!obj) return obj;
  
  const result: any = { ...obj };
  
  // Converti i campi data
  for (const field of dateFields) {
    if (field in result) {
      result[field] = dbToDate(result[field]);
    }
  }
  
  // Converti i campi booleani
  for (const field of boolFields) {
    if (field in result) {
      result[field] = dbToBoolean(result[field]);
    }
  }
  
  // Converti i campi JSON
  for (const field of jsonFields) {
    if (field in result) {
      result[field] = dbToJson(result[field]);
    }
  }
  
  return result;
}