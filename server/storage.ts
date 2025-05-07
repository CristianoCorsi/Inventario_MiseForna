import * as schema from "@shared/schema";
import { db } from "./db";
import { eq, and, or, isNull, desc, asc, lt } from "drizzle-orm";

export class DatabaseStorage {
  // Items
  async getItems(): Promise<schema.Item[]> {
    return await db.select().from(schema.items).all();
  }
  async getItem(id: number): Promise<schema.Item | undefined> {
    const [item] = await db
      .select()
      .from(schema.items)
      .where(eq(schema.items.id, id))
      .all();
    return item;
  }
  async getItemByItemId(itemId: string): Promise<schema.Item | undefined> {
    const [item] = await db
      .select()
      .from(schema.items)
      .where(eq(schema.items.itemId, itemId))
      .all();
    return item;
  }
  async createItem(item: schema.InsertItem): Promise<schema.Item> {
    const [newItem] = await db.insert(schema.items).values(item).returning();
    return newItem;
  }
  async updateItem(
    id: number,
    item: Partial<schema.InsertItem>
  ): Promise<schema.Item | undefined> {
    const [updatedItem] = await db
      .update(schema.items)
      .set(item)
      .where(eq(schema.items.id, id))
      .returning();
    return updatedItem;
  }
  async deleteItem(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(schema.items)
      .where(eq(schema.items.id, id))
      .returning();
    return !!deleted;
  }

  // Locations
  async getLocations(): Promise<schema.Location[]> {
    return await db.select().from(schema.locations).all();
  }
  async getLocation(id: number): Promise<schema.Location | undefined> {
    const [location] = await db
      .select()
      .from(schema.locations)
      .where(eq(schema.locations.id, id))
      .all();
    return location;
  }
  async createLocation(
    location: schema.InsertLocation
  ): Promise<schema.Location> {
    const [newLocation] = await db
      .insert(schema.locations)
      .values(location)
      .returning();
    return newLocation;
  }
  async updateLocation(
    id: number,
    location: Partial<schema.InsertLocation>
  ): Promise<schema.Location | undefined> {
    const [updatedLocation] = await db
      .update(schema.locations)
      .set(location)
      .where(eq(schema.locations.id, id))
      .returning();
    return updatedLocation;
  }
  async deleteLocation(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(schema.locations)
      .where(eq(schema.locations.id, id))
      .returning();
    return !!deleted;
  }

  // Loans
  async getLoans(): Promise<schema.Loan[]> {
    return await db.select().from(schema.loans).all();
  }
  async getLoan(id: number): Promise<schema.Loan | undefined> {
    const [loan] = await db
      .select()
      .from(schema.loans)
      .where(eq(schema.loans.id, id))
      .all();
    return loan;
  }
  async getLoansByItemId(itemId: number): Promise<schema.Loan[]> {
    return await db
      .select()
      .from(schema.loans)
      .where(eq(schema.loans.itemId, itemId))
      .all();
  }
  async getOverdueLoans(): Promise<schema.Loan[]> {
    const nowISO = new Date().toISOString(); // Ottieni la stringa ISO ora
    return await db
      .select()
      .from(schema.loans)
      .where(
        and(
          eq(schema.loans.status, "active"),
          // Confronta la colonna TEXT con una STRINGA ISO
          lt(schema.loans.dueDate, nowISO)
        )
      )
      .all();
  }
  async getActiveLoans(): Promise<schema.Loan[]> {
    return await db
      .select()
      .from(schema.loans)
      .where(
        or(
          eq(schema.loans.status, "active"),
          eq(schema.loans.status, "overdue")
        )
      )
      .all();
  }
  async createLoan(loan: schema.InsertLoan): Promise<schema.Loan> {
    const [newLoan] = await db.insert(schema.loans).values(loan).returning();
    await db
      .update(schema.items)
      .set({ status: "loaned" })
      .where(eq(schema.items.id, loan.itemId));
    return newLoan;
  }
  async updateLoan(
    id: number,
    loan: Partial<schema.InsertLoan>
  ): Promise<schema.Loan | undefined> {
    const [updatedLoan] = await db
      .update(schema.loans)
      .set(loan)
      .where(eq(schema.loans.id, id))
      .returning();
    return updatedLoan;
  }
  async returnLoan(
    id: number,
    returnDate: Date = new Date()
  ): Promise<schema.Loan | undefined> {
    const loan = await this.getLoan(id);
    if (!loan) return undefined;
    const [updatedLoan] = await db
      .update(schema.loans)
      .set({ returnDate, status: "returned" })
      .where(eq(schema.loans.id, id))
      .returning();
    await db
      .update(schema.items)
      .set({ status: "available" })
      .where(eq(schema.items.id, loan.itemId));
    return updatedLoan;
  }
  async deleteLoan(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(schema.loans)
      .where(eq(schema.loans.id, id))
      .returning();
    return !!deleted;
  }

  // Activities
  async getActivities(limit?: number): Promise<schema.Activity[]> {
    let q = db
      .select()
      .from(schema.activities)
      .orderBy(desc(schema.activities.timestamp));
    if (limit) q = q.limit(limit);
    return await q.all();
  }
  async getActivitiesByItemId(itemId: number): Promise<schema.Activity[]> {
    return await db
      .select()
      .from(schema.activities)
      .where(eq(schema.activities.itemId, itemId))
      .orderBy(desc(schema.activities.timestamp))
      .all();
  }
  async createActivity(
    activity: schema.InsertActivity
  ): Promise<schema.Activity> {
    const [newActivity] = await db
      .insert(schema.activities)
      .values(activity)
      .returning();
    return newActivity;
  }

  // Settings
  async getSetting(key: string): Promise<schema.Setting | undefined> {
    const [setting] = await db
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, key))
      .all();
    return setting;
  }
  async updateSetting(key: string, value: string): Promise<schema.Setting> {
    const [existing] = await db
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, key))
      .all();
    if (existing) {
      const [updated] = await db
        .update(schema.settings)
        .set({ value })
        .where(eq(schema.settings.key, key))
        .returning();
      return updated;
    } else {
      const [newSetting] = await db
        .insert(schema.settings)
        .values({ key, value })
        .returning();
      return newSetting;
    }
  }

  // QR Codes
  async getQrCodes(): Promise<schema.QrCode[]> {
    return await db.select().from(schema.qrCodes).all();
  }
  async getQrCode(id: number): Promise<schema.QrCode | undefined> {
    const [qrCode] = await db
      .select()
      .from(schema.qrCodes)
      .where(eq(schema.qrCodes.id, id))
      .all();
    return qrCode;
  }
  async getQrCodeByCodeId(
    qrCodeId: string
  ): Promise<schema.QrCode | undefined> {
    const [qrCode] = await db
      .select()
      .from(schema.qrCodes)
      .where(eq(schema.qrCodes.qrCodeId, qrCodeId))
      .all();
    return qrCode;
  }
  async createQrCode(qrCode: schema.InsertQrCode): Promise<schema.QrCode> {
    const [newQrCode] = await db
      .insert(schema.qrCodes)
      .values(qrCode)
      .returning();
    return newQrCode;
  }
  async updateQrCode(
    id: number,
    qrCode: Partial<schema.InsertQrCode>
  ): Promise<schema.QrCode | undefined> {
    const [updatedQrCode] = await db
      .update(schema.qrCodes)
      .set(qrCode)
      .where(eq(schema.qrCodes.id, id))
      .returning();
    return updatedQrCode;
  }
  async deleteQrCode(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(schema.qrCodes)
      .where(eq(schema.qrCodes.id, id))
      .returning();
    return !!deleted;
  }
  async getUnassignedQrCodes(): Promise<schema.QrCode[]> {
    return await db
      .select()
      .from(schema.qrCodes)
      .where(eq(schema.qrCodes.isAssigned, false))
      .all();
  }
  async associateQrCodeWithItem(
    qrCodeId: string,
    itemId: number
  ): Promise<schema.QrCode | undefined> {
    const [qrCode] = await db
      .select()
      .from(schema.qrCodes)
      .where(eq(schema.qrCodes.qrCodeId, qrCodeId))
      .all();
    if (!qrCode || qrCode.isAssigned) return undefined;
    const [item] = await db
      .select()
      .from(schema.items)
      .where(eq(schema.items.id, itemId))
      .all();
    if (!item) return undefined;
    const [updated] = await db
      .update(schema.qrCodes)
      .set({
        isAssigned: true,
        assignedToItemId: itemId,
        dateAssigned: new Date(),
      })
      .where(eq(schema.qrCodes.id, qrCode.id))
      .returning();
    await db
      .update(schema.items)
      .set({ qrCode: qrCode.qrCodeId })
      .where(eq(schema.items.id, itemId));
    await this.createActivity({
      itemId,
      activityType: "qrAssociated",
      description: `Associated QR code "${qrCodeId}" with item "${item.name}"`,
      metadata: { qrCodeId, itemId: item.itemId },
    });
    return updated;
  }

  // Users
  async getUsers(): Promise<schema.User[]> {
    return await db.select().from(schema.users).all();
  }
  async getUser(id: number): Promise<schema.User | undefined> {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .all();
    return user;
  }
  async getUserByUsername(username: string): Promise<schema.User | undefined> {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .all();
    return user;
  }
  async createUser(user: schema.InsertUser): Promise<schema.User> {
    const [newUser] = await db.insert(schema.users).values(user).returning();
    return newUser;
  }
  async updateUser(
    id: number,
    user: Partial<schema.InsertUser>
  ): Promise<schema.User | undefined> {
    const [updatedUser] = await db
      .update(schema.users)
      .set(user)
      .where(eq(schema.users.id, id))
      .returning();
    return updatedUser;
  }
  async deleteUser(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(schema.users)
      .where(eq(schema.users.id, id))
      .returning();
    return !!deleted;
  }
  async resetPassword(
    id: number,
    newPassword: string
  ): Promise<schema.User | undefined> {
    const [updated] = await db
      .update(schema.users)
      .set({ password: newPassword })
      .where(eq(schema.users.id, id))
      .returning();
    return updated;
  }
  async updateLastLogin(id: number): Promise<schema.User | undefined> {
    return await this.getUser(id);
  }
  async changePassword(
    id: number,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    const user = await this.getUser(id);
    if (!user || user.password !== currentPassword) return false;
    const [updated] = await db
      .update(schema.users)
      .set({ password: newPassword })
      .where(eq(schema.users.id, id))
      .returning();
    return !!updated;
  }
}

const storage = new DatabaseStorage();
export { storage };
