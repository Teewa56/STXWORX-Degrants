import { Pool } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config();

console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
    console.log("DATABASE_URL starts with:", process.env.DATABASE_URL.substring(0, 20) + "...");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function test() {
    try {
        console.log("Connecting...");
        const client = await pool.connect();
        console.log("Connected!");
        const res = await client.query("SELECT NOW()");
        console.log("Query result:", res.rows[0]);
        client.release();
        process.exit(0);
    } catch (err) {
        console.error("Connection error:", err);
        process.exit(1);
    }
}

test();
