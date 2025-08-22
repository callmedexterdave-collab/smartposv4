import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username"),
  email: text("email"),
  mobile: text("mobile"),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'admin' or 'staff'
  staffId: text("staff_id"), // For staff members
  businessName: text("business_name"),
  ownerName: text("owner_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products table for inventory
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  barcode: text("barcode").notNull(),
  price: real("price").notNull(),
  quantity: integer("quantity").notNull().default(0),
  category: text("category").default("general"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sales table for transactions
export const sales = pgTable("sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  total: real("total").notNull(),
  paymentType: text("payment_type").notNull(), // 'cash' or 'ewallet'
  paymentAmount: real("payment_amount").notNull(),
  staffId: text("staff_id"),
  items: text("items").notNull(), // JSON string of cart items
  createdAt: timestamp("created_at").defaultNow(),
});

// Staff table for management
export const staff = pgTable("staff", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  staffId: text("staff_id").notNull().unique(),
  passkey: text("passkey").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  mobile: true,
  password: true,
  role: true,
  staffId: true,
  businessName: true,
  ownerName: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  barcode: true,
  price: true,
  quantity: true,
  category: true,
});

export const insertSaleSchema = createInsertSchema(sales).pick({
  total: true,
  paymentType: true,
  paymentAmount: true,
  staffId: true,
  items: true,
});

export const insertStaffSchema = createInsertSchema(staff).pick({
  name: true,
  staffId: true,
  passkey: true,
  createdBy: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof sales.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Staff = typeof staff.$inferSelect;

// Cart item type for sales
export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
};
