import { db, databaseType } from "./db-unified";
import { 
  users, items, locations, loans, activities,
  qrCodes, settings, 
  type User, type Item, type Location, type Loan, 
  type Activity, type QrCode, type Setting, 
  type InsertUser, type InsertItem, type InsertLocation,
  type InsertLoan, type InsertActivity, type InsertQrCode,
  type InsertSetting
} from "@shared/schema-unified";
import { eq, like, gt, isNull, and, or, desc, sql } from "drizzle-orm";
import session from "express-session";
import Database from "better-sqlite3";
import SqliteStore from "better-sqlite3-session-store";
import { join } from "path";
import connectPg from "connect-pg-simple";
import { JSON as Json } from "zod";

// Interfaccia per lo storage dei dati
export interface IStorage {
  // Session store for authentication
  sessionStore: session.Store;
  
  // Items
  getItems(): Promise<Item[]>;
  getItem(id: number): Promise<Item | undefined>;
  getItemByItemId(itemId: string): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: number, item: Partial<InsertItem>): Promise<Item | undefined>;
  deleteItem(id: number): Promise<boolean>;
  
  // Locations
  getLocations(): Promise<Location[]>;
  getLocation(id: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined>;
  deleteLocation(id: number): Promise<boolean>;
  
  // Loans
  getLoans(): Promise<Loan[]>;
  getLoan(id: number): Promise<Loan | undefined>;
  getLoansByItemId(itemId: number): Promise<Loan[]>;
  getOverdueLoans(): Promise<Loan[]>;
  getActiveLoans(): Promise<Loan[]>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  updateLoan(id: number, loan: Partial<InsertLoan>): Promise<Loan | undefined>;
  returnLoan(id: number, returnDate?: Date): Promise<Loan | undefined>;
  deleteLoan(id: number): Promise<boolean>;
  
  // Activities
  getActivities(limit?: number): Promise<Activity[]>;
  getActivitiesByItemId(itemId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Settings
  getSetting(key: string): Promise<Setting | undefined>;
  updateSetting(key: string, value: string): Promise<Setting>;
  
  // QR Codes
  getQrCodes(): Promise<QrCode[]>;
  getQrCode(id: number): Promise<QrCode | undefined>;
  getQrCodeByCodeId(qrCodeId: string): Promise<QrCode | undefined>;
  createQrCode(qrCode: InsertQrCode): Promise<QrCode>;
  updateQrCode(id: number, qrCode: Partial<InsertQrCode>): Promise<QrCode | undefined>;
  deleteQrCode(id: number): Promise<boolean>;
  getUnassignedQrCodes(): Promise<QrCode[]>;
  associateQrCodeWithItem(qrCodeId: string, itemId: number): Promise<QrCode | undefined>;
  
  // Users and Authentication
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  resetPassword(id: number, newPassword: string): Promise<User | undefined>;
  updateLastLogin(id: number): Promise<User | undefined>;
  changePassword(id: number, currentPassword: string, newPassword: string): Promise<boolean>;
}

export class UnifiedStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Inizializza lo store di sessione appropriato in base al tipo di database
    if (databaseType === 'sqlite') {
      // SQLite session store
      const SqliteSessionStore = SqliteStore(session);
      const DATA_DIR = join(process.cwd(), 'data');
      const sessionDb = new Database(join(DATA_DIR, 'sessions.db'));
      this.sessionStore = new SqliteSessionStore({
        client: sessionDb,
        expired: {
          clear: true,
          intervalMs: 24 * 60 * 60 * 1000 // 24 ore
        }
      });
    } else {
      // PostgreSQL session store
      const PostgresSessionStore = connectPg(session);
      this.sessionStore = new PostgresSessionStore({
        createTableIfMissing: true,
        tableName: 'sessions'
      });
    }
    
    console.log(`Session store inizializzato per: ${databaseType}`);
  }

  // Implementazione Items
  async getItems(): Promise<Item[]> {
    return await db.select().from(items);
  }

  async getItem(id: number): Promise<Item | undefined> {
    const result = await db.select().from(items).where(eq(items.id, id));
    return result[0];
  }

  async getItemByItemId(itemId: string): Promise<Item | undefined> {
    const result = await db.select().from(items).where(eq(items.itemId, itemId));
    return result[0];
  }

  async createItem(item: InsertItem): Promise<Item> {
    const result = await db.insert(items).values(item).returning();
    return result[0];
  }

  async updateItem(id: number, item: Partial<InsertItem>): Promise<Item | undefined> {
    const result = await db.update(items).set(item).where(eq(items.id, id)).returning();
    return result[0];
  }

  async deleteItem(id: number): Promise<boolean> {
    try {
      await db.delete(items).where(eq(items.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting item:", error);
      return false;
    }
  }

  // Implementazione Locations
  async getLocations(): Promise<Location[]> {
    return await db.select().from(locations);
  }

  async getLocation(id: number): Promise<Location | undefined> {
    const result = await db.select().from(locations).where(eq(locations.id, id));
    return result[0];
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const result = await db.insert(locations).values(location).returning();
    return result[0];
  }

  async updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined> {
    const result = await db.update(locations).set(location).where(eq(locations.id, id)).returning();
    return result[0];
  }

  async deleteLocation(id: number): Promise<boolean> {
    try {
      await db.delete(locations).where(eq(locations.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting location:", error);
      return false;
    }
  }

  // Implementazione Loans
  async getLoans(): Promise<Loan[]> {
    return await db.select().from(loans);
  }

  async getLoan(id: number): Promise<Loan | undefined> {
    const result = await db.select().from(loans).where(eq(loans.id, id));
    return result[0];
  }

  async getLoansByItemId(itemId: number): Promise<Loan[]> {
    return await db.select().from(loans).where(eq(loans.itemId, itemId));
  }

  async getOverdueLoans(): Promise<Loan[]> {
    const now = new Date().toISOString();
    return await db.select().from(loans).where(
      and(
        eq(loans.status, 'active'),
        sql`${loans.dueDate} < ${now}`
      )
    );
  }

  async getActiveLoans(): Promise<Loan[]> {
    return await db.select().from(loans).where(eq(loans.status, 'active'));
  }

  async createLoan(loan: InsertLoan): Promise<Loan> {
    // Aggiorna lo stato dell'elemento a 'loaned'
    await db.update(items)
      .set({ status: 'loaned' })
      .where(eq(items.id, loan.itemId));
      
    const result = await db.insert(loans).values({
      ...loan,
      status: 'active',
      loanDate: new Date().toISOString()
    }).returning();
    
    return result[0];
  }

  async updateLoan(id: number, loan: Partial<InsertLoan>): Promise<Loan | undefined> {
    const result = await db.update(loans).set(loan).where(eq(loans.id, id)).returning();
    return result[0];
  }

  async returnLoan(id: number, returnDate: Date = new Date()): Promise<Loan | undefined> {
    // Trova il prestito
    const [existingLoan] = await db.select().from(loans).where(eq(loans.id, id));
    if (!existingLoan) return undefined;
    
    // Aggiorna lo stato del prestito
    const result = await db.update(loans)
      .set({ 
        status: 'returned', 
        returnDate: returnDate.toISOString() 
      })
      .where(eq(loans.id, id))
      .returning();
    
    // Aggiorna lo stato dell'elemento a 'available'
    await db.update(items)
      .set({ status: 'available' })
      .where(eq(items.id, existingLoan.itemId));
    
    return result[0];
  }

  async deleteLoan(id: number): Promise<boolean> {
    try {
      await db.delete(loans).where(eq(loans.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting loan:", error);
      return false;
    }
  }

  // Implementazione Activities
  async getActivities(limit?: number): Promise<Activity[]> {
    let query = db.select().from(activities).orderBy(desc(activities.timestamp));
    
    if (limit) {
      query = query.limit(limit);
    }
    
    return await query;
  }

  async getActivitiesByItemId(itemId: number): Promise<Activity[]> {
    return await db.select()
      .from(activities)
      .where(eq(activities.itemId, itemId))
      .orderBy(desc(activities.timestamp));
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const result = await db.insert(activities).values({
      ...activity,
      timestamp: new Date().toISOString()
    }).returning();
    
    return result[0];
  }

  // Implementazione Settings
  async getSetting(key: string): Promise<Setting | undefined> {
    const result = await db.select().from(settings).where(eq(settings.key, key));
    return result[0];
  }

  async updateSetting(key: string, value: string): Promise<Setting> {
    // Controlla se l'impostazione esiste già
    const existing = await this.getSetting(key);
    
    if (existing) {
      // Aggiorna l'impostazione esistente
      const result = await db.update(settings)
        .set({ value })
        .where(eq(settings.key, key))
        .returning();
      return result[0];
    } else {
      // Crea una nuova impostazione
      const result = await db.insert(settings)
        .values({ key, value })
        .returning();
      return result[0];
    }
  }

  // Implementazione QR Codes
  async getQrCodes(): Promise<QrCode[]> {
    return await db.select().from(qrCodes);
  }

  async getQrCode(id: number): Promise<QrCode | undefined> {
    const result = await db.select().from(qrCodes).where(eq(qrCodes.id, id));
    return result[0];
  }

  async getQrCodeByCodeId(qrCodeId: string): Promise<QrCode | undefined> {
    const result = await db.select().from(qrCodes).where(eq(qrCodes.qrCodeId, qrCodeId));
    return result[0];
  }

  async createQrCode(qrCode: InsertQrCode): Promise<QrCode> {
    const result = await db.insert(qrCodes).values({
      ...qrCode,
      dateGenerated: new Date().toISOString(),
      isAssigned: false
    }).returning();
    return result[0];
  }

  async updateQrCode(id: number, qrCode: Partial<InsertQrCode>): Promise<QrCode | undefined> {
    const result = await db.update(qrCodes).set(qrCode).where(eq(qrCodes.id, id)).returning();
    return result[0];
  }

  async deleteQrCode(id: number): Promise<boolean> {
    try {
      await db.delete(qrCodes).where(eq(qrCodes.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting QR code:", error);
      return false;
    }
  }

  async getUnassignedQrCodes(): Promise<QrCode[]> {
    return await db.select().from(qrCodes).where(eq(qrCodes.isAssigned, false));
  }

  async associateQrCodeWithItem(qrCodeId: string, itemId: number): Promise<QrCode | undefined> {
    // Trova il QR code
    const [qrCode] = await db.select().from(qrCodes).where(eq(qrCodes.qrCodeId, qrCodeId));
    if (!qrCode) return undefined;
    
    // Trova l'elemento
    const [item] = await db.select().from(items).where(eq(items.id, itemId));
    if (!item) return undefined;
    
    // Aggiorna l'elemento con il QR code
    await db.update(items)
      .set({ qrCode: qrCodeId })
      .where(eq(items.id, itemId));
    
    // Aggiorna il QR code come assegnato
    const result = await db.update(qrCodes)
      .set({ 
        isAssigned: true, 
        assignedToItemId: itemId,
        dateAssigned: new Date().toISOString()
      })
      .where(eq(qrCodes.id, qrCode.id))
      .returning();
    
    return result[0];
  }

  // Implementazione Users
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      ...user,
      createdAt: new Date().toISOString(),
      lastLogin: null
    }).returning();
    return result[0];
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      await db.delete(users).where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  async resetPassword(id: number, newPassword: string): Promise<User | undefined> {
    const result = await db.update(users)
      .set({ password: newPassword })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async updateLastLogin(id: number): Promise<User | undefined> {
    const result = await db.update(users)
      .set({ lastLogin: new Date().toISOString() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async changePassword(id: number, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      // Ottieni l'utente
      const user = await this.getUser(id);
      if (!user) return false;
      
      // Verifica che la password corrente sia corretta (dovrebbe essere fatto altrove con hashing)
      if (user.password !== currentPassword) return false;
      
      // Aggiorna la password
      await this.resetPassword(id, newPassword);
      return true;
    } catch (error) {
      console.error("Error changing password:", error);
      return false;
    }
  }
}

// Esporta una singola istanza di storage
export const storage = new UnifiedStorage();