import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEscrowSchema } from "@shared/schema";
import adminRouter from "./routes/admin";
import chatRouter from "./routes/chat";
import multiSigRouter from "./routes/multi-sig";
import nftRouter from "./routes/nft-minting";
import xRouter from "./routes/x-integration";
import { authenticateToken } from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {

  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Get all escrows
  app.get("/api/escrows", async (req, res) => {
    try {
      const escrows = await storage.getAllEscrows();
      res.json(escrows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch escrows" });
    }
  });

  // Get single escrow
  app.get("/api/escrows/:id", async (req, res) => {
    try {
      const escrow = await storage.getEscrow(req.params.id);
      if (!escrow) {
        return res.status(404).json({ error: "Escrow not found" });
      }
      res.json(escrow);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch escrow" });
    }
  });

  // Create new escrow
  app.post("/api/escrows", async (req, res) => {
    try {
      const validatedData = insertEscrowSchema.parse(req.body);
      const escrow = await storage.createEscrow(validatedData);
      res.status(201).json(escrow);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create escrow" });
    }
  });

  // Release escrow funds
  app.patch("/api/escrows/:id/release", async (req, res) => {
    try {
      const escrow = await storage.getEscrow(req.params.id);
      if (!escrow) {
        return res.status(404).json({ error: "Escrow not found" });
      }

      if (escrow.status !== 'locked') {
        return res.status(400).json({ error: "Escrow is not in locked status" });
      }

      const updated = await storage.updateEscrowStatus(req.params.id, 'released');
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to release escrow" });
    }
  });

  // Mount specialized routes
  app.use("/api/admin", adminRouter);
  app.use("/api/chat", chatRouter);
  app.use("/api/multi-sig", multiSigRouter);
  app.use("/api/nft", nftRouter);
  app.use("/api/x", xRouter);

  // User Profile Routes
  app.get("/api/users/profile", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      // Remove sensitive data
      const { password, salt, mfaSecret, ...profile } = user;
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.patch("/api/users/profile", authenticateToken, async (req: any, res) => {
    try {
      const { updateProfileSchema } = await import("@shared/schema");
      const validatedData = updateProfileSchema.parse(req.body);

      const updatedUser = await storage.updateUser(req.user.id, validatedData as any);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password, salt, mfaSecret, ...profile } = updatedUser;
      res.json(profile);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
