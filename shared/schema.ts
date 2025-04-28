import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Main inventory items table
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  itemId: text("item_id").notNull().unique(), // Custom item ID (e.g., TOOL-1234)
  name: text("name").notNull(),
  description: text("description"),
  location: text("location"),
  photoUrl: text("photo_url"),
  origin: text("origin").default("purchased"), // purchased, donated, other
  donorName: text("donor_name"),
  dateAdded: timestamp("date_added").defaultNow(),
  qrCode: text("qr_code"),
  barcode: text("barcode"),
  status: text("status").default("available"), // available, loaned, maintenance
});

// Storage locations table
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

// Loans tracking table
export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(), // References items.id
  borrowerName: text("borrower_name").notNull(),
  borrowerEmail: text("borrower_email"),
  borrowerPhone: text("borrower_phone"),
  loanDate: timestamp("loan_date").defaultNow(),
  dueDate: timestamp("due_date").notNull(),
  returnDate: timestamp("return_date"),
  notes: text("notes"),
  status: text("status").default("active"), // active, returned, overdue
});

// Activity log table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id"), // References items.id
  activityType: text("activity_type").notNull(), // new, loan, return, edit, delete
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata"),
});

// Settings table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
});

// Unassigned QR codes table
export const qrCodes = pgTable("qr_codes", {
  id: serial("id").primaryKey(),
  qrCodeId: text("qr_code_id").notNull().unique(), // The generated unique ID
  description: text("description"),
  dateGenerated: timestamp("date_generated").defaultNow(),
  isAssigned: boolean("is_assigned").default(false),
  assignedToItemId: integer("assigned_to_item_id"), // References items.id when assigned
  dateAssigned: timestamp("date_assigned"),
});

// Users for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: text("password").notNull(),
  email: varchar("email", { length: 255 }),
  fullName: varchar("full_name", { length: 255 }),
  role: text("role").default("staff").notNull(), // admin, staff, viewer
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  profilePicture: text("profile_picture"),
  preferences: jsonb("preferences").default({})
});

// User sessions for authentication
export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: integer("user_id").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  data: jsonb("data").default({}),
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
