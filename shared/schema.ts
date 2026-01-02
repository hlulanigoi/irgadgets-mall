import { pgTable, text, serial, integer, boolean, timestamp, varchar, decimal, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

export const shopCategoryEnum = pgEnum("shop_category", ["tailor", "laundry", "retail", "service"]);
export const taskStatusEnum = pgEnum("task_status", ["open", "in_progress", "completed"]);

export const shops = pgTable("shops", {
  id: serial("id").primaryKey(),
  ownerId: varchar("owner_id").notNull(), // References users.id (which is varchar from auth schema)
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: shopCategoryEnum("category").notNull(),
  imageUrl: text("image_url").notNull(),
  location: text("location").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  shopId: integer("shop_id").notNull().references(() => shops.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url").notNull(),
  inStock: boolean("in_stock").default(true),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  creatorId: varchar("creator_id").notNull(), // References users.id
  title: text("title").notNull(),
  description: text("description").notNull(),
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
  status: taskStatusEnum("status").default("open"),
  assigneeId: varchar("assignee_id"), // References users.id
  location: text("location").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const shopsRelations = relations(shops, ({ one, many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  shop: one(shops, {
    fields: [products.shopId],
    references: [shops.id],
  }),
}));

// Schemas
export const insertShopSchema = createInsertSchema(shops).omit({ id: true, createdAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true, status: true, assigneeId: true });

// Types
export type Shop = typeof shops.$inferSelect;
export type InsertShop = z.infer<typeof insertShopSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type CreateShopRequest = InsertShop;
export type CreateProductRequest = InsertProduct;
export type CreateTaskRequest = InsertTask;
export type UpdateTaskStatusRequest = { status: "open" | "in_progress" | "completed"; assigneeId?: string };
