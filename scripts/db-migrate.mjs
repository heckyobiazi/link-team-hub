import nextEnv from "@next/env";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { resolve } from "node:path";

nextEnv.loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL_UNPOOLED;
if (!databaseUrl) {
  console.error("DATABASE_URL_UNPOOLED is missing from the environment.");
  process.exit(1);
}

const databaseHost = new URL(databaseUrl).hostname;
if (databaseHost.includes("-pooler.")) {
  console.error(
    "DATABASE_URL_UNPOOLED points to a pooled Neon endpoint. Set it to the direct connection string from Neon (Pooled connection turned off).",
  );
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 15_000,
});

try {
  await migrate(drizzle(pool), {
    migrationsFolder: resolve(process.cwd(), "drizzle"),
  });
  console.log("Database migrations applied successfully.");
} catch (error) {
  console.error("Database migration failed:");
  console.error(error);
  if (error && typeof error === "object" && "cause" in error && error.cause) {
    console.error("PostgreSQL cause:");
    console.error(error.cause);
  }
  process.exitCode = 1;
} finally {
  await pool.end();
}
