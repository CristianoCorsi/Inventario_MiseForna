import { eq } from "drizzle-orm";
import { db } from "./db";
import { prepareForDb, convertFromDb } from "./dbUtils";

/**
 * Helper per eseguire una query select con Drizzle
 * Converte i dati nel formato corretto
 */
export async function dbSelect<T>(
  table: any, 
  whereClause?: any,
  dateFields: string[] = [],
  boolFields: string[] = [],
  jsonFields: string[] = [],
  limit?: number
): Promise<T[]> {
  try {
    let query = db.select().from(table);
    
    if (whereClause) {
      query = query.where(whereClause);
    }
    
    if (limit) {
      query = query.limit(limit);
    }

    const results = await query;
    
    return results.map(item => 
      convertFromDb(item, dateFields, boolFields, jsonFields)
    ) as T[];
  } catch (error) {
    console.error('Error in dbSelect:', error);
    throw error;
  }
}

/**
 * Helper per eseguire una query select by ID con Drizzle
 * Converte i dati nel formato corretto
 */
export async function dbSelectById<T>(
  table: any, 
  idField: any,
  id: number,
  dateFields: string[] = [],
  boolFields: string[] = [],
  jsonFields: string[] = []
): Promise<T | undefined> {
  try {
    const [result] = await db
      .select()
      .from(table)
      .where(eq(idField, id));
    
    if (!result) return undefined;
    
    return convertFromDb(result, dateFields, boolFields, jsonFields) as T;
  } catch (error) {
    console.error('Error in dbSelectById:', error);
    throw error;
  }
}

/**
 * Helper per eseguire una query insert con Drizzle
 * Prepara i dati nel formato corretto per il database
 */
export async function dbInsert<T>(
  table: any, 
  data: any,
  returning: boolean = true
): Promise<T> {
  try {
    const preparedData = prepareForDb(data);
    
    if (returning) {
      const [result] = await db
        .insert(table)
        .values(preparedData)
        .returning();
      
      return result as T;
    } else {
      await db
        .insert(table)
        .values(preparedData);
      
      return data as T;
    }
  } catch (error) {
    console.error('Error in dbInsert:', error);
    throw error;
  }
}

/**
 * Helper per eseguire una query update con Drizzle
 * Prepara i dati nel formato corretto per il database
 */
export async function dbUpdate<T>(
  table: any, 
  idField: any,
  id: number,
  data: any,
  returning: boolean = true
): Promise<T | undefined> {
  try {
    const preparedData = prepareForDb(data);
    
    if (returning) {
      const [result] = await db
        .update(table)
        .set(preparedData)
        .where(eq(idField, id))
        .returning();
      
      return result as T;
    } else {
      await db
        .update(table)
        .set(preparedData)
        .where(eq(idField, id));
      
      return undefined;
    }
  } catch (error) {
    console.error('Error in dbUpdate:', error);
    throw error;
  }
}

/**
 * Helper per eseguire una query delete con Drizzle
 * Restituisce true se l'operazione ha avuto successo
 */
export async function dbDelete(
  table: any, 
  idField: any,
  id: number
): Promise<boolean> {
  try {
    const [result] = await db
      .delete(table)
      .where(eq(idField, id))
      .returning();
    
    return !!result;
  } catch (error) {
    console.error('Error in dbDelete:', error);
    throw error;
  }
}