import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Categories for freelance work
export const categories = pgTable("categories", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  subcategories: json("subcategories").notNull().$type<string[]>(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Milestone-based projects table for freelance gigs with on-chain integration
export const projects = pgTable("projects", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  onChainId: integer("on_chain_id"), // ID from smart contract (references project-counter in contract)
  txId: text("tx_id"), // Transaction ID from the blockchain
  clientAddress: text("client_address").notNull(),
  freelancerAddress: text("freelancer_address").notNull(),
  totalAmount: integer("total_amount").notNull(), // Total STX in microstacks
  tokenType: text("token_type").default("STX").notNull(), // STX or sBTC
  status: text("status").default("PENDING").notNull(), // PENDING, ACTIVE, UNDER_REVIEW, COMPLETED
  description: text("description"),
  category: text("category"),
  subcategory: text("subcategory"),
  
  // Milestone 1
  milestone1Amount: integer("milestone_1_amount").notNull(),
  milestone1Title: text("milestone_1_title").notNull().default("Milestone 1"),
  milestone1Description: text("milestone_1_description"),
  milestone1Attachment: text("milestone_1_attachment"), // Client's attachment when creating milestone
  milestone1Funded: boolean("milestone_1_funded").default(false).notNull(),
  milestone1Complete: boolean("milestone_1_complete").default(false).notNull(),
  milestone1Released: boolean("milestone_1_released").default(false).notNull(),
  milestone1CompletionAttachment: text("milestone_1_completion_attachment"), // Freelancer's attachment when completing
  milestone1CompletionDescription: text("milestone_1_completion_description"), // Freelancer's description when completing
  
  // Milestone 2
  milestone2Amount: integer("milestone_2_amount").notNull(),
  milestone2Title: text("milestone_2_title").notNull().default("Milestone 2"),
  milestone2Description: text("milestone_2_description"),
  milestone2Attachment: text("milestone_2_attachment"),
  milestone2Funded: boolean("milestone_2_funded").default(false).notNull(),
  milestone2Complete: boolean("milestone_2_complete").default(false).notNull(),
  milestone2Released: boolean("milestone_2_released").default(false).notNull(),
  milestone2CompletionAttachment: text("milestone_2_completion_attachment"),
  milestone2CompletionDescription: text("milestone_2_completion_description"),
  
  // Milestone 3
  milestone3Amount: integer("milestone_3_amount").notNull(),
  milestone3Title: text("milestone_3_title").notNull().default("Milestone 3"),
  milestone3Description: text("milestone_3_description"),
  milestone3Attachment: text("milestone_3_attachment"),
  milestone3Funded: boolean("milestone_3_funded").default(false).notNull(),
  milestone3Complete: boolean("milestone_3_complete").default(false).notNull(),
  milestone3Released: boolean("milestone_3_released").default(false).notNull(),
  milestone3CompletionAttachment: text("milestone_3_completion_attachment"),
  milestone3CompletionDescription: text("milestone_3_completion_description"),
  
  // Milestone 4
  milestone4Amount: integer("milestone_4_amount").notNull(),
  milestone4Title: text("milestone_4_title").notNull().default("Milestone 4"),
  milestone4Description: text("milestone_4_description"),
  milestone4Attachment: text("milestone_4_attachment"),
  milestone4Funded: boolean("milestone_4_funded").default(false).notNull(),
  milestone4Complete: boolean("milestone_4_complete").default(false).notNull(),
  milestone4Released: boolean("milestone_4_released").default(false).notNull(),
  milestone4CompletionAttachment: text("milestone_4_completion_attachment"),
  milestone4CompletionDescription: text("milestone_4_completion_description"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Keep escrows table for backward compatibility
export const escrows = pgTable("escrows", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  onChainId: integer("on_chain_id"),
  txId: text("tx_id"),
  clientAddress: text("client_address").notNull(),
  freelancerAddress: text("freelancer_address").notNull(),
  amount: integer("amount").notNull(),
  tokenType: text("token_type").default("STX").notNull(),
  status: text("status").default("created").notNull(),
  funded: boolean("funded").default(false).notNull(),
  completed: boolean("completed").default(false).notNull(),
  released: boolean("released").default(false).notNull(),
  description: text("description"),
  category: text("category"),
  subcategory: text("subcategory"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  onChainId: true,
  txId: true,
  status: true,
  milestone1Funded: true,
  milestone1Complete: true,
  milestone1Released: true,
  milestone2Funded: true,
  milestone2Complete: true,
  milestone2Released: true,
  milestone3Funded: true,
  milestone3Complete: true,
  milestone3Released: true,
  milestone4Funded: true,
  milestone4Complete: true,
  milestone4Released: true,
}).extend({
  totalAmount: z.number().int("Total amount must be an integer (microstacks)").positive("Amount must be positive"),
  milestone1Amount: z.number().int("Milestone amount must be an integer (microstacks)").positive("Amount must be positive"),
  milestone2Amount: z.number().int("Milestone amount must be an integer (microstacks)").positive("Amount must be positive"),
  milestone3Amount: z.number().int("Milestone amount must be an integer (microstacks)").positive("Amount must be positive"),
  milestone4Amount: z.number().int("Milestone amount must be an integer (microstacks)").positive("Amount must be positive"),
  freelancerAddress: z.string().min(34, "Invalid Stacks address").max(50, "Invalid Stacks address"),
  clientAddress: z.string().min(34, "Invalid Stacks address").max(50, "Invalid Stacks address").optional(),
  tokenType: z.enum(["STX", "sBTC"]).default("STX"),
  description: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  milestone1Title: z.string().optional(),
  milestone1Description: z.string().optional(),
  milestone1Attachment: z.string().optional(),
  milestone2Title: z.string().optional(),
  milestone2Description: z.string().optional(),
  milestone2Attachment: z.string().optional(),
  milestone3Title: z.string().optional(),
  milestone3Description: z.string().optional(),
  milestone3Attachment: z.string().optional(),
  milestone4Title: z.string().optional(),
  milestone4Description: z.string().optional(),
  milestone4Attachment: z.string().optional(),
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export const insertEscrowSchema = createInsertSchema(escrows).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  onChainId: true,
  txId: true,
  status: true,
  funded: true,
  completed: true,
  released: true,
}).extend({
  amount: z.number().positive("Amount must be positive"),
  freelancerAddress: z.string().min(34, "Invalid Stacks address").max(50, "Invalid Stacks address"),
  clientAddress: z.string().min(34, "Invalid Stacks address").max(50, "Invalid Stacks address").optional(),
  tokenType: z.enum(["STX", "sBTC"]).default("STX"),
  description: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
});

export type InsertEscrow = z.infer<typeof insertEscrowSchema>;
export type Escrow = typeof escrows.$inferSelect;
