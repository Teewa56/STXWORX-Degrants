import { type User, type InsertUser, type Escrow, type InsertEscrow, type Category, type InsertCategory, type Project, type InsertProject, type XIntegration, type InsertXIntegration, type DaoProposal, type InsertDaoProposal, type DaoApproval, type InsertDaoApproval, type AdminAction, type InsertAdminAction, type ChatMessage, type InsertChatMessage } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

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

  // X Integration methods
  getXIntegration(userId: string): Promise<XIntegration | undefined>;
  updateXIntegration(userId: string, updates: Partial<XIntegration>): Promise<XIntegration | undefined>;
  upsertXIntegration(data: InsertXIntegration): Promise<XIntegration>;
  deleteXIntegration(userId: string): Promise<void>;

  // DAO Multi-sig methods
  getDaoProposals(status?: string): Promise<DaoProposal[]>;
  getDaoProposal(id: string): Promise<{ proposal: DaoProposal; approvals: DaoApproval[] } | undefined>;
  createDaoProposal(proposal: InsertDaoProposal): Promise<DaoProposal>;
  updateDaoProposal(id: string, updates: Partial<DaoProposal>): Promise<DaoProposal | undefined>;
  addDaoApproval(approval: InsertDaoApproval): Promise<DaoApproval>;
  getDaoApprovals(proposalId: string): Promise<DaoApproval[]>;

  // Admin action methods
  createAdminAction(action: InsertAdminAction): Promise<AdminAction>;

  // Chat methods
  getChatMessages(projectId: string, limit: number, before?: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  deleteChatMessage(messageId: string): Promise<void>;
  getChatMessage(messageId: string): Promise<ChatMessage | undefined>;
}

export class NeonStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const { users } = await import("@shared/schema");
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { users } = await import("@shared/schema");
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { users } = await import("@shared/schema");
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const { users } = await import("@shared/schema");
    const [result] = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return result;
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    const { categories } = await import("@shared/schema");
    return await db.select().from(categories);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const { categories } = await import("@shared/schema");
    const result = await db.select().from(categories).where(eq(categories.id, id));
    return result[0];
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    const { categories } = await import("@shared/schema");
    const result = await db.select().from(categories).where(eq(categories.name, name));
    return result[0];
  }

  // Escrow methods
  async getAllEscrows(): Promise<Escrow[]> {
    const { escrows } = await import("@shared/schema");
    return await db.select().from(escrows);
  }

  async getEscrow(id: string): Promise<Escrow | undefined> {
    const { escrows } = await import("@shared/schema");
    const result = await db.select().from(escrows).where(eq(escrows.id, id));
    return result[0];
  }

  async getEscrowsByClient(clientAddress: string): Promise<Escrow[]> {
    const { escrows } = await import("@shared/schema");
    return await db.select().from(escrows).where(eq(escrows.clientAddress, clientAddress));
  }

  async getEscrowsByFreelancer(freelancerAddress: string): Promise<Escrow[]> {
    const { escrows } = await import("@shared/schema");
    return await db.select().from(escrows).where(eq(escrows.freelancerAddress, freelancerAddress));
  }

  async getEscrowsByCategory(category: string): Promise<Escrow[]> {
    const { escrows } = await import("@shared/schema");
    return await db.select().from(escrows).where(eq(escrows.category, category));
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
    const result = await db.insert(escrows).values(escrowData).returning();
    return result[0];
  }

  async updateEscrow(id: string, updates: Partial<Escrow>): Promise<Escrow | undefined> {
    const { escrows } = await import("@shared/schema");
    const result = await db.update(escrows)
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
    return await db.select().from(projects);
  }

  async getProject(id: string): Promise<Project | undefined> {
    const { projects } = await import("@shared/schema");
    const result = await db.select().from(projects).where(eq(projects.id, id));
    return result[0];
  }

  async getProjectsByClient(clientAddress: string): Promise<Project[]> {
    const { projects } = await import("@shared/schema");
    return await db.select().from(projects).where(eq(projects.clientAddress, clientAddress));
  }

  async getProjectsByFreelancer(freelancerAddress: string): Promise<Project[]> {
    const { projects } = await import("@shared/schema");
    return await db.select().from(projects).where(eq(projects.freelancerAddress, freelancerAddress));
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
    const result = await db.insert(projects).values(projectData).returning();
    return result[0];
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const { projects } = await import("@shared/schema");
    const result = await db.update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return result[0];
  }

  // X Integration methods
  async getXIntegration(userId: string): Promise<XIntegration | undefined> {
    const { xIntegrations } = await import("@shared/schema");
    if (!userId) return undefined;
    const result = await db.select().from(xIntegrations).where(eq(xIntegrations.userId, userId));
    return result[0];
  }

  async updateXIntegration(userId: string, updates: Partial<XIntegration>): Promise<XIntegration | undefined> {
    const { xIntegrations } = await import("@shared/schema");
    const [result] = await db.update(xIntegrations)
      .set({ ...updates, lastSync: new Date() })
      .where(eq(xIntegrations.userId, userId))
      .returning();
    return result;
  }

  async upsertXIntegration(insertData: InsertXIntegration): Promise<XIntegration> {
    const { xIntegrations } = await import("@shared/schema");

    if (!insertData.userId) throw new Error("userId is required for X integration");

    // Check if exists
    const existing = await this.getXIntegration(insertData.userId);

    if (existing) {
      const result = await db.update(xIntegrations)
        .set({ ...insertData, lastSync: new Date() })
        .where(eq(xIntegrations.userId, insertData.userId))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(xIntegrations).values({
        ...insertData,
        verified: insertData.verified ?? false,
        followerCount: insertData.followerCount ?? 0,
        engagementScore: insertData.engagementScore ?? 0,
      }).returning();
      return result[0];
    }
  }

  async deleteXIntegration(userId: string): Promise<void> {
    const { xIntegrations } = await import("@shared/schema");
    await db.delete(xIntegrations).where(eq(xIntegrations.userId, userId));
  }

  // DAO Multi-sig methods
  async getDaoProposals(status?: string): Promise<DaoProposal[]> {
    const { daoProposals } = await import("@shared/schema");
    if (status) {
      return await db.select().from(daoProposals).where(eq(daoProposals.status, status));
    }
    return await db.select().from(daoProposals);
  }

  async getDaoProposal(id: string): Promise<{ proposal: DaoProposal; approvals: DaoApproval[] } | undefined> {
    const { daoProposals, daoApprovals } = await import("@shared/schema");
    const [proposal] = await db.select().from(daoProposals).where(eq(daoProposals.id, id));
    if (!proposal) return undefined;
    const approvals = await db.select().from(daoApprovals).where(eq(daoApprovals.proposalId, id));
    return { proposal, approvals };
  }

  async createDaoProposal(proposal: InsertDaoProposal): Promise<DaoProposal> {
    const { daoProposals } = await import("@shared/schema");
    const [result] = await db.insert(daoProposals).values(proposal).returning();
    return result;
  }

  async updateDaoProposal(id: string, updates: Partial<DaoProposal>): Promise<DaoProposal | undefined> {
    const { daoProposals } = await import("@shared/schema");
    const [result] = await db.update(daoProposals).set(updates).where(eq(daoProposals.id, id)).returning();
    return result;
  }

  async addDaoApproval(approval: InsertDaoApproval): Promise<DaoApproval> {
    const { daoApprovals } = await import("@shared/schema");
    const [result] = await db.insert(daoApprovals).values(approval).returning();
    return result;
  }

  async getDaoApprovals(proposalId: string): Promise<DaoApproval[]> {
    const { daoApprovals } = await import("@shared/schema");
    return await db.select().from(daoApprovals).where(eq(daoApprovals.proposalId, proposalId));
  }

  async createAdminAction(action: InsertAdminAction): Promise<AdminAction> {
    const { adminActions } = await import("@shared/schema");
    const [result] = await db.insert(adminActions).values(action).returning();
    return result;
  }

  // Chat methods
  async getChatMessages(projectId: string, limit: number, before?: string): Promise<ChatMessage[]> {
    const { chatMessages } = await import("@shared/schema");

    let conditions = eq(chatMessages.projectId, projectId);

    if (before) {
      conditions = and(conditions, sql`${chatMessages.timestamp} < ${before}`) as any;
    }

    return await db.select()
      .from(chatMessages)
      .where(conditions)
      .orderBy(desc(chatMessages.timestamp))
      .limit(limit);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const { chatMessages } = await import("@shared/schema");
    const [result] = await db.insert(chatMessages).values(message).returning();
    return result;
  }

  async deleteChatMessage(messageId: string): Promise<void> {
    const { chatMessages } = await import("@shared/schema");
    await db.delete(chatMessages).where(eq(chatMessages.id, messageId));
  }

  async getChatMessage(messageId: string): Promise<ChatMessage | undefined> {
    const { chatMessages } = await import("@shared/schema");
    const [result] = await db.select().from(chatMessages).where(eq(chatMessages.id, messageId));
    return result;
  }
}

export const storage = new NeonStorage();
