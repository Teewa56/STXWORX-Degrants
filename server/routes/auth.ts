import { Router } from "express";
import { storage } from "../storage";
import { AuthService, authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { EncryptionUtils } from "../services/encryption";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Registration schema with role and optional stxAddress/email
const registerSchema = insertUserSchema.extend({
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

router.post("/register", async (req, res) => {
    try {
        const data = registerSchema.parse(req.body);

        const existingUser = await storage.getUserByUsername(data.username);
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

        const { hash, salt } = EncryptionUtils.hashPassword(data.password);

        const user = await storage.createUser({
            ...data,
            password: hash,
            salt,
            role: data.role || "client",
            onboardingComplete: false
        });

        const loginResult = await AuthService.login(user.username, data.confirmPassword);

        res.status(201).json(loginResult);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error("Registration error:", error);
        res.status(500).json({ error: "Registration failed" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { username, password, mfaToken } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password required" });
        }

        const result = await AuthService.login(username, password, mfaToken);
        res.json(result);
    } catch (error: any) {
        console.error("Login error:", error);
        res.status(401).json({ error: error.message || "Invalid credentials" });
    }
});

router.post("/logout", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        if (req.sessionId && req.user) {
            await AuthService.logout(req.sessionId, req.user.userId);
        }
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ error: "Logout failed" });
    }
});

router.get("/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        const user = await storage.getUser(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ ...user, password: Buffer.from([]).toString(), salt: "" });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ error: "Failed to get profile" });
    }
});

export default router;
