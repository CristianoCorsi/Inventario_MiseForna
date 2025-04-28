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

import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  sessionStore: session.Store;

  private items: Map<number, Item>;
  private locations: Map<number, Location>;
  private loans: Map<number, Loan>;
  private activities: Map<number, Activity>;
  private settings: Map<string, Setting>;
  private qrCodes: Map<number, QrCode>;
  private users: Map<number, User>;

  private itemCurrentId: number;
  private locationCurrentId: number;
  private loanCurrentId: number;
  private activityCurrentId: number;
  private settingCurrentId: number;
  private qrCodeCurrentId: number;
  private userCurrentId: number;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });

    this.items = new Map();
    this.locations = new Map();
    this.loans = new Map();
    this.activities = new Map();
    this.settings = new Map();
    this.qrCodes = new Map();
    this.users = new Map();

    this.itemCurrentId = 1;
    this.locationCurrentId = 1;
    this.loanCurrentId = 1;
    this.activityCurrentId = 1;
    this.settingCurrentId = 1;
    this.qrCodeCurrentId = 1;
    this.userCurrentId = 1;

    // Initialize with default locations
    this.createLocation({
      name: "Storage A",
      description: "Main storage area",
    });
    this.createLocation({
      name: "Storage B",
      description: "Secondary storage",
    });
    this.createLocation({
      name: "Medical Cabinet",
      description: "For medical supplies",
    });
    this.createLocation({
      name: "Workshop",
      description: "Tools and equipment",
    });
    this.createLocation({ name: "Office", description: "Office supplies" });

    // Sample items and other data can be initialized here
  }

  // Item methods
  async getItems(): Promise<Item[]> {
    return Array.from(this.items.values());
  }

  async getItem(id: number): Promise<Item | undefined> {
    return this.items.get(id);
  }

  async getItemByItemId(itemId: string): Promise<Item | undefined> {
    return Array.from(this.items.values()).find(
      (item) => item.itemId === itemId,
    );
  }

  async createItem(item: InsertItem): Promise<Item> {
    const id = this.itemCurrentId++;
    const newItem: Item = { ...item, id };
    this.items.set(id, newItem);
    return newItem;
  }

  async updateItem(
    id: number,
    item: Partial<InsertItem>,
  ): Promise<Item | undefined> {
    const existingItem = this.items.get(id);
    if (!existingItem) return undefined;

    const updatedItem = { ...existingItem, ...item };
    this.items.set(id, updatedItem);
    return updatedItem;
  }

  async deleteItem(id: number): Promise<boolean> {
    return this.items.delete(id);
  }

  // Location methods
  async getLocations(): Promise<Location[]> {
    return Array.from(this.locations.values());
  }

  async getLocation(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const id = this.locationCurrentId++;
    const newLocation: Location = { ...location, id };
    this.locations.set(id, newLocation);
    return newLocation;
  }

  async updateLocation(
    id: number,
    location: Partial<InsertLocation>,
  ): Promise<Location | undefined> {
    const existingLocation = this.locations.get(id);
    if (!existingLocation) return undefined;

    const updatedLocation = { ...existingLocation, ...location };
    this.locations.set(id, updatedLocation);
    return updatedLocation;
  }

  async deleteLocation(id: number): Promise<boolean> {
    return this.locations.delete(id);
  }

  // Loan methods
  async getLoans(): Promise<Loan[]> {
    return Array.from(this.loans.values());
  }

  async getLoan(id: number): Promise<Loan | undefined> {
    return this.loans.get(id);
  }

  async getLoansByItemId(itemId: number): Promise<Loan[]> {
    return Array.from(this.loans.values()).filter(
      (loan) => loan.itemId === itemId,
    );
  }

  async getOverdueLoans(): Promise<Loan[]> {
    const now = new Date();
    return Array.from(this.loans.values()).filter(
      (loan) => loan.status === "active" && new Date(loan.dueDate) < now,
    );
  }

  async getActiveLoans(): Promise<Loan[]> {
    return Array.from(this.loans.values()).filter(
      (loan) => loan.status === "active" || loan.status === "overdue",
    );
  }

  async createLoan(loan: InsertLoan): Promise<Loan> {
    const id = this.loanCurrentId++;
    const newLoan: Loan = { ...loan, id };
    this.loans.set(id, newLoan);

    // Update the item status to 'loaned'
    const item = await this.getItem(loan.itemId);
    if (item) {
      await this.updateItem(item.id, { status: "loaned" });
    }

    return newLoan;
  }

  async updateLoan(
    id: number,
    loan: Partial<InsertLoan>,
  ): Promise<Loan | undefined> {
    const existingLoan = this.loans.get(id);
    if (!existingLoan) return undefined;

    const updatedLoan = { ...existingLoan, ...loan };
    this.loans.set(id, updatedLoan);
    return updatedLoan;
  }

  async returnLoan(
    id: number,
    returnDate: Date = new Date(),
  ): Promise<Loan | undefined> {
    const loan = this.loans.get(id);
    if (!loan) return undefined;

    const updatedLoan = {
      ...loan,
      returnDate: returnDate,
      status: "returned",
    };
    this.loans.set(id, updatedLoan);

    // Update the item status back to 'available'
    const item = await this.getItem(loan.itemId);
    if (item) {
      await this.updateItem(item.id, { status: "available" });
    }

    return updatedLoan;
  }

  async deleteLoan(id: number): Promise<boolean> {
    return this.loans.delete(id);
  }

  // Activity methods
  async getActivities(limit?: number): Promise<Activity[]> {
    const activities = Array.from(this.activities.values()).sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return limit ? activities.slice(0, limit) : activities;
  }

  async getActivitiesByItemId(itemId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter((activity) => activity.itemId === itemId)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityCurrentId++;
    const newActivity: Activity = {
      ...activity,
      id,
      timestamp: activity.timestamp || new Date(),
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  // Settings methods
  async getSetting(key: string): Promise<Setting | undefined> {
    // Find setting by key
    for (const setting of this.settings.values()) {
      if (setting.key === key) {
        return setting;
      }
    }
    return undefined;
  }

  async updateSetting(key: string, value: string): Promise<Setting> {
    // Check if setting exists
    const existingSetting = await this.getSetting(key);

    if (existingSetting) {
      const updatedSetting = { ...existingSetting, value };
      this.settings.set(existingSetting.id, updatedSetting);
      return updatedSetting;
    } else {
      const id = this.settingCurrentId++;
      const newSetting: Setting = { id, key, value };
      this.settings.set(id, newSetting);
      return newSetting;
    }
  }

  // QR Code methods
  async getQrCodes(): Promise<QrCode[]> {
    return Array.from(this.qrCodes.values());
  }

  async getQrCode(id: number): Promise<QrCode | undefined> {
    return this.qrCodes.get(id);
  }

  async getQrCodeByCodeId(qrCodeId: string): Promise<QrCode | undefined> {
    return Array.from(this.qrCodes.values()).find(
      (qrCode) => qrCode.qrCodeId === qrCodeId,
    );
  }

  async createQrCode(qrCode: InsertQrCode): Promise<QrCode> {
    const id = this.qrCodeCurrentId++;
    const newQrCode: QrCode = {
      ...qrCode,
      id,
      dateGenerated: qrCode.dateGenerated || new Date(),
      isAssigned: qrCode.isAssigned || false,
    };
    this.qrCodes.set(id, newQrCode);
    return newQrCode;
  }

  async updateQrCode(
    id: number,
    qrCode: Partial<InsertQrCode>,
  ): Promise<QrCode | undefined> {
    const existingQrCode = this.qrCodes.get(id);
    if (!existingQrCode) return undefined;

    const updatedQrCode = { ...existingQrCode, ...qrCode };
    this.qrCodes.set(id, updatedQrCode);
    return updatedQrCode;
  }

  async deleteQrCode(id: number): Promise<boolean> {
    return this.qrCodes.delete(id);
  }

  async getUnassignedQrCodes(): Promise<QrCode[]> {
    return Array.from(this.qrCodes.values()).filter(
      (qrCode) => !qrCode.isAssigned,
    );
  }

  async associateQrCodeWithItem(
    qrCodeId: string,
    itemId: number,
  ): Promise<QrCode | undefined> {
    const qrCode = await this.getQrCodeByCodeId(qrCodeId);
    if (!qrCode || qrCode.isAssigned) {
      return undefined;
    }

    const item = await this.getItem(itemId);
    if (!item) {
      return undefined;
    }

    // Update the QR code
    qrCode.isAssigned = true;
    qrCode.assignedToItemId = itemId;
    qrCode.dateAssigned = new Date();
    this.qrCodes.set(qrCode.id, qrCode);

    // Update the item with the QR code
    await this.updateItem(itemId, { qrCode: qrCodeId });

    // Log activity
    await this.createActivity({
      itemId,
      activityType: "qrAssociated",
      description: `Associated QR code "${qrCodeId}" with item "${item.name}"`,
      metadata: { qrCodeId, itemId: item.itemId },
    });

    return qrCode;
  }

  // User management methods
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const createdAt = new Date();
    const newUser: User = {
      ...user,
      id,
      createdAt,
      lastLogin: null,
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(
    id: number,
    user: Partial<InsertUser>,
  ): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;

    const updatedUser = { ...existingUser, ...user };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async resetPassword(
    id: number,
    newPassword: string,
  ): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    user.password = newPassword;
    this.users.set(id, user);
    return user;
  }

  async updateLastLogin(id: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    user.lastLogin = new Date();
    this.users.set(id, user);
    return user;
  }

  async changePassword(
    id: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) return false;

    if (user.password !== currentPassword) {
      return false;
    }

    user.password = newPassword;
    this.users.set(id, user);
    return true;
  }
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
    return db.select().from(items);
  }

  async getItem(id: number): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item;
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
    return db.select().from(loans);
  }

  async getLoan(id: number): Promise<Loan | undefined> {
    const [loan] = await db.select().from(loans).where(eq(loans.id, id));
    return loan;
  }

  async getLoansByItemId(itemId: number): Promise<Loan[]> {
    return db.select().from(loans).where(eq(loans.itemId, itemId));
  }

  async getOverdueLoans(): Promise<Loan[]> {
    const now = new Date();
    return db
      .select()
      .from(loans)
      .where(and(eq(loans.status, "active"), lt(loans.dueDate, now)));
  }

  async getActiveLoans(): Promise<Loan[]> {
    return db
      .select()
      .from(loans)
      .where(or(eq(loans.status, "active"), eq(loans.status, "overdue")));
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
    const { dbSelect } = await import('./drizzleHelpers');
    return await dbSelect<User>(
      users, 
      undefined,
      ['lastLogin', 'createdAt'], // campi data
      ['isActive'],               // campi booleani 
      ['preferences']             // campi JSON
    );
  }

  async getUser(id: number): Promise<User | undefined> {
    const { dbSelectById } = await import('./drizzleHelpers');
    return await dbSelectById<User>(
      users, 
      users.id, 
      id,
      ['lastLogin', 'createdAt'],  // campi data
      ['isActive'],                // campi booleani
      ['preferences']              // campi JSON
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const { convertFromDb } = await import('./dbUtils');
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, username));
      
      if (!user) return undefined;
      
      // Converti i campi nel formato corretto
      return convertFromDb(
        user,
        ['lastLogin', 'createdAt'],  // campi data
        ['isActive'],                // campi booleani
        ['preferences']              // campi JSON
      );
    } catch (error) {
      console.error("Error in getUserByUsername:", error);
      throw error;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    // Debug dell'oggetto user prima di salvarlo
    console.log("Creating user with data:", JSON.stringify(user));

    try {
      const { jsonToDb, booleanToDb } = await import('./dbUtils');
      
      // Prepara i dati per SQLite
      const preferences = jsonToDb(user.preferences);
      const isActive = booleanToDb(user.isActive === undefined ? true : user.isActive);
      
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
          preferences
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
      const { dbUpdate } = await import('./drizzleHelpers');
      // Aggiorna l'utente con i dati convertiti correttamente
      return await dbUpdate<User>(
        users,
        users.id,
        id,
        user,
        true
      );
    } catch (error) {
      console.error("Error in updateUser:", error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const { dbDelete } = await import('./drizzleHelpers');
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
      const { dateToDb } = await import('./dbUtils');
      const now = new Date();
      const lastLogin = dateToDb(now);

      return await this.updateUser(id, { lastLogin });
    } catch (error) {
      console.error("Error in updateLastLogin:", error);
      throw error;
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
