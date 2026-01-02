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
  updateShop(id: number, updates: Partial<InsertShop>): Promise<Shop | undefined>;
  updateShopStatus(id: number, status: "active" | "suspended"): Promise<Shop | undefined>;
  getShopsByOwner(ownerId: string): Promise<Shop[]>;
  
  // Products
  getProductsByShop(shopId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
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
  getAllOrders(): Promise<Order[]>;
  
  // Admin & Users
  getAllUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | undefined>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  getAdminStats(): Promise<any>;
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

  async updateShop(id: number, updates: Partial<InsertShop>): Promise<Shop | undefined> {
    const [shop] = await db.update(shops).set(updates).where(eq(shops.id, id)).returning();
    return shop;
  }

  async updateShopStatus(id: number, status: "active" | "suspended"): Promise<Shop | undefined> {
    const [shop] = await db.update(shops).set({ status }).where(eq(shops.id, id)).returning();
    return shop;
  }

  async getShopsByOwner(ownerId: string): Promise<Shop[]> {
    return await db.select().from(shops).where(eq(shops.ownerId, ownerId));
  }

  // Products
  async getProductsByShop(shopId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.shopId, shopId));
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    return product;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return true;
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

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  // Admin & Users
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const [user] = await db.update(users).set({ role }).where(eq(users.id, id)).returning();
    return user;
  }

  async getAdminStats(): Promise<any> {
    const allShops = await db.select().from(shops);
    const allUsers = await db.select().from(users);
    const allOrders = await db.select().from(orders);
    const allTasks = await db.select().from(tasks);

    return {
      totalShops: allShops.length,
      activeShops: allShops.filter(s => s.status === 'active').length,
      totalUsers: allUsers.length,
      totalOrders: allOrders.length,
      totalTasks: allTasks.length,
      recentOrders: allOrders.slice(-10).reverse(),
    };
  }
}

export const storage = new DatabaseStorage();
