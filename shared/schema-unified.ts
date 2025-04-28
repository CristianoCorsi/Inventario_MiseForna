import { relations, sql } from "drizzle-orm";
import { 
  sqliteTable, text, integer, blob, 
  primaryKey 
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Conversione delle date per compatibilità tra i database
const getNow = () => sql`CURRENT_TIMESTAMP`;

// Schema utenti
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  fullName: text("full_name"),
  role: text("role").notNull().default("viewer"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  lastLogin: text("last_login"),
  createdAt: text("created_at").default(getNow),
  profilePicture: text("profile_picture"),
  preferences: text("preferences")
});

export const usersRelations = relations(users, ({ many }) => ({
  loans: many(loans)
}));

// Schema delle posizioni (magazzini, scaffali, ecc.)
export const locations = sqliteTable("locations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description")
});

export const locationsRelations = relations(locations, ({ many }) => ({
  items: many(items)
}));

// Schema degli elementi inventario
export const items = sqliteTable("items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemId: text("item_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  location: text("location"),
  photoUrl: text("photo_url"),
  origin: text("origin"),
  donorName: text("donor_name"),
  dateAdded: text("date_added").default(getNow),
  qrCode: text("qr_code"),
  barcode: text("barcode"),
  status: text("status").default("available"),
  category: text("category"),
  value: text("value")
});

export const itemsRelations = relations(items, ({ many, one }) => ({
  loans: many(loans),
  activities: many(activities),
  location: one(locations, {
    fields: [items.location],
    references: [locations.name]
  }),
  qrCodes: many(qrCodes)
}));

// Schema dei prestiti
export const loans = sqliteTable("loans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemId: integer("item_id").notNull(),
  status: text("status").default("active"),
  borrowerName: text("borrower_name").notNull(),
  borrowerEmail: text("borrower_email"),
  borrowerPhone: text("borrower_phone"),
  loanDate: text("loan_date").default(getNow),
  dueDate: text("due_date").notNull(),
  returnDate: text("return_date"),
  notes: text("notes")
});

export const loansRelations = relations(loans, ({ one }) => ({
  item: one(items, {
    fields: [loans.itemId],
    references: [items.id]
  }),
  user: one(users, {
    fields: [loans.borrowerName],
    references: [users.username]
  })
}));

// Schema delle attività per il log
export const activities = sqliteTable("activities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  timestamp: text("timestamp").default(getNow),
  itemId: integer("item_id"),
  description: text("description").notNull(),
  activityType: text("activity_type").notNull(),
  metadata: text("metadata")
});

export const activitiesRelations = relations(activities, ({ one }) => ({
  item: one(items, {
    fields: [activities.itemId],
    references: [items.id]
  })
}));

// Schema dei QR code
export const qrCodes = sqliteTable("qr_codes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  description: text("description"),
  qrCodeId: text("qr_code_id").notNull().unique(),
  dateGenerated: text("date_generated").default(getNow),
  isAssigned: integer("is_assigned", { mode: "boolean" }).default(false),
  assignedToItemId: integer("assigned_to_item_id"),
  dateAssigned: text("date_assigned")
});

export const qrCodesRelations = relations(qrCodes, ({ one }) => ({
  item: one(items, {
    fields: [qrCodes.assignedToItemId],
    references: [items.id]
  })
}));

// Schema delle impostazioni
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull()
});

// Creazione degli schemi Zod per le operazioni di inserimento
export const insertUserSchema = createInsertSchema(users);
export const insertItemSchema = createInsertSchema(items);
export const insertLocationSchema = createInsertSchema(locations);
export const insertLoanSchema = createInsertSchema(loans);
export const insertActivitySchema = createInsertSchema(activities);
export const insertQrCodeSchema = createInsertSchema(qrCodes);
export const insertSettingSchema = createInsertSchema(settings);

// Definizione delle inferenze di tipo
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;

export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export type Loan = typeof loans.$inferSelect;
export type InsertLoan = z.infer<typeof insertLoanSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type QrCode = typeof qrCodes.$inferSelect;
export type InsertQrCode = z.infer<typeof insertQrCodeSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

// Schemi di validazione per i form
export const itemFormSchema = insertItemSchema.extend({});
export const loanFormSchema = insertLoanSchema.extend({});
export const qrCodeFormSchema = insertQrCodeSchema.extend({});
export const userFormSchema = insertUserSchema.extend({
  confirmPassword: z.string().optional(),
}).omit({ id: true, lastLogin: true, createdAt: true });