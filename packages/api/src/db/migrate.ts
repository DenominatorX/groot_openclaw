import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const { Client } = pg;

const __dirname = dirname(fileURLToPath(import.meta.url));

async function runMigrations() {
  const databaseUrl = process.env["DATABASE_URL"];
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  const db = drizzle(client);
  await migrate(db, {
    migrationsFolder: join(__dirname, "../../drizzle"),
  });

  await client.end();
  console.log("Migrations complete");
}

runMigrations().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
