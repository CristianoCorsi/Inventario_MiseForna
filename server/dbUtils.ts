/**
 * Utility per la gestione dei tipi di dati con diversi database
 * Fornisce funzioni per convertire i tipi di dati tra l'applicazione e il database
 */
import { config } from "./config";

/**
 * Converte un valore Date in un formato adatto al tipo di database
 * @param value Il valore Date da convertire
 * @returns Il valore convertito nel formato appropriato per il database
 */
export function dateToDb(value: Date | null | undefined): string | Date | null {
  if (value === null || value === undefined) {
    return null;
  }
  
  // Per SQLite, converte in ISO string
  if (config.database.type === 'sqlite') {
    return value.toISOString();
  }
  
  // Per altri database, usa il tipo Date nativo
  return value;
}

/**
 * Converte un valore dal database in un oggetto Date
 * @param value Il valore dal database
 * @returns Un oggetto Date
 */
export function dbToDate(value: string | Date | null | undefined): Date | null {
  if (value === null || value === undefined) {
    return null;
  }
  
  // Se è già un oggetto Date, lo restituisce
  if (value instanceof Date) {
    return value;
  }
  
  // Altrimenti converte da stringa a Date
  try {
    return new Date(value);
  } catch (error) {
    console.error("Errore nella conversione della data:", error);
    return null;
  }
}

/**
 * Converte un valore booleano in un formato adatto al tipo di database
 * @param value Il valore booleano da convertire
 * @returns Il valore convertito nel formato appropriato per il database
 */
export function booleanToDb(value: boolean | null | undefined): number | boolean | null {
  if (value === null || value === undefined) {
    return null;
  }
  
  // Per SQLite, converte in 0/1
  if (config.database.type === 'sqlite') {
    return value ? 1 : 0;
  }
  
  // Per altri database, usa il tipo booleano nativo
  return value;
}

/**
 * Converte un valore dal database in un booleano
 * @param value Il valore dal database
 * @returns Un valore booleano
 */
export function dbToBoolean(value: number | boolean | null | undefined): boolean | null {
  if (value === null || value === undefined) {
    return null;
  }
  
  // Se è già un booleano, lo restituisce
  if (typeof value === 'boolean') {
    return value;
  }
  
  // Altrimenti converte da numero a booleano
  return !!value;
}

/**
 * Converte un oggetto JSON in un formato adatto al tipo di database
 * @param value L'oggetto da convertire
 * @returns L'oggetto convertito nel formato appropriato per il database
 */
export function jsonToDb(value: any): string | object | null {
  if (value === null || value === undefined) {
    return null;
  }
  
  // Per SQLite, converte in stringa JSON
  if (config.database.type === 'sqlite') {
    try {
      return JSON.stringify(value);
    } catch (error) {
      console.error("Errore nella serializzazione JSON:", error);
      return null;
    }
  }
  
  // Per altri database, usa l'oggetto come è
  return value;
}

/**
 * Converte un valore dal database in un oggetto JSON
 * @param value Il valore dal database
 * @returns Un oggetto JSON
 */
export function dbToJson(value: string | object | null | undefined): any {
  if (value === null || value === undefined) {
    return null;
  }
  
  // Se è una stringa, prova a deserializzarla
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error("Errore nella deserializzazione JSON:", error);
      return null;
    }
  }
  
  // Altrimenti restituisce l'oggetto come è
  return value;
}

/**
 * Prepara un oggetto per l'inserimento nel database
 * Converte tutti i tipi di dati nel formato appropriato per il database
 * @param obj L'oggetto da preparare
 * @returns L'oggetto convertito
 */
export function prepareForDb<T extends object>(obj: T): any {
  if (!obj) return obj;
  
  const result: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    
    if (value instanceof Date) {
      result[key] = dateToDb(value);
    } else if (typeof value === 'boolean') {
      result[key] = booleanToDb(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = jsonToDb(value);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Converte un oggetto dal database nel formato appropriato per l'applicazione
 * @param obj L'oggetto dal database
 * @returns L'oggetto convertito
 */
export function convertFromDb<T extends object>(
  obj: T, 
  dateFields: string[] = [], 
  boolFields: string[] = [], 
  jsonFields: string[] = []
): any {
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