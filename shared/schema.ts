import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Solo il server deve caricare dotenv, il frontend gestisce le variabili d'ambiente in modo diverso
// Verifichiamo se siamo in un ambiente browser o server
const isServer = typeof window === 'undefined';

// Carica dotenv solo sul server
if (isServer) {
  // Import dinamico per evitare problemi nel browser
  import('dotenv').then(dotenv => {
    // Carica le variabili d'ambiente se non è già stato fatto
    if (typeof process !== 'undefined' && !process.env.DB_TYPE) {
      dotenv.config();
    }
  }).catch(err => {
    console.error('Errore durante il caricamento di dotenv:', err);
  });
}

// Importa i tipi di tabelle per tutti i database supportati
import {
  sqliteTable, 
  text as sqliteText, 
  integer as sqliteInteger, 
  blob as sqliteBlob,
  primaryKey as sqlitePrimaryKey
} from "drizzle-orm/sqlite-core";

import {
  pgTable,
  text as pgText,
  serial as pgSerial,
  integer as pgInteger,
  boolean as pgBoolean,
  timestamp as pgTimestamp,
  jsonb as pgJsonb,
  varchar as pgVarchar,
  unique as pgUnique
} from "drizzle-orm/pg-core";

import {
  mysqlTable,
  varchar as mysqlVarchar,
  text as mysqlText,
  int as mysqlInt,
  serial as mysqlSerial,
  boolean as mysqlBoolean,
  timestamp as mysqlTimestamp,
  json as mysqlJson,
  primaryKey as mysqlPrimaryKey,
  unique as mysqlUnique
} from 'drizzle-orm/mysql-core';

// Funzione per ottenere la data corrente compatibile con tutti i database
const getNow = () => sql`CURRENT_TIMESTAMP`;

// Determina il tipo di database dal file .env o usa SQLite come default
// Utilizziamo un approccio condizionale per gestire sia l'ambiente server che quello client
const DB_TYPE = isServer ? 
  // Sul server, possiamo accedere a process.env
  (typeof process !== 'undefined' && process.env.DB_TYPE ? process.env.DB_TYPE : 'sqlite') : 
  // Sul client, usiamo sempre SQLite
  'sqlite';

// Log solo sul server
if (isServer) {
  console.log(`Schema inizializzato per database di tipo: ${DB_TYPE}`);
}

// Seleziona il tipo di tabella e colonne in base al database
let Table, TEXT, INTEGER, SERIAL, BOOLEAN, TIMESTAMP, JSON_TYPE, VARCHAR;

if (DB_TYPE === 'sqlite') {
  Table = sqliteTable;
  TEXT = sqliteText;
  INTEGER = sqliteInteger;
  SERIAL = sqliteInteger; // SQLite non ha SERIAL, usa INTEGER con AUTOINCREMENT
  BOOLEAN = (name) => sqliteInteger(name, { mode: 'boolean' });
  TIMESTAMP = sqliteText; // SQLite memorizza le date come TEXT
  JSON_TYPE = sqliteText; // SQLite memorizza JSON come TEXT
  VARCHAR = sqliteText; // SQLite non distingue tra TEXT e VARCHAR
} else if (DB_TYPE === 'mysql' || DB_TYPE === 'mssql') {
  Table = mysqlTable;
  TEXT = mysqlText;
  INTEGER = mysqlInt;
  SERIAL = mysqlSerial;
  BOOLEAN = mysqlBoolean;
  TIMESTAMP = mysqlTimestamp;
  JSON_TYPE = mysqlJson;
  VARCHAR = mysqlVarchar;
} else {
  // PostgreSQL è il default per gli altri casi
  Table = pgTable;
  TEXT = pgText;
  INTEGER = pgInteger;
  SERIAL = pgSerial;
  BOOLEAN = pgBoolean;
  TIMESTAMP = pgTimestamp;
  JSON_TYPE = pgJsonb;
  VARCHAR = pgVarchar;
}

// Main inventory items table
export const items = Table("items", {
  id: SERIAL("id").primaryKey(),
  itemId: TEXT("item_id").notNull().unique(), // Custom item ID (e.g., TOOL-1234)
  name: TEXT("name").notNull(),
  description: TEXT("description"),
  location: TEXT("location"),
  photoUrl: TEXT("photo_url"),
  origin: TEXT("origin").default("purchased"), // purchased, donated, other
  donorName: TEXT("donor_name"),
  dateAdded: TIMESTAMP("date_added").default(getNow),
  qrCode: TEXT("qr_code"),
  barcode: TEXT("barcode"),
  status: TEXT("status").default("available"), // available, loaned, maintenance
});

// Storage locations table
export const locations = Table("locations", {
  id: SERIAL("id").primaryKey(),
  name: TEXT("name").notNull().unique(),
  description: TEXT("description"),
});

// Loans tracking table
export const loans = Table("loans", {
  id: SERIAL("id").primaryKey(),
  itemId: INTEGER("item_id").notNull(), // References items.id
  borrowerName: TEXT("borrower_name").notNull(),
  borrowerEmail: TEXT("borrower_email"),
  borrowerPhone: TEXT("borrower_phone"),
  loanDate: TIMESTAMP("loan_date").default(getNow),
  dueDate: TIMESTAMP("due_date").notNull(),
  returnDate: TIMESTAMP("return_date"),
  notes: TEXT("notes"),
  status: TEXT("status").default("active"), // active, returned, overdue
});

// Activity log table
export const activities = Table("activities", {
  id: SERIAL("id").primaryKey(),
  itemId: INTEGER("item_id"), // References items.id
  activityType: TEXT("activity_type").notNull(), // new, loan, return, edit, delete
  description: TEXT("description").notNull(),
  timestamp: TIMESTAMP("timestamp").default(getNow),
  metadata: JSON_TYPE("metadata"),
});

// Settings table
export const settings = Table("settings", {
  id: SERIAL("id").primaryKey(),
  key: TEXT("key").notNull().unique(),
  value: TEXT("value"),
});

// Unassigned QR codes table
export const qrCodes = Table("qr_codes", {
  id: SERIAL("id").primaryKey(),
  qrCodeId: TEXT("qr_code_id").notNull().unique(), // The generated unique ID
  description: TEXT("description"),
  dateGenerated: TIMESTAMP("date_generated").default(getNow),
  isAssigned: BOOLEAN("is_assigned").default(false),
  assignedToItemId: INTEGER("assigned_to_item_id"), // References items.id when assigned
  dateAssigned: TIMESTAMP("date_assigned"),
});

// Users for authentication
export const users = Table("users", {
  id: SERIAL("id").primaryKey(),
  username: VARCHAR("username", { length: 100 }).notNull().unique(),
  password: TEXT("password").notNull(),
  email: VARCHAR("email", { length: 255 }),
  fullName: VARCHAR("full_name", { length: 255 }),
  role: TEXT("role").default("staff").notNull(), // admin, staff, viewer
  isActive: BOOLEAN("is_active").default(true),
  lastLogin: TIMESTAMP("last_login"),
  createdAt: TIMESTAMP("created_at").default(getNow),
  profilePicture: TEXT("profile_picture"),
  preferences: JSON_TYPE("preferences"),
});

// User sessions for authentication
export const sessions = Table("sessions", {
  sid: TEXT("sid").primaryKey(),
  sess: JSON_TYPE("sess").notNull(),
  expire: TIMESTAMP("expire").notNull(),
});

// Insert schemas
export const insertItemSchema = createInsertSchema(items).omit({ id: true });
export const insertLocationSchema = createInsertSchema(locations).omit({ id: true });
export const insertLoanSchema = createInsertSchema(loans).omit({ id: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true });
export const insertSettingSchema = createInsertSchema(settings).omit({ id: true });
export const insertQrCodeSchema = createInsertSchema(qrCodes).omit({ id: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, lastLogin: true });
export const insertSessionSchema = createInsertSchema(sessions);

// Select types
export type Item = typeof items.$inferSelect;
export type Location = typeof locations.$inferSelect;
export type Loan = typeof loans.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type QrCode = typeof qrCodes.$inferSelect;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;

// Insert types
export type InsertItem = z.infer<typeof insertItemSchema>;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type InsertQrCode = z.infer<typeof insertQrCodeSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;

// Extended schemas for forms
export const itemFormSchema = insertItemSchema.extend({
  location: z.string().min(1, "Location is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  itemId: z.string().min(3, "Item ID must be at least 3 characters"),
});

export const loanFormSchema = insertLoanSchema.extend({
  borrowerName: z.string().min(2, "Borrower name is required"),
  borrowerEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  borrowerPhone: z.string().optional().or(z.literal("")),
  dueDate: z.date({ required_error: "Due date is required" }),
});

export const qrCodeFormSchema = insertQrCodeSchema.extend({
  qrCodeId: z.string().min(3, "QR Code ID must be at least 3 characters"),
  description: z.string().optional().or(z.literal("")),
});

// Auth schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  fullName: z.string().optional().or(z.literal("")),
  role: z.enum(["admin", "staff", "viewer"]).default("staff")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "New password must be at least 6 characters")
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export const userProfileSchema = insertUserSchema
  .omit({ password: true, role: true, isActive: true })
  .extend({
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    fullName: z.string().optional().or(z.literal("")),
  });

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type UserProfileData = z.infer<typeof userProfileSchema>;
