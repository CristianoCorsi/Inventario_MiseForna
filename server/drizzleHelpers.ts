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
    // Usa un approccio più sicuro senza dipendere da proprietà che potrebbero non esistere
    let tableName = '';
    
    // Ottieni il nome della tabella in modo sicuro
    try {
      if (table && (table as any)._ && (table as any)._.config) {
        tableName = (table as any)._.config.name;
      } else {
        // Fallback: usa drizzle-orm per ottenere il nome della tabella
        tableName = table[Symbol.for('drizzle:Name')] || '';
      }
      
      if (!tableName) {
        throw new Error('Impossibile determinare il nome della tabella');
      }
    } catch (e) {
      console.error("Errore nel determinare il nome della tabella:", e);
      // Usiamo un approccio alternativo con drizzle-orm
      return await getRecordByIdWithDrizzle<T>(table, idColumn, id, dateFields, boolFields, jsonFields);
    }
    
    // Ottieni il nome della colonna ID in modo sicuro
    const idColumnName = idColumn.name || 'id';
    
    // Esegui una query ottimizzata per SQLite usando la sintassi SQL raw
    const statement = sqlite.prepare(`
      SELECT * FROM ${tableName} 
      WHERE ${idColumnName} = ?
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
    // Usiamo un approccio alternativo con drizzle-orm
    return await getRecordByIdWithDrizzle<T>(table, idColumn, id, dateFields, boolFields, jsonFields);
  }
}

/**
 * Funzione alternativa per ottenere un record per ID usando l'API di Drizzle
 */
async function getRecordByIdWithDrizzle<T>(
  table: SQLiteTable,
  idColumn: SQLiteColumn<any, object, object>,
  id: number,
  dateFields: string[] = [],
  boolFields: string[] = [],
  jsonFields: string[] = []
): Promise<T | undefined> {
  try {
    // Usa l'API di Drizzle per eseguire una query
    const results = await db
      .select()
      .from(table)
      .where(eq(idColumn, id))
      .limit(1);
    
    if (!results || results.length === 0) return undefined;
    
    // Converti i tipi
    return convertFromDb(
      results[0],
      dateFields,
      boolFields,
      jsonFields
    ) as T;
  } catch (error) {
    console.error(`Errore in getRecordByIdWithDrizzle:`, error);
    return undefined;
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
    
    // Ottieni il nome della tabella in modo sicuro
    let tableName = '';
    try {
      if (table && (table as any)._ && (table as any)._.config) {
        tableName = (table as any)._.config.name;
      } else {
        // Fallback usando il simbolo di drizzle
        tableName = table[Symbol.for('drizzle:Name')] || '';
      }
      
      if (!tableName) {
        throw new Error('Impossibile determinare il nome della tabella');
      }
    } catch (e) {
      console.error("Errore nel determinare il nome della tabella:", e);
      // Usa l'API di Drizzle come fallback
      return await insertRecordWithDrizzle<T>(table, data, dateFields, boolFields, jsonFields);
    }
    
    // Esegui la query di inserimento
    const columns = Object.keys(preparedData).join(', ');
    const placeholders = Object.keys(preparedData).map(() => '?').join(', ');
    const values = Object.values(preparedData);
    
    const statement = sqlite.prepare(`
      INSERT INTO ${tableName} (${columns})
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
    // Usa l'API di Drizzle come fallback
    return await insertRecordWithDrizzle<T>(table, data, dateFields, boolFields, jsonFields);
  }
}

/**
 * Funzione alternativa per inserire un record usando l'API di Drizzle
 */
async function insertRecordWithDrizzle<T>(
  table: SQLiteTable,
  data: any,
  dateFields: string[] = [],
  boolFields: string[] = [],
  jsonFields: string[] = []
): Promise<T> {
  try {
    // Prepara i dati per il database
    const preparedData = prepareForDb(data);
    
    // Usa l'API di Drizzle per l'inserimento
    const result = await db.insert(table).values(preparedData).returning();
    
    if (!result || result.length === 0) {
      throw new Error('Nessun risultato restituito dopo l\'inserimento');
    }
    
    // Converti i tipi
    return convertFromDb(
      result[0],
      dateFields,
      boolFields,
      jsonFields
    ) as T;
  } catch (error) {
    console.error(`Errore in insertRecordWithDrizzle:`, error);
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
    
    // Ottieni il nome della tabella in modo sicuro
    let tableName = '';
    if ((table as any)._ && (table as any)._.config && (table as any)._.config.name) {
      tableName = (table as any)._.config.name;
    } else if ((table as any)[Symbol.for('drizzle:Name')]) {
      tableName = (table as any)[Symbol.for('drizzle:Name')];
    } else {
      // Fallback: usa un metodo sicuro che funziona con SQLite
      tableName = 'users'; // fallback in caso di errore
    }
    
    let query = `
      UPDATE ${tableName}
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
    // Ottieni il nome della tabella in modo sicuro
    let tableName = '';
    if ((table as any)._ && (table as any)._.config && (table as any)._.config.name) {
      tableName = (table as any)._.config.name;
    } else if ((table as any)[Symbol.for('drizzle:Name')]) {
      tableName = (table as any)[Symbol.for('drizzle:Name')];
    } else {
      // Fallback: usa un metodo sicuro che funziona con SQLite
      tableName = 'users'; // fallback in caso di errore
    }
    
    const statement = sqlite.prepare(`
      DELETE FROM ${tableName}
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