import { Router } from "express";
import { storage } from "../storage";
import { insertProjectSchema, insertApplicationSchema, type Project, type InsertProject } from "@shared/schema";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { Response } from "express";

const router = Router();

// Get all projects
router.get("/", async (req, res) => {
    try {
        const projects = await storage.getAllProjects();
        // Filter for public/pending if needed, but let frontend handle it for now
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch projects" });
    }
});

// Apply for a project (freelancer action)
router.post("/:id/apply", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });
        if (req.user.role !== "freelancer") {
            return res.status(403).json({ error: "Only freelancers can apply for projects" });
        }

        const projectId = req.params.id;
        const validatedData = insertApplicationSchema.parse({
            ...req.body,
            projectId,
            freelancerId: req.user.userId
        });

        // Check if already applied
        const existing = await storage.getApplicationsByProject(projectId);
        if (existing.some(a => a.freelancerId === req.user?.userId)) {
            return res.status(400).json({ error: "Already applied for this project" });
        }

        const application = await storage.createApplication(validatedData);
        res.status(201).json(application);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: "Validation error", details: error.errors });
        }
        res.status(500).json({ error: "Failed to apply for project" });
    }
});

// Get applications for a project (client action)
router.get("/:id/applications", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const project = await storage.getProject(req.params.id);
        if (!project) return res.status(404).json({ error: "Project not found" });

        // Only owner or admin can see applications
        // if (project.clientAddress !== req.user?.stxAddress && req.user?.role !== 'admin') { ... }

        const applications = await storage.getApplicationsByProject(req.params.id);

        // Enrich with freelancer details
        const enrichedApplications = await Promise.all(applications.map(async (app) => {
            const user = await storage.getUser(app.freelancerId);
            return {
                ...app,
                freelancer: user ? {
                    username: user.username,
                    stxAddress: user.stxAddress,
                    // Add other public profile fields if needed
                } : null
            };
        }));

        res.json(enrichedApplications);
    } catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).json({ error: "Failed to fetch applications" });
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
        console.log('✅ Project created successfully:', project);
        res.status(201).json({ message: "Project created successfully", project });
    } catch (error: any) {
        console.error('❌ Error creating project:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: "Validation error", details: error.errors });
        }
        res.status(500).json({ message: "Failed to create project", error: error.message });
    }
});

// Get applications for the authenticated freelancer
router.get("/applied", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user || req.user.role !== "freelancer") {
            return res.status(403).json({ error: "Only freelancers can view their applications" });
        }

        const applications = await storage.getApplicationsByFreelancer(req.user.userId);

        // Enrich with project details
        const enrichedApplications = await Promise.all(applications.map(async (app) => {
            const project = await storage.getProject(app.projectId);
            return {
                ...app,
                project
            };
        }));

        res.json(enrichedApplications);
    } catch (error) {
        console.error("Error fetching freelancer applications:", error);
        res.status(500).json({ error: "Failed to fetch applications" });
    }
});

// Hire freelancer and activate project (after on-chain transaction)
router.post("/:id/hire", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { applicationId, onChainId, txId } = req.body;

        const project = await storage.getProject(req.params.id);
        if (!project) return res.status(404).json({ error: "Project not found" });

        // Verify ownership (assuming clientAddress matches user's address, or check against userId if we stored it)
        // For now, trusting the auth + client check context in future

        const application = await storage.getApplication(applicationId);
        if (!application) return res.status(404).json({ error: "Application not found" });

        if (application.projectId !== project.id) {
            return res.status(400).json({ error: "Application does not belong to this project" });
        }

        const freelancer = await storage.getUser(application.freelancerId);
        if (!freelancer) return res.status(404).json({ error: "Freelancer not found" });

        // Update Project
        const updatedProject = await storage.updateProject(project.id, {
            status: "ACTIVE",
            freelancerId: freelancer.id,
            freelancerAddress: freelancer.stxAddress || "", // specific address or fallback
            onChainId,
            txId,
        });

        // Update Application status
        await storage.updateApplicationStatus(applicationId, "ACCEPTED");

        res.json({ message: "Freelancer hired successfully", project: updatedProject });
    } catch (error: any) {
        console.error("Hire error:", error);
        res.status(500).json({ error: "Failed to hire freelancer" });
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
