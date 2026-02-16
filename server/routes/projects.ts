import { Router } from "express";
import { storage } from "../storage";
import { insertProjectSchema, type Project, type InsertProject } from "@shared/schema";

const router = Router();

// Get all projects
router.get("/", async (req, res) => {
    try {
        const projects = await storage.getAllProjects();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch projects" });
    }
});

// Get single project
router.get("/:id", async (req, res) => {
    try {
        const project = await storage.getProject(req.params.id);
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch project" });
    }
});

// Create new project
router.post("/new", async (req, res) => {
    console.log('📩 POST /api/projects/new received:', req.body);
    try {
        const validatedData = insertProjectSchema.parse(req.body);

        const projectData: InsertProject = {
            ...validatedData,
            milestone1Title: validatedData.milestone1Title || "Milestone 1",
            milestone2Title: validatedData.milestone2Title || "Milestone 2",
            milestone3Title: validatedData.milestone3Title || "Milestone 3",
            milestone4Title: validatedData.milestone4Title || "Milestone 4",
        };

        const project = await storage.createProject(projectData);
        res.status(201).json({ message: "Project created successfully", project });
    } catch (error: any) {
        console.error('❌ Error creating project:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: "Validation error", details: error.errors });
        }
        res.status(500).json({ message: "Failed to create project", error: error.message });
    }
});

// Update project with on-chain ID after blockchain transaction
router.patch("/:id/on-chain", async (req, res) => {
    try {
        const { onChainId, txId } = req.body;
        const project = await storage.updateProject(req.params.id, {
            onChainId,
            txId,
            status: "ACTIVE"
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.json({ message: "Project updated successfully", project });
    } catch (error: any) {
        res.status(500).json({ message: "Failed to update project", error: error.message });
    }
});

// Mark milestone as complete (freelancer action)
router.patch("/:id/milestone/:num/complete", async (req, res) => {
    try {
        const milestoneNum = parseInt(req.params.num);
        if (milestoneNum < 1 || milestoneNum > 4) {
            return res.status(400).json({ error: "Invalid milestone number" });
        }

        const { completionDescription, completionAttachment } = req.body;

        const project = await storage.getProject(req.params.id);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const completeField = `milestone${milestoneNum}Complete` as keyof Project;
        const descriptionField = `milestone${milestoneNum}CompletionDescription` as keyof Project;
        const attachmentField = `milestone${milestoneNum}CompletionAttachment` as keyof Project;

        const updates: Partial<Project> = {
            [completeField]: true
        };

        if (completionDescription) {
            updates[descriptionField] = completionDescription;
        }

        if (completionAttachment) {
            updates[attachmentField] = completionAttachment;
        }

        const updated = await storage.updateProject(req.params.id, updates);
        res.json({ message: "Milestone marked complete successfully", updated });
    } catch (error: any) {
        res.status(500).json({ message: "Failed to mark milestone complete", error: error.message });
    }
});

// Release milestone payment (client action)
router.patch("/:id/milestone/:num/release", async (req, res) => {
    try {
        const milestoneNum = parseInt(req.params.num);
        if (milestoneNum < 1 || milestoneNum > 4) {
            return res.status(400).json({ message: "Invalid milestone number" });
        }

        const project = await storage.getProject(req.params.id);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const completeField = `milestone${milestoneNum}Complete` as keyof Project;
        if (!project[completeField]) {
            return res.status(400).json({ message: "Milestone must be marked complete before release" });
        }

        const releaseField = `milestone${milestoneNum}Released` as keyof Project;
        const updated = await storage.updateProject(req.params.id, {
            [releaseField]: true
        });

        if (updated &&
            updated.milestone1Released &&
            updated.milestone2Released &&
            updated.milestone3Released &&
            updated.milestone4Released) {
            await storage.updateProject(req.params.id, { status: "COMPLETED" });
        }

        res.json({ message: "Milestone released successfully", updated });
    } catch (error: any) {
        res.status(500).json({ message: "Failed to release milestone", error: error.message });
    }
});

// Fund milestone
router.patch("/:id/milestone/:num/fund", async (req, res) => {
    try {
        const milestoneNum = parseInt(req.params.num);
        const field = `milestone${milestoneNum}Funded` as keyof Project;
        const updated = await storage.updateProject(req.params.id, {
            [field]: true
        });
        res.json({ message: "Milestone funded successfully", updated });
    } catch (error: any) {
        res.status(500).json({ message: "Failed to fund milestone", error: error.message });
    }
});

export default router;
