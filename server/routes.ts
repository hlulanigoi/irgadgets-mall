import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { initializeFirebaseAdmin, registerFirebaseAuthRoutes, isAuthenticated, authStorage, type AuthRequest } from "./firebase";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Initialize Firebase Admin
  initializeFirebaseAdmin();
  
  // Register Firebase Auth Routes
  registerFirebaseAuthRoutes(app);

  // Shops
  app.get(api.shops.list.path, async (req, res) => {
    const category = req.query.category as any;
    const shops = await storage.getShops(category);
    res.json(shops);
  });

  app.get(api.shops.get.path, async (req, res) => {
    const shop = await storage.getShop(Number(req.params.id));
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    res.json(shop);
  });

  app.post(api.shops.create.path, isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const input = api.shops.create.input.parse(req.body);
      const shop = await storage.createShop(input);
      res.status(201).json(shop);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Products
  app.get(api.products.listByShop.path, async (req, res) => {
    const products = await storage.getProductsByShop(Number(req.params.shopId));
    res.json(products);
  });

  app.post(api.products.create.path, isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct({
        ...input,
        shopId: Number(req.params.shopId)
      });
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Tasks
  app.get(api.tasks.list.path, async (req, res) => {
    const tasks = await storage.getTasks();
    res.json(tasks);
  });

  app.post(api.tasks.create.path, isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const input = api.tasks.create.input.parse(req.body);
      const task = await storage.createTask(input);
      res.status(201).json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch(api.tasks.updateStatus.path, isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const { status } = api.tasks.updateStatus.input.parse(req.body);
      const userId = req.user!.uid;
      
      const task = await storage.updateTaskStatus(
        Number(req.params.id), 
        status,
        status === "in_progress" ? userId : undefined
      );
      
      if (!task) return res.status(404).json({ message: "Task not found" });
      res.json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Orders
  app.post("/api/orders", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.uid;
      const order = await storage.createOrder({
        ...req.body,
        customerId: userId,
        status: req.body.status || "pending"
      });
      res.status(201).json(order);
    } catch (err) {
      res.status(400).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders/my", isAuthenticated, async (req: AuthRequest, res) => {
    const userId = req.user!.uid;
    const orders = await storage.getOrdersByUser(userId);
    res.json(orders);
  });

  app.get("/api/orders/pending-transport", isAuthenticated, async (req: AuthRequest, res) => {
    const orders = await storage.getPendingTransportOrders();
    res.json(orders);
  });

  app.patch("/api/orders/:id/status", isAuthenticated, async (req: AuthRequest, res) => {
    const userId = req.user!.uid;
    const { status } = req.body;
    const order = await storage.updateOrderStatus(
      Number(req.params.id),
      status,
      status === "picked_up" ? userId : undefined
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  });

  app.get("/api/shops/:shopId/orders", isAuthenticated, async (req: AuthRequest, res) => {
    const orders = await storage.getOrdersByShop(Number(req.params.shopId));
    res.json(orders);
  });

  // Admin Routes
  const isAdmin = async (req: AuthRequest, res: any, next: any) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const userId = req.user.uid;
    const user = await storage.getUserById(userId);
    if (user?.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: "Forbidden: Admin access required" });
    }
  };

  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req: AuthRequest, res) => {
    const stats = await storage.getAdminStats();
    res.json(stats);
  });

  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: AuthRequest, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.get("/api/admin/shops", isAuthenticated, isAdmin, async (req: AuthRequest, res) => {
    const shops = await storage.getShops();
    res.json(shops);
  });

  app.patch("/api/admin/shops/:id/status", isAuthenticated, isAdmin, async (req: AuthRequest, res) => {
    const { status } = req.body;
    const shop = await storage.updateShopStatus(Number(req.params.id), status);
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    res.json(shop);
  });

  app.get("/api/admin/orders", isAuthenticated, isAdmin, async (req: AuthRequest, res) => {
    const orders = await storage.getAllOrders();
    res.json(orders);
  });

  app.patch("/api/admin/users/:id/role", isAuthenticated, isAdmin, async (req: AuthRequest, res) => {
    const { role } = req.body;
    const user = await storage.updateUserRole(req.params.id, role);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  // Shop Owner Routes
  app.get("/api/shop-owner/dashboard", isAuthenticated, async (req: AuthRequest, res) => {
    const userId = req.user!.uid;
    const shops = await storage.getShopsByOwner(userId);
    
    const shopStats = await Promise.all(shops.map(async (shop) => {
      const products = await storage.getProductsByShop(shop.id);
      const orders = await storage.getOrdersByShop(shop.id);
      return {
        shop,
        productsCount: products.length,
        ordersCount: orders.length,
        recentOrders: orders.slice(-5).reverse(),
      };
    }));
    
    res.json(shopStats);
  });

  app.patch("/api/shops/:id", isAuthenticated, async (req: AuthRequest, res) => {
    const userId = req.user!.uid;
    const shop = await storage.getShop(Number(req.params.id));
    
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    if (shop.ownerId !== userId) return res.status(403).json({ message: "Forbidden" });
    
    const updated = await storage.updateShop(Number(req.params.id), req.body);
    res.json(updated);
  });

  app.patch("/api/products/:id", isAuthenticated, async (req: AuthRequest, res) => {
    const product = await storage.updateProduct(Number(req.params.id), req.body);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.delete("/api/products/:id", isAuthenticated, async (req: AuthRequest, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.json({ success: true });
  });

  // Seed data
  if (process.env.NODE_ENV !== "production") {
    const shops = await storage.getShops();
    if (shops.length === 0) {
      const demoUser = await authStorage.upsertUser({
        id: "demo-user",
        email: "demo@example.com",
        firstName: "Demo",
        lastName: "User",
      });

      const shop1 = await storage.createShop({
        ownerId: demoUser.id,
        name: "Gogo's Sewing & Tailoring",
        description: "Expert alterations and traditional Shweshwe designs. Fast and reliable service.",
        category: "tailor",
        imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=1000",
        location: "Shop 4, Soweto Market",
      });

      const shop2 = await storage.createShop({
        ownerId: demoUser.id,
        name: "Sparkle Clean Laundry",
        description: "Wash, dry, and fold service. We pick up and deliver in the CBD area.",
        category: "laundry",
        imageUrl: "https://images.unsplash.com/photo-1545173168-9f1947eebb8f?auto=format&fit=crop&q=80&w=1000",
        location: "12 Nelson Mandela Ave, CBD",
      });

      await storage.createProduct({
        shopId: shop1.id,
        name: "Traditional Dress Alteration",
        description: "Fitting and adjustment for traditional wedding dresses.",
        price: "450.00",
        imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=1000",
        inStock: true,
      });

      await storage.createProduct({
        shopId: shop2.id,
        name: "Full Load Wash & Fold",
        description: "Up to 5kg of laundry washed, dried, and neatly folded.",
        price: "120.00",
        imageUrl: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&q=80&w=1000",
        inStock: true,
      });

      await storage.createTask({
        creatorId: demoUser.id,
        title: "Deliver groceries to Gogo Dlamini",
        description: "Need someone to pick up a grocery order from Checkers and deliver to 45 Vilakazi St.",
        budget: "150.00",
        location: "Vilakazi St, Soweto",
      });
    }
  }

  return httpServer;
}
