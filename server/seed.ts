import { db } from "./db";
import { categories } from "@shared/schema";

const categoryData = [
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

async function seed() {
  console.log("🌱 Seeding database...");
  
  try {
    // Check if categories already exist
    const existingCategories = await db.select().from(categories);
    
    if (existingCategories.length > 0) {
      console.log("✓ Categories already seeded");
      return;
    }

    // Insert categories
    for (const category of categoryData) {
      await db.insert(categories).values(category);
    }
    
    console.log("✓ Database seeded successfully");
  } catch (error) {
    console.error("✗ Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("✓ Seed completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("✗ Seed failed:", error);
    process.exit(1);
  });
