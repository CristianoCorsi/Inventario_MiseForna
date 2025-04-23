import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
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

// Insert schemas
export const insertItemSchema = createInsertSchema(items).omit({ id: true });
export const insertLocationSchema = createInsertSchema(locations).omit({ id: true });
export const insertLoanSchema = createInsertSchema(loans).omit({ id: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true });
export const insertSettingSchema = createInsertSchema(settings).omit({ id: true });

// Select types
export type Item = typeof items.$inferSelect;
export type Location = typeof locations.$inferSelect;
export type Loan = typeof loans.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Setting = typeof settings.$inferSelect;

// Insert types
export type InsertItem = z.infer<typeof insertItemSchema>;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

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
