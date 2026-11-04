import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runSeed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is required to execute seeds.');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🌱 Seeding PostgreSQL database with default tiers and Grand Council admin...');
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
    await pool.query(seedSql);
    console.log('✅ PostgreSQL seed successfully applied.');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeed();

