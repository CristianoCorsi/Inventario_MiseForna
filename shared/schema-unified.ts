import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { sqliteTable, integer, text, blob } from "drizzle-orm/sqlite-core";

// Funzione per ottenere la data corrente in formato ISO string
const nowFn = () => sql`CURRENT_TIMESTAMP`;

// Main inventory items table
export const items = sqliteTable("items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemId: text("item_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  location: text("location"),
  photoUrl: text("photo_url"),
  origin: text("origin").default("purchased"),
  donorName: text("donor_name"),
  dateAdded: text("date_added").default(nowFn),
  qrCode: text("qr_code"),
  barcode: text("barcode"),
  status: text("status").default("available"),
});

// Storage locations table
export const locations = sqliteTable("locations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  description: text("description"),
});

// Loans tracking table
export const loans = sqliteTable("loans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemId: integer("item_id").notNull(),
  borrowerName: text("borrower_name").notNull(),
  borrowerEmail: text("borrower_email"),
  borrowerPhone: text("borrower_phone"),
  loanDate: text("loan_date").default(nowFn),
  dueDate: text("due_date").notNull(),
  returnDate: text("return_date"),
  status: text("status").default("active"),
  notes: text("notes"),
});

// Activity logs table
export const activities = sqliteTable("activities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemId: integer("item_id"),
  description: text("description").notNull(),
  activityType: text("activity_type").notNull(),
  timestamp: text("timestamp").default(nowFn),
  metadata: text("metadata"), // JSON stringified
});

// Application settings table
export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

// QR codes table
export const qrCodes = sqliteTable("qr_codes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  qrCodeId: text("qr_code_id").notNull().unique(),
  description: text("description"),
  dateGenerated: text("date_generated").default(nowFn),
  isAssigned: integer("is_assigned", { mode: "boolean" }).default(false),
  assignedToItemId: integer("assigned_to_item_id"),
  dateAssigned: text("date_assigned"),
});

// Users for authentication
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  fullName: text("full_name"),
  role: text("role").default("staff").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  lastLogin: text("last_login"),
  createdAt: text("created_at").default(nowFn),
  profilePicture: text("profile_picture"),
  preferences: text("preferences").default("{}"), // JSON stringified
});

// User sessions for authentication
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull(),
  expiresAt: text("expires_at").notNull(),
  data: text("data")
});

// Schema per validazione con Zod
export const insertItemSchema = createInsertSchema(items).omit({ id: true });
export const insertLocationSchema = createInsertSchema(locations).omit({ id: true });
export const insertLoanSchema = createInsertSchema(loans).omit({ id: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true });
export const insertSettingSchema = createInsertSchema(settings).omit({ id: true });
export const insertQrCodeSchema = createInsertSchema(qrCodes).omit({ id: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, lastLogin: true });
export const insertSessionSchema = createInsertSchema(sessions);

// Tipi per TypeScript
export type Item = typeof items.$inferSelect;
export type Location = typeof locations.$inferSelect;
export type Loan = typeof loans.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type QrCode = typeof qrCodes.$inferSelect;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;

export type InsertItem = z.infer<typeof insertItemSchema>;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type InsertQrCode = z.infer<typeof insertQrCodeSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;

// Schema per validazione form
export const itemFormSchema = insertItemSchema.extend({
  itemId: z.string().optional().transform(val => val || `ITEM-${Math.floor(Math.random() * 10000)}`),
});

export const loanFormSchema = insertLoanSchema.extend({
  dueDate: z.coerce.date(),
});

export const qrCodeFormSchema = insertQrCodeSchema.extend({
  qrCodeId: z.string().optional().transform(val => val || `QR-${Math.floor(Math.random() * 10000)}`),
});

// Schema per autenticazione
export const loginSchema = z.object({
  username: z.string().min(1, "Username è obbligatorio"),
  password: z.string().min(1, "Password è obbligatoria"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username deve essere almeno 3 caratteri"),
  password: z.string().min(6, "Password deve essere almeno 6 caratteri"),
  email: z.string().email("Email non valida").optional().or(z.literal("")),
  fullName: z.string().optional().or(z.literal("")),
  role: z.string().default("staff"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password attuale è obbligatoria"),
  newPassword: z.string().min(6, "Nuova password deve essere almeno 6 caratteri"),
  confirmPassword: z.string().min(6, "Conferma password è obbligatoria")
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Le password non corrispondono",
  path: ["confirmPassword"]
});

export const userProfileSchema = insertUserSchema
  .pick({ email: true, fullName: true })
  .extend({ 
    preferences: z.any().optional() 
  });

// Tipi per form autenticazione
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type UserProfileData = z.infer<typeof userProfileSchema>;