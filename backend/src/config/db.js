import dotenv from "dotenv";
dotenv.config();

import pg from "pg";

console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Loaded" : "Missing");

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;
