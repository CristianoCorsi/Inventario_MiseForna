import {
  Item,
  InsertItem,
  Location,
  InsertLocation,
  Loan,
  InsertLoan,
  Activity,
  InsertActivity,
  Setting,
  InsertSetting,
  QrCode,
  InsertQrCode,
  User,
  InsertUser,
  Session,
  items,
  locations,
  loans,
  activities,
  settings,
  qrCodes,
  users,
} from "@shared/schema";
import { db, sqlite } from "./db";
import { eq, and, or, isNull, desc, asc, lt } from "drizzle-orm";

import session from "express-session";

export interface IStorage {
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
  updateLocation(
    id: number,
    location: Partial<InsertLocation>,
  ): Promise<Location | undefined>;
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

  // QR Codes
  getQrCodes(): Promise<QrCode[]>;
  getQrCode(id: number): Promise<QrCode | undefined>;
  getQrCodeByCodeId(qrCodeId: string): Promise<QrCode | undefined>;
  createQrCode(qrCode: InsertQrCode): Promise<QrCode>;
  updateQrCode(
    id: number,
    qrCode: Partial<InsertQrCode>,
  ): Promise<QrCode | undefined>;
  deleteQrCode(id: number): Promise<boolean>;
  getUnassignedQrCodes(): Promise<QrCode[]>;
  associateQrCodeWithItem(
    qrCodeId: string,
    itemId: number,
  ): Promise<QrCode | undefined>;

  // Activities
  getActivities(limit?: number): Promise<Activity[]>;
  getActivitiesByItemId(itemId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Settings
  getSetting(key: string): Promise<Setting | undefined>;
  updateSetting(key: string, value: string): Promise<Setting>;

  // Users and Authentication
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  resetPassword(id: number, newPassword: string): Promise<User | undefined>;
  updateLastLogin(id: number): Promise<User | undefined>;
  changePassword(
    id: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean>;
}

import connectPg from "connect-pg-simple";
import { pool } from "./db";

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      pool,
      tableName: "sessions",
      createTableIfMissing: true,
    });
  }
  // Item methods
  async getItems(): Promise<Item[]> {
    try {
      const { dbSelect } = await import("./drizzleHelpers");
      return await dbSelect<Item>(
        items,
        undefined,
        ["purchaseDate", "warrantyExpires", "maintenanceDate", "lastUpdated"], // campi data
        [], // campi booleani
        ["metadata"], // campi JSON
      );
    } catch (error) {
      console.error("Error in getItems:", error);
      throw error;
    }
  }

  async getItem(id: number): Promise<Item | undefined> {
    try {
      const { dbSelectById } = await import("./drizzleHelpers");
      return await dbSelectById<Item>(
        items,
        items.id,
        id,
        ["purchaseDate", "warrantyExpires", "maintenanceDate", "lastUpdated"], // campi data
        [], // campi booleani
        ["metadata"], // campi JSON
      );
    } catch (error) {
      console.error("Error in getItem:", error);
      throw error;
    }
  }

  async getItemByItemId(itemId: string): Promise<Item | undefined> {
    const [item] = await db
      .select()
      .from(items)
      .where(eq(items.itemId, itemId));
    return item;
  }

  async createItem(item: InsertItem): Promise<Item> {
    const [newItem] = await db.insert(items).values(item).returning();
    return newItem;
  }

  async updateItem(
    id: number,
    item: Partial<InsertItem>,
  ): Promise<Item | undefined> {
    const [updatedItem] = await db
      .update(items)
      .set(item)
      .where(eq(items.id, id))
      .returning();
    return updatedItem;
  }

  async deleteItem(id: number): Promise<boolean> {
    const [deletedItem] = await db
      .delete(items)
      .where(eq(items.id, id))
      .returning();
    return !!deletedItem;
  }

  // Location methods
  async getLocations(): Promise<Location[]> {
    return db.select().from(locations);
  }

  async getLocation(id: number): Promise<Location | undefined> {
    const [location] = await db
      .select()
      .from(locations)
      .where(eq(locations.id, id));
    return location;
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const [newLocation] = await db
      .insert(locations)
      .values(location)
      .returning();
    return newLocation;
  }

  async updateLocation(
    id: number,
    location: Partial<InsertLocation>,
  ): Promise<Location | undefined> {
    const [updatedLocation] = await db
      .update(locations)
      .set(location)
      .where(eq(locations.id, id))
      .returning();
    return updatedLocation;
  }

  async deleteLocation(id: number): Promise<boolean> {
    const [deletedLocation] = await db
      .delete(locations)
      .where(eq(locations.id, id))
      .returning();
    return !!deletedLocation;
  }

  // Loan methods
  async getLoans(): Promise<Loan[]> {
    try {
      const { dbSelect } = await import("./drizzleHelpers");
      return await dbSelect<Loan>(
        loans,
        undefined,
        ["dueDate", "loanDate", "returnDate"], // campi data
        [], // campi booleani
        ["metadata"], // campi JSON
      );
    } catch (error) {
      console.error("Error in getLoans:", error);
      throw error;
    }
  }

  async getLoan(id: number): Promise<Loan | undefined> {
    try {
      const { dbSelectById } = await import("./drizzleHelpers");
      return await dbSelectById<Loan>(
        loans,
        loans.id,
        id,
        ["dueDate", "loanDate", "returnDate"], // campi data
        [], // campi booleani
        ["metadata"], // campi JSON
      );
    } catch (error) {
      console.error("Error in getLoan:", error);
      throw error;
    }
  }

  async getLoansByItemId(itemId: number): Promise<Loan[]> {
    try {
      const { convertFromDb } = await import("./dbUtils");
      const results = await db
        .select()
        .from(loans)
        .where(eq(loans.itemId, itemId));

      // Converti tutti i risultati nel formato appropriato
      return results.map((loan) =>
        convertFromDb(
          loan,
          ["dueDate", "loanDate", "returnDate"], // campi data
          [], // campi booleani
          ["metadata"], // campi JSON
        ),
      );
    } catch (error) {
      console.error("Error in getLoansByItemId:", error);
      throw error;
    }
  }

  async getOverdueLoans(): Promise<Loan[]> {
    try {
      const { convertFromDb, dateToDb } = await import("./dbUtils");

      // Converti la data nel formato adatto al database
      const now = dateToDb(new Date());

      // Usa SQL raw per evitare problemi di binding
      const statement = sqlite.prepare(`
        SELECT * FROM loans 
        WHERE status = ? AND due_date < ?
      `);

      const results = statement.all("active", now);

      // Converti tutti i risultati nel formato appropriato
      return results.map((loan) =>
        convertFromDb(
          loan,
          ["dueDate", "loanDate", "returnDate"], // campi data
          [], // campi booleani
          ["metadata"], // campi JSON
        ),
      );
    } catch (error) {
      console.error("Error in getOverdueLoans:", error);
      // Fallback sicuro: restituisci un array vuoto
      return [];
    }
  }

  async getActiveLoans(): Promise<Loan[]> {
    try {
      const { convertFromDb } = await import("./dbUtils");
      const results = await db
        .select()
        .from(loans)
        .where(or(eq(loans.status, "active"), eq(loans.status, "overdue")));

      // Converti tutti i risultati nel formato appropriato
      return results.map((loan) =>
        convertFromDb(
          loan,
          ["dueDate", "loanDate", "returnDate"], // campi data
          [], // campi booleani
          ["metadata"], // campi JSON
        ),
      );
    } catch (error) {
      console.error("Error in getActiveLoans:", error);
      throw error;
    }
  }

  async createLoan(loan: InsertLoan): Promise<Loan> {
    const [newLoan] = await db.insert(loans).values(loan).returning();

    // Update the item status to 'loaned'
    await db
      .update(items)
      .set({ status: "loaned" })
      .where(eq(items.id, loan.itemId));

    return newLoan;
  }

  async updateLoan(
    id: number,
    loan: Partial<InsertLoan>,
  ): Promise<Loan | undefined> {
    const [updatedLoan] = await db
      .update(loans)
      .set(loan)
      .where(eq(loans.id, id))
      .returning();
    return updatedLoan;
  }

  async returnLoan(
    id: number,
    returnDate: Date = new Date(),
  ): Promise<Loan | undefined> {
    const loan = await this.getLoan(id);
    if (!loan) return undefined;

    // Update loan status to returned
    const [updatedLoan] = await db
      .update(loans)
      .set({
        returnDate,
        status: "returned",
      })
      .where(eq(loans.id, id))
      .returning();

    // Update the item status back to 'available'
    await db
      .update(items)
      .set({ status: "available" })
      .where(eq(items.id, loan.itemId));

    return updatedLoan;
  }

  async deleteLoan(id: number): Promise<boolean> {
    const [deletedLoan] = await db
      .delete(loans)
      .where(eq(loans.id, id))
      .returning();
    return !!deletedLoan;
  }

  // Activity methods
  async getActivities(limit?: number): Promise<Activity[]> {
    let query = db
      .select()
      .from(activities)
      .orderBy(desc(activities.timestamp));

    if (limit) {
      query = query.limit(limit);
    }

    return await query.all();
  }

  async getActivitiesByItemId(itemId: number): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.itemId, itemId))
      .orderBy(desc(activities.timestamp))
      .all();
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db
      .insert(activities)
      .values(activity)
      .returning();
    return newActivity;
  }

  // Settings methods
  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key));
    return setting;
  }

  async updateSetting(key: string, value: string): Promise<Setting> {
    // Check if setting exists
    const existingSetting = await this.getSetting(key);

    if (existingSetting) {
      // Update existing setting
      const [updatedSetting] = await db
        .update(settings)
        .set({ value })
        .where(eq(settings.key, key))
        .returning();

      return updatedSetting;
    } else {
      // Create new setting
      const [newSetting] = await db
        .insert(settings)
        .values({ key, value })
        .returning();

      return newSetting;
    }
  }

  // QR Code methods
  async getQrCodes(): Promise<QrCode[]> {
    return await db.select().from(qrCodes).all();
  }

  async getQrCode(id: number): Promise<QrCode | undefined> {
    const [qrCode] = await db.select().from(qrCodes).where(eq(qrCodes.id, id));
    return qrCode;
  }

  async getQrCodeByCodeId(qrCodeId: string): Promise<QrCode | undefined> {
    const [qrCode] = await db
      .select()
      .from(qrCodes)
      .where(eq(qrCodes.qrCodeId, qrCodeId));
    return qrCode;
  }

  async createQrCode(qrCode: InsertQrCode): Promise<QrCode> {
    const [newQrCode] = await db.insert(qrCodes).values(qrCode).returning();
    return newQrCode;
  }

  async updateQrCode(
    id: number,
    qrCode: Partial<InsertQrCode>,
  ): Promise<QrCode | undefined> {
    const [updatedQrCode] = await db
      .update(qrCodes)
      .set(qrCode)
      .where(eq(qrCodes.id, id))
      .returning();
    return updatedQrCode;
  }

  async deleteQrCode(id: number): Promise<boolean> {
    const [deletedQrCode] = await db
      .delete(qrCodes)
      .where(eq(qrCodes.id, id))
      .returning();
    return !!deletedQrCode;
  }

  async getUnassignedQrCodes(): Promise<QrCode[]> {
    return await db
      .select()
      .from(qrCodes)
      .where(eq(qrCodes.isAssigned, false))
      .all();
  }

  async associateQrCodeWithItem(
    qrCodeId: string,
    itemId: number,
  ): Promise<QrCode | undefined> {
    // Get the QR code
    const qrCode = await this.getQrCodeByCodeId(qrCodeId);
    if (!qrCode || qrCode.isAssigned) {
      return undefined;
    }

    // Get the item
    const item = await this.getItem(itemId);
    if (!item) {
      return undefined;
    }

    // Update the QR code
    const updatedQrCode = await this.updateQrCode(qrCode.id, {
      isAssigned: true,
      assignedToItemId: itemId,
      dateAssigned: new Date(),
    });

    // Update the item with the QR code
    await this.updateItem(itemId, { qrCode: qrCodeId });

    // Log activity
    await this.createActivity({
      itemId,
      activityType: "qrAssociated",
      description: `Associated QR code "${qrCodeId}" with item "${item.name}"`,
      metadata: { qrCodeId, itemId: item.itemId },
    });

    return updatedQrCode;
  }

  // User management methods
  async getUsers(): Promise<User[]> {
    const { dbSelect } = await import("./drizzleHelpers");
    return await dbSelect<User>(
      users,
      undefined,
      ["lastLogin", "createdAt"], // campi data
      ["isActive"], // campi booleani
      ["preferences"], // campi JSON
    );
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const { dbSelectById } = await import("./drizzleHelpers");
      return await dbSelectById<User>(
        users,
        users.id,
        id,
        ["createdAt"], // rimuoviamo lastLogin dai campi data
        ["isActive"], // campi booleani
        ["preferences"], // campi JSON
      );
    } catch (error) {
      console.error("Error in getUser:", error);
      // Utilizzo una query fallback più robusta
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user as User | undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const { convertFromDb } = await import("./dbUtils");
      const [userRecord] = await db
        .select()
        .from(users)
        .where(eq(users.username, username));

      if (!userRecord) return undefined;

      // Converti i campi nel formato corretto, ma rimuoviamo lastLogin
      return convertFromDb(
        userRecord,
        ["createdAt"], // rimuoviamo lastLogin dai campi data
        ["isActive"], // campi booleani
        ["preferences"], // campi JSON
      );
    } catch (error) {
      console.error("Error in getUserByUsername:", error);
      // Non propagare l'errore per permettere il login
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    // Debug dell'oggetto user prima di salvarlo
    console.log("Creating user with data:", JSON.stringify(user));

    try {
      const { jsonToDb, booleanToDb } = await import("./dbUtils");

      // Prepara i dati per SQLite
      const preferences = jsonToDb(user.preferences);
      const isActive = booleanToDb(
        user.isActive === undefined ? true : user.isActive,
      );

      // Inserimento con metodo raw SQL per evitare problemi di binding
      const result = sqlite
        .prepare(
          `
        INSERT INTO users (
          username, password, email, full_name, role, is_active, preferences
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        )
        .run(
          user.username,
          user.password,
          user.email || null,
          user.fullName || null,
          user.role || "staff",
          isActive,
          preferences,
        );

      // Recupera l'utente appena creato
      const id = result.lastInsertRowid;
      console.log("User created with ID:", id);
      const newUser = await this.getUser(Number(id));

      return newUser!;
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  }

  async updateUser(
    id: number,
    user: Partial<InsertUser>,
  ): Promise<User | undefined> {
    try {
      const { dbUpdate } = await import("./drizzleHelpers");
      // Aggiorna l'utente con i dati convertiti correttamente
      return await dbUpdate<User>(users, users.id, id, user, true);
    } catch (error) {
      console.error("Error in updateUser:", error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const { dbDelete } = await import("./drizzleHelpers");
      // Elimina l'utente con ID
      return await dbDelete(users, users.id, id);
    } catch (error) {
      console.error("Error in deleteUser:", error);
      throw error;
    }
  }

  async resetPassword(
    id: number,
    newPassword: string,
  ): Promise<User | undefined> {
    return this.updateUser(id, { password: newPassword });
  }

  async updateLastLogin(id: number): Promise<User | undefined> {
    try {
      // Prima controlla se l'utente esiste
      const user = await this.getUser(id);
      if (!user) {
        return undefined;
      }

      // Non aggiornare lastLogin se la colonna non esiste nel database
      // Questo rimuove temporaneamente l'aggiornamento ma permette il login
      return user;
    } catch (error) {
      console.error("Error in updateLastLogin:", error);
      // Non propagare l'errore per permettere il login comunque
      return undefined;
    }
  }

  async changePassword(
    id: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    const user = await this.getUser(id);
    if (!user) return false;

    // In an actual implementation, you would compare the hashed passwords here
    // This is a placeholder and should be replaced with proper password comparison
    if (user.password !== currentPassword) {
      return false;
    }

    const updated = await this.updateUser(id, { password: newPassword });
    return !!updated;
  }
}

// Use the database storage implementation
let storage: IStorage = new DatabaseStorage();

export { storage };
