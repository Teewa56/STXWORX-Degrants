import { Router } from "express";
import { storage } from "../storage";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { updateProfileSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Get own profile
router.get("/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const user = await storage.getUser(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Remove sensitive data
        const { password, salt, mfaSecret, ...profile } = user;
        res.json(profile);
    } catch (error) {
        console.error("Error fetching own profile:", error);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

// Get user profile by ID
router.get("/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await storage.getUser(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Return public profile data
        const publicProfile = {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            role: user.role,
            bio: user.bio, // Added bio
            skills: user.skills,
            avatar: user.avatar,
            coverImage: user.coverImage,
            reputation: user.reputation,
            totalEarnings: user.totalEarnings,
            completedProjects: user.completedProjects,
            socialLinks: user.socialLinks,
            createdAt: user.createdAt
        };

        res.json(publicProfile);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

// Update own profile
router.patch("/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const data = updateProfileSchema.parse(req.body);

        // Check if there are any valid fields to update
        const validUpdates = Object.entries(data).filter(([_, value]) => value !== undefined && value !== null && value !== "");
        
        if (validUpdates.length === 0) {
            return res.status(400).json({ error: "No valid fields to update" });
        }

        // Prevent updating sensitive fields through this endpoint if not already handled by schema
        // The schema should already be partial and omit sensitive fields, but good to be double sure
        if ((data as any).password || (data as any).salt || (data as any).id) {
            return res.status(400).json({ error: "Invalid update fields" });
        }

        const updatedUser = await storage.updateUser(req.user.userId, data);

        res.json(updatedUser);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error("Error updating profile:", error);
        res.status(500).json({ error: "Failed to update profile" });
    }
});

export default router;
