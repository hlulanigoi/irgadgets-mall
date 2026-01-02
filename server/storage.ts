import { 
  users, shops, products, tasks, orders,
  type User,
  type Shop, type InsertShop,
  type Product, type InsertProduct,
  type Task, type InsertTask,
  type Order, type InsertOrder
} from "@shared/schema";
import { db } from "./db";
import { eq, or } from "drizzle-orm";

export interface IStorage {
  // Shops
  getShops(category?: "tailor" | "laundry" | "retail" | "service"): Promise<Shop[]>;
  getShop(id: number): Promise<Shop | undefined>;
  createShop(shop: InsertShop): Promise<Shop>;
  
  // Products
  getProductsByShop(shopId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Tasks
  getTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTaskStatus(id: number, status: "open" | "in_progress" | "completed", assigneeId?: string): Promise<Task | undefined>;

  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  getOrdersByShop(shopId: number): Promise<Order[]>;
  getPendingTransportOrders(): Promise<Order[]>;
  updateOrderStatus(id: number, status: string, transportId?: string): Promise<Order | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Shops
  async getShops(category?: "tailor" | "laundry" | "retail" | "service"): Promise<Shop[]> {
    if (category) {
      return await db.select().from(shops).where(eq(shops.category, category));
    }
    return await db.select().from(shops);
  }

  async getShop(id: number): Promise<Shop | undefined> {
    const [shop] = await db.select().from(shops).where(eq(shops.id, id));
    return shop;
  }

  async createShop(insertShop: InsertShop): Promise<Shop> {
    const [shop] = await db.insert(shops).values(insertShop).returning();
    return shop;
  }

  // Products
  async getProductsByShop(shopId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.shopId, shopId));
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }

  async updateTaskStatus(id: number, status: "open" | "in_progress" | "completed", assigneeId?: string): Promise<Task | undefined> {
    const updateData: any = { status };
    if (assigneeId) updateData.assigneeId = assigneeId;
    
    const [task] = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  // Orders
  async getOrdersByShop(shopId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.shopId, shopId));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.customerId, userId));
  }

  async getOrdersByShop(shopId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.shopId, shopId));
  }

  async getPendingTransportOrders(): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.status, "transport_requested"));
  }

  async updateOrderStatus(id: number, status: string, transportId?: string): Promise<Order | undefined> {
    const updateData: any = { status };
    if (transportId) updateData.transportId = transportId;
    const [order] = await db.update(orders).set(updateData).where(eq(orders.id, id)).returning();
    return order;
  }
}

export const storage = new DatabaseStorage();
