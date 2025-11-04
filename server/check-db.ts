import { pool } from "./db";

async function checkConnection() {
  console.log("🔍 Checking PostgreSQL connection...");
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "✓ Set" : "✗ Not set");
  
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT version()");
    console.log("✓ PostgreSQL connection successful!");
    console.log("📊 PostgreSQL version:", result.rows[0].version);
    client.release();
    
    // Test a simple query
    const { db } = await import("./db");
    const { categories } = await import("@shared/schema");
    const cats = await db.select().from(categories);
    console.log(`✓ Found ${cats.length} categories in database`);
    
    process.exit(0);
  } catch (error) {
    console.error("✗ Database connection failed:", error);
    console.log("\n📝 Make sure:");
    console.log("  1. PostgreSQL is running");
    console.log("  2. DATABASE_URL is set in .env file");
    console.log("  3. Database exists and is accessible");
    console.log("\nSee DATABASE_SETUP.md for setup instructions");
    process.exit(1);
  }
}

checkConnection();
