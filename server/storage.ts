import { type User, type InsertUser, type Escrow, type InsertEscrow, type Category, type InsertCategory, type Project, type InsertProject } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  
  // Escrow methods (legacy - kept for compatibility)
  getAllEscrows(): Promise<Escrow[]>;
  getEscrow(id: string): Promise<Escrow | undefined>;
  getEscrowsByClient(clientAddress: string): Promise<Escrow[]>;
  getEscrowsByFreelancer(freelancerAddress: string): Promise<Escrow[]>;
  getEscrowsByCategory(category: string): Promise<Escrow[]>;
  createEscrow(escrow: InsertEscrow): Promise<Escrow>;
  updateEscrow(id: string, updates: Partial<Escrow>): Promise<Escrow | undefined>;
  updateEscrowStatus(id: string, status: string): Promise<Escrow | undefined>;
  
  // Project methods (milestone-based)
  getAllProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByClient(clientAddress: string): Promise<Project[]>;
  getProjectsByFreelancer(freelancerAddress: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;
}

// PostgreSQL Storage Implementation
export class PostgresStorage implements IStorage {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const { users } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { users } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { users } = await import("@shared/schema");
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    const { categories } = await import("@shared/schema");
    return await this.db.select().from(categories);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const { categories } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    const result = await this.db.select().from(categories).where(eq(categories.id, id));
    return result[0];
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    const { categories } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    const result = await this.db.select().from(categories).where(eq(categories.name, name));
    return result[0];
  }

  // Escrow methods
  async getAllEscrows(): Promise<Escrow[]> {
    const { escrows } = await import("@shared/schema");
    return await this.db.select().from(escrows);
  }

  async getEscrow(id: string): Promise<Escrow | undefined> {
    const { escrows } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    const result = await this.db.select().from(escrows).where(eq(escrows.id, id));
    return result[0];
  }

  async getEscrowsByClient(clientAddress: string): Promise<Escrow[]> {
    const { escrows } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    return await this.db.select().from(escrows).where(eq(escrows.clientAddress, clientAddress));
  }

  async getEscrowsByFreelancer(freelancerAddress: string): Promise<Escrow[]> {
    const { escrows } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    return await this.db.select().from(escrows).where(eq(escrows.freelancerAddress, freelancerAddress));
  }

  async getEscrowsByCategory(category: string): Promise<Escrow[]> {
    const { escrows } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    return await this.db.select().from(escrows).where(eq(escrows.category, category));
  }

  async createEscrow(insertEscrow: InsertEscrow): Promise<Escrow> {
    const { escrows } = await import("@shared/schema");
    const escrowData = {
      ...insertEscrow,
      clientAddress: insertEscrow.clientAddress || "",
      status: "created",
      funded: false,
      completed: false,
      released: false,
    };
    const result = await this.db.insert(escrows).values(escrowData).returning();
    return result[0];
  }

  async updateEscrow(id: string, updates: Partial<Escrow>): Promise<Escrow | undefined> {
    const { escrows } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    const result = await this.db.update(escrows)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(escrows.id, id))
      .returning();
    return result[0];
  }

  async updateEscrowStatus(id: string, status: string): Promise<Escrow | undefined> {
    const updates: Partial<Escrow> = {};
    if (status === 'funded') {
      updates.funded = true;
    } else if (status === 'completed') {
      updates.completed = true;
    } else if (status === 'released') {
      updates.released = true;
    }
    return this.updateEscrow(id, updates);
  }

  // Project methods
  async getAllProjects(): Promise<Project[]> {
    const { projects } = await import("@shared/schema");
    return await this.db.select().from(projects);
  }

  async getProject(id: string): Promise<Project | undefined> {
    const { projects } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    const result = await this.db.select().from(projects).where(eq(projects.id, id));
    return result[0];
  }

  async getProjectsByClient(clientAddress: string): Promise<Project[]> {
    const { projects } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    return await this.db.select().from(projects).where(eq(projects.clientAddress, clientAddress));
  }

  async getProjectsByFreelancer(freelancerAddress: string): Promise<Project[]> {
    const { projects } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    return await this.db.select().from(projects).where(eq(projects.freelancerAddress, freelancerAddress));
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const { projects } = await import("@shared/schema");
    const projectData = {
      ...insertProject,
      clientAddress: insertProject.clientAddress || "",
      status: "PENDING",
      milestone1Title: insertProject.milestone1Title || "Milestone 1",
      milestone2Title: insertProject.milestone2Title || "Milestone 2",
      milestone3Title: insertProject.milestone3Title || "Milestone 3",
      milestone4Title: insertProject.milestone4Title || "Milestone 4",
      milestone1Funded: false,
      milestone1Complete: false,
      milestone1Released: false,
      milestone2Funded: false,
      milestone2Complete: false,
      milestone2Released: false,
      milestone3Funded: false,
      milestone3Complete: false,
      milestone3Released: false,
      milestone4Funded: false,
      milestone4Complete: false,
      milestone4Released: false,
    };
    const result = await this.db.insert(projects).values(projectData).returning();
    return result[0];
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const { projects } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    const result = await this.db.update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return result[0];
  }
}

// In-Memory Storage Implementation (for development/fallback)
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private categories: Map<string, Category>;
  private escrows: Map<string, Escrow>;
  private projects: Map<string, Project>;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.escrows = new Map();
    this.projects = new Map();
    
    this.seedCategories();
  }
  
  private seedCategories() {
    const categoryData: InsertCategory[] = [
      {
        name: "Creative & Design",
        icon: "Palette",
        subcategories: [
          "UI/UX Design",
          "Logo & Branding",
          "Animation & Motion Graphics",
          "VFX / CGI",
          "3D Modeling & Rendering",
          "NFT Art & Collectibles",
          "Product Mockups",
        ],
      },
      {
        name: "Development & Tech",
        icon: "Code",
        subcategories: [
          "Smart Contract Development (Clarity, Solidity, Rust)",
          "Web2 → Web3 Integration",
          "dApp Development",
          "Game Development (Unity / WebGL / React)",
          "AI & Machine Learning",
          "API Integration",
          "Automation & Robotics",
        ],
      },
      {
        name: "Media & Content",
        icon: "Film",
        subcategories: [
          "Video Production & Editing",
          "Music Production (AI-assisted / traditional)",
          "Voiceovers & Sound Design",
          "Podcast Production",
          "Scriptwriting & Storyboarding",
          "AR/VR Media",
        ],
      },
      {
        name: "Marketing & Community",
        icon: "TrendingUp",
        subcategories: [
          "Social Media Campaigns",
          "Influencer Collaborations",
          "Brand Strategy",
          "Web3 PR & Content Writing",
          "Discord & Telegram Community Setup",
          "Growth Hacking",
        ],
      },
      {
        name: "Business & Consulting",
        icon: "Briefcase",
        subcategories: [
          "Tokenomics Design",
          "Startup Mentoring",
          "Financial Modeling (Web3 projects)",
          "Legal / Compliance Advice (DAO structuring, etc.)",
          "Pitch Decks & Grant Proposals",
        ],
      },
      {
        name: "AI & Automation",
        icon: "Bot",
        subcategories: [
          "AI Prompt Engineering",
          "AI Art / Music Generation",
          "Chatbot & Agent Creation",
          "Workflow Automation with APIs",
          "Data Science / Predictive Analytics",
        ],
      },
      {
        name: "Blockchain Services",
        icon: "Link",
        subcategories: [
          "NFT Minting & Marketplace Integration",
          "DAO Setup & Management",
          "Cross-chain Bridge Development",
          "STX Smart Contracts & Wallet Integrations",
          "Security Audits",
        ],
      },
    ];
    
    categoryData.forEach((cat) => {
      const id = randomUUID();
      const category: Category = { ...cat, id };
      this.categories.set(id, category);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.name === name,
    );
  }

  // Escrow methods
  async getAllEscrows(): Promise<Escrow[]> {
    return Array.from(this.escrows.values());
  }

  async getEscrow(id: string): Promise<Escrow | undefined> {
    return this.escrows.get(id);
  }

  async getEscrowsByClient(clientAddress: string): Promise<Escrow[]> {
    return Array.from(this.escrows.values()).filter(
      (escrow) => escrow.clientAddress === clientAddress,
    );
  }

  async getEscrowsByFreelancer(freelancerAddress: string): Promise<Escrow[]> {
    return Array.from(this.escrows.values()).filter(
      (escrow) => escrow.freelancerAddress === freelancerAddress,
    );
  }

  async getEscrowsByCategory(category: string): Promise<Escrow[]> {
    return Array.from(this.escrows.values()).filter(
      (escrow) => escrow.category === category,
    );
  }

  async createEscrow(insertEscrow: InsertEscrow): Promise<Escrow> {
    const id = randomUUID();
    const escrow: Escrow = {
      id,
      clientAddress: insertEscrow.clientAddress || "",
      freelancerAddress: insertEscrow.freelancerAddress,
      amount: insertEscrow.amount,
      tokenType: insertEscrow.tokenType || "STX",
      onChainId: null,
      txId: null,
      status: "created",
      funded: false,
      completed: false,
      released: false,
      description: insertEscrow.description || null,
      category: insertEscrow.category || null,
      subcategory: insertEscrow.subcategory || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.escrows.set(id, escrow);
    return escrow;
  }

  async updateEscrow(id: string, updates: Partial<Escrow>): Promise<Escrow | undefined> {
    const escrow = this.escrows.get(id);
    if (!escrow) {
      return undefined;
    }
    
    const updated: Escrow = { ...escrow, ...updates };
    this.escrows.set(id, updated);
    return updated;
  }
  
  async updateEscrowStatus(id: string, status: string): Promise<Escrow | undefined> {
    // Legacy method - kept for compatibility
    const escrow = this.escrows.get(id);
    if (!escrow) {
      return undefined;
    }
    
    // Map old status to new boolean fields
    const updates: Partial<Escrow> = {};
    if (status === 'funded') {
      updates.funded = true;
    } else if (status === 'completed') {
      updates.completed = true;
    } else if (status === 'released') {
      updates.released = true;
    }
    
    return this.updateEscrow(id, updates);
  }

  // Project methods
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByClient(clientAddress: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.clientAddress === clientAddress,
    );
  }

  async getProjectsByFreelancer(freelancerAddress: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.freelancerAddress === freelancerAddress,
    );
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = {
      id,
      onChainId: null,
      txId: null,
      clientAddress: insertProject.clientAddress || "",
      freelancerAddress: insertProject.freelancerAddress,
      totalAmount: insertProject.totalAmount,
      tokenType: insertProject.tokenType || "STX",
      status: "PENDING",
      description: insertProject.description || null,
      category: insertProject.category || null,
      subcategory: insertProject.subcategory || null,
      
      // Milestone 1
      milestone1Amount: insertProject.milestone1Amount,
      milestone1Title: insertProject.milestone1Title || "Milestone 1",
      milestone1Description: insertProject.milestone1Description || null,
      milestone1Attachment: insertProject.milestone1Attachment || null,
      milestone1Funded: false,
      milestone1Complete: false,
      milestone1Released: false,
      milestone1CompletionAttachment: null,
      milestone1CompletionDescription: null,
      
      // Milestone 2
      milestone2Amount: insertProject.milestone2Amount,
      milestone2Title: insertProject.milestone2Title || "Milestone 2",
      milestone2Description: insertProject.milestone2Description || null,
      milestone2Attachment: insertProject.milestone2Attachment || null,
      milestone2Funded: false,
      milestone2Complete: false,
      milestone2Released: false,
      milestone2CompletionAttachment: null,
      milestone2CompletionDescription: null,
      
      // Milestone 3
      milestone3Amount: insertProject.milestone3Amount,
      milestone3Title: insertProject.milestone3Title || "Milestone 3",
      milestone3Description: insertProject.milestone3Description || null,
      milestone3Attachment: insertProject.milestone3Attachment || null,
      milestone3Funded: false,
      milestone3Complete: false,
      milestone3Released: false,
      milestone3CompletionAttachment: null,
      milestone3CompletionDescription: null,
      
      // Milestone 4
      milestone4Amount: insertProject.milestone4Amount,
      milestone4Title: insertProject.milestone4Title || "Milestone 4",
      milestone4Description: insertProject.milestone4Description || null,
      milestone4Attachment: insertProject.milestone4Attachment || null,
      milestone4Funded: false,
      milestone4Complete: false,
      milestone4Released: false,
      milestone4CompletionAttachment: null,
      milestone4CompletionDescription: null,
      
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) {
      return undefined;
    }
    
    const updated: Project = { 
      ...project, 
      ...updates,
      updatedAt: new Date()
    };
    this.projects.set(id, updated);
    return updated;
  }
}

// Initialize storage based on environment
let storage: IStorage = new MemStorage(); // Default to in-memory

// Async initialization function
async function initializeStorage() {
  if (process.env.DATABASE_URL) {
    // Use PostgreSQL if DATABASE_URL is provided
    const { db } = await import("./db");
    storage = new PostgresStorage(db);
    console.log("✓ Using PostgreSQL storage");
  } else {
    // Already using in-memory storage
    console.log("⚠ Using in-memory storage (data will be lost on restart)");
  }
}

// Initialize storage
initializeStorage();

export { storage };

