import type { Express } from "express";
import { storage } from "./storage";
import { insertProjectSchema, type Project, type InsertProject } from "@shared/schema";

export function registerProjectRoutes(app: Express) {
  
  // Get all projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  // Get single project
  app.get("/api/projects/:id", async (req, res) => {
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
  app.post("/api/projects", async (req, res) => {
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
      res.status(201).json(project);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  // Update project with on-chain ID after blockchain transaction
  app.patch("/api/projects/:id/on-chain", async (req, res) => {
    try {
      const { onChainId, txId } = req.body;
      const project = await storage.updateProject(req.params.id, {
        onChainId,
        txId,
        status: "ACTIVE"
      });
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  // Mark milestone as complete (freelancer action)
  app.patch("/api/projects/:id/milestone/:num/complete", async (req, res) => {
    try {
      const milestoneNum = parseInt(req.params.num);
      if (milestoneNum < 1 || milestoneNum > 4) {
        return res.status(400).json({ error: "Invalid milestone number" });
      }
      
      const { completionDescription, completionAttachment } = req.body;
      
      console.log('🔍 Milestone completion request:', {
        projectId: req.params.id,
        milestoneNum,
        completionDescription,
        completionAttachment,
        bodyKeys: Object.keys(req.body)
      });
      
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
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
      
      console.log('💾 Updating project with:', updates);
      
      const updated = await storage.updateProject(req.params.id, updates);
      
      console.log('✅ Updated project milestone fields:', {
        [`milestone${milestoneNum}Complete`]: updated?.[completeField],
        [`milestone${milestoneNum}CompletionDescription`]: updated?.[descriptionField],
        [`milestone${milestoneNum}CompletionAttachment`]: updated?.[attachmentField]
      });
      
      res.json(updated);
    } catch (error) {
      console.error('❌ Error marking milestone complete:', error);
      res.status(500).json({ error: "Failed to mark milestone complete" });
    }
  });

  // Release milestone payment (client action)
  app.patch("/api/projects/:id/milestone/:num/release", async (req, res) => {
    try {
      const milestoneNum = parseInt(req.params.num);
      if (milestoneNum < 1 || milestoneNum > 4) {
        return res.status(400).json({ error: "Invalid milestone number" });
      }
      
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Check if milestone is complete before releasing
      const completeField = `milestone${milestoneNum}Complete` as keyof Project;
      if (!project[completeField]) {
        return res.status(400).json({ error: "Milestone must be marked complete before release" });
      }
      
      const releaseField = `milestone${milestoneNum}Released` as keyof Project;
      const updated = await storage.updateProject(req.params.id, {
        [releaseField]: true
      });
      
      // Check if all milestones are released
      if (updated && 
          updated.milestone1Released && 
          updated.milestone2Released && 
          updated.milestone3Released && 
          updated.milestone4Released) {
        await storage.updateProject(req.params.id, { status: "COMPLETED" });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to release milestone" });
    }
  });

  // Fund milestone (optional - for tracking funding separately)
  app.patch("/api/projects/:id/milestone/:num/fund", async (req, res) => {
    try {
      const milestoneNum = parseInt(req.params.num);
      if (milestoneNum < 1 || milestoneNum > 4) {
        return res.status(400).json({ error: "Invalid milestone number" });
      }
      
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const field = `milestone${milestoneNum}Funded` as keyof Project;
      const updated = await storage.updateProject(req.params.id, {
        [field]: true
      });
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to fund milestone" });
    }
  });
}
