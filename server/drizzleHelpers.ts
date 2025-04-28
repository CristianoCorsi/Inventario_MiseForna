/**
 * Helper per eseguire query Drizzle con gestione automatica dei tipi di dati
 * Supporta diversi tipi di database (SQLite, PostgreSQL, MySQL)
 */
import { SQLiteTable } from "drizzle-orm/sqlite-core";
import { type SQLiteColumn } from "drizzle-orm/sqlite-core/columns";
import { sql, eq } from "drizzle-orm";
import { db, sqlite } from "./db";
import { prepareForDb, convertFromDb } from "./dbUtils";

/**
 * Seleziona tutti i record da una tabella con conversione automatica dei tipi
 */
export async function dbSelect<T>(
  table: SQLiteTable,
  conditions?: any,
  dateFields: string[] = [],
  boolFields: string[] = [],
  jsonFields: string[] = []
): Promise<T[]> {
  try {
    let query = db.select().from(table);
    
    if (conditions) {
      query = query.where(conditions);
    }
    
    // Esegui la query
    const results = await query;
    
    // Converti i tipi per ogni risultato
    return results.map((result) => 
      convertFromDb(result, dateFields, boolFields, jsonFields)
    ) as T[];
  } catch (error) {
    console.error(`Errore in dbSelect:`, error);
    throw error;
  }
}

/**
 * Seleziona un record per ID con conversione automatica dei tipi
 */
export async function dbSelectById<T>(
  table: SQLiteTable,
  idColumn: SQLiteColumn<any, object, object>, 
  id: number,
  dateFields: string[] = [],
  boolFields: string[] = [],
  jsonFields: string[] = []
): Promise<T | undefined> {
  try {
    // Esegui una query ottimizzata per SQLite usando la sintassi SQL raw
    const statement = sqlite.prepare(`
      SELECT * FROM ${table._.config.name} 
      WHERE ${idColumn.name} = ?
    `);
    
    const result = statement.get(id);
    
    if (!result) return undefined;
    
    // Converti i tipi per il risultato
    return convertFromDb(
      result, 
      dateFields, 
      boolFields, 
      jsonFields
    ) as T;
  } catch (error) {
    console.error(`Errore in dbSelectById:`, error);
    throw error;
  }
}

/**
 * Inserisce un record con conversione automatica dei tipi
 */
export async function dbInsert<T>(
  table: SQLiteTable,
  data: any,
  dateFields: string[] = [],
  boolFields: string[] = [],
  jsonFields: string[] = []
): Promise<T> {
  try {
    // Prepara i dati per il database
    const preparedData = prepareForDb(data);
    
    // Esegui la query di inserimento
    // Usa SQL raw per evitare problemi di binding
    const columns = Object.keys(preparedData).join(', ');
    const placeholders = Object.keys(preparedData).map(() => '?').join(', ');
    const values = Object.values(preparedData);
    
    const statement = sqlite.prepare(`
      INSERT INTO ${table._.config.name} (${columns})
      VALUES (${placeholders})
      RETURNING *
    `);
    
    const result = statement.get(...values);
    
    // Converti i tipi per il risultato
    return convertFromDb(
      result, 
      dateFields, 
      boolFields, 
      jsonFields
    ) as T;
  } catch (error) {
    console.error(`Errore in dbInsert:`, error);
    throw error;
  }
}

/**
 * Aggiorna un record con conversione automatica dei tipi
 */
export async function dbUpdate<T>(
  table: SQLiteTable,
  idColumn: SQLiteColumn<any, object, object>,
  id: number,
  data: any,
  returnData: boolean = false,
  dateFields: string[] = [],
  boolFields: string[] = [],
  jsonFields: string[] = []
): Promise<T | undefined> {
  try {
    // Prepara i dati per il database
    const preparedData = prepareForDb(data);
    
    if (Object.keys(preparedData).length === 0) {
      return undefined;
    }
    
    // Costruisci SET clause
    const setClause = Object.keys(preparedData)
      .map(key => `${key} = ?`)
      .join(', ');
    
    // Valori per il binding
    const values = [...Object.values(preparedData), id];
    
    let query = `
      UPDATE ${table._.config.name}
      SET ${setClause}
      WHERE ${idColumn.name} = ?
    `;
    
    if (returnData) {
      query += ' RETURNING *';
      const statement = sqlite.prepare(query);
      const result = statement.get(...values);
      
      if (!result) return undefined;
      
      // Converti i tipi per il risultato
      return convertFromDb(
        result, 
        dateFields, 
        boolFields, 
        jsonFields
      ) as T;
    } else {
      const statement = sqlite.prepare(query);
      statement.run(...values);
      return undefined;
    }
  } catch (error) {
    console.error(`Errore in dbUpdate:`, error);
    throw error;
  }
}

/**
 * Elimina un record
 */
export async function dbDelete(
  table: SQLiteTable,
  idColumn: SQLiteColumn<any, object, object>,
  id: number
): Promise<boolean> {
  try {
    const statement = sqlite.prepare(`
      DELETE FROM ${table._.config.name}
      WHERE ${idColumn.name} = ?
      RETURNING ${idColumn.name}
    `);
    
    const result = statement.get(id);
    return !!result;
  } catch (error) {
    console.error(`Errore in dbDelete:`, error);
    throw error;
  }
}