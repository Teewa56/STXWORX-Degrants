import express, { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { type Project } from '../shared/schema';

const router = express.Router();

// In-memory storage for projects
interface ProjectData extends Project {
  id: string;
}

const projectsStore = new Map<string, ProjectData>();

// Helper to create a new project
function createProjectData(data: any): ProjectData {
  const id = randomUUID();
  const milestoneAmount = Math.floor(data.totalAmount / 4);
  
  return {
    id,
    onChainId: null,
    txId: null,
    clientAddress: data.clientAddress,
    freelancerAddress: data.freelancerAddress,
    totalAmount: data.totalAmount,
    tokenType: data.tokenType || 'STX',
    status: 'PENDING',
    description: data.description,
    category: data.category,
    subcategory: data.subcategory,
    
    milestone1Amount: milestoneAmount,
    milestone1Title: data.milestone1Title || 'Milestone 1: Setup & Planning',
    milestone1Description: data.milestone1Description,
    milestone1Attachment: data.milestone1Attachment || null,
    milestone1Funded: false,
    milestone1Complete: false,
    milestone1Released: false,
    milestone1CompletionAttachment: null,
    milestone1CompletionDescription: null,
    
    milestone2Amount: milestoneAmount,
    milestone2Title: data.milestone2Title || 'Milestone 2: Development',
    milestone2Description: data.milestone2Description,
    milestone2Attachment: data.milestone2Attachment || null,
    milestone2Funded: false,
    milestone2Complete: false,
    milestone2Released: false,
    milestone2CompletionAttachment: null,
    milestone2CompletionDescription: null,
    
    milestone3Amount: milestoneAmount,
    milestone3Title: data.milestone3Title || 'Milestone 3: Testing & Review',
    milestone3Description: data.milestone3Description,
    milestone3Attachment: data.milestone3Attachment || null,
    milestone3Funded: false,
    milestone3Complete: false,
    milestone3Released: false,
    milestone3CompletionAttachment: null,
    milestone3CompletionDescription: null,
    
    milestone4Amount: milestoneAmount,
    milestone4Title: data.milestone4Title || 'Milestone 4: Deployment & Support',
    milestone4Description: data.milestone4Description,
    milestone4Attachment: data.milestone4Attachment || null,
    milestone4Funded: false,
    milestone4Complete: false,
    milestone4Released: false,
    milestone4CompletionAttachment: null,
    milestone4CompletionDescription: null,
    
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Create a new milestone-based project
router.post('/api/projects', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    
    if (!body.totalAmount || !body.freelancerAddress) {
      return res.status(400).json({ error: 'Missing required fields: totalAmount, freelancerAddress' });
    }
    
    const newProject = createProjectData(body);
    projectsStore.set(newProject.id, newProject);
    
    res.json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get all projects
router.get('/api/projects', async (req: Request, res: Response) => {
  try {
    const allProjects = Array.from(projectsStore.values());
    res.json(allProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get project by ID
router.get('/api/projects/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = projectsStore.get(id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Get projects by client address
router.get('/api/projects/client/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const clientProjects = Array.from(projectsStore.values()).filter(
      p => p.clientAddress === address
    );
    res.json(clientProjects);
  } catch (error) {
    console.error('Error fetching client projects:', error);
    res.status(500).json({ error: 'Failed to fetch client projects' });
  }
});

// Get projects by freelancer address
router.get('/api/projects/freelancer/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const freelancerProjects = Array.from(projectsStore.values()).filter(
      p => p.freelancerAddress === address
    );
    res.json(freelancerProjects);
  } catch (error) {
    console.error('Error fetching freelancer projects:', error);
    res.status(500).json({ error: 'Failed to fetch freelancer projects' });
  }
});

// Update milestone status
router.put('/api/projects/:id/milestone/:num', async (req: Request, res: Response) => {
  try {
    const { id, num } = req.params;
    const { action, txId, onChainId, completionAttachment, completionDescription } = req.body;
    
    const project = projectsStore.get(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const milestoneNum = parseInt(num);
    if (milestoneNum < 1 || milestoneNum > 4) {
      return res.status(400).json({ error: 'Invalid milestone number' });
    }

    // Update milestone status based on action
    const key = `milestone${milestoneNum}${action === 'fund' ? 'Funded' : action === 'complete' ? 'Complete' : 'Released'}` as keyof ProjectData;
    (project as any)[key] = true;
    
    // If completing milestone, save attachment and description
    if (action === 'complete') {
      if (completionAttachment) {
        const attachmentKey = `milestone${milestoneNum}CompletionAttachment` as keyof ProjectData;
        (project as any)[attachmentKey] = completionAttachment;
      }
      if (completionDescription) {
        const descKey = `milestone${milestoneNum}CompletionDescription` as keyof ProjectData;
        (project as any)[descKey] = completionDescription;
      }
    }
    
    if (txId) project.txId = txId;
    if (onChainId) project.onChainId = onChainId;
    
    project.updatedAt = new Date();
    projectsStore.set(id, project);
    
    res.json(project);
  } catch (error) {
    console.error('Error updating milestone:', error);
    res.status(500).json({ error: 'Failed to update milestone' });
  }
});

// Update project status
router.put('/api/projects/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, onChainId } = req.body;
    
    const project = projectsStore.get(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    project.status = status;
    if (onChainId) project.onChainId = onChainId;
    project.updatedAt = new Date();
    
    projectsStore.set(id, project);
    res.json(project);
  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({ error: 'Failed to update project status' });
  }
});

export default router;
