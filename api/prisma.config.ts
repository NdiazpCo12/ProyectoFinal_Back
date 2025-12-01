import { defineConfig } from "prisma/config";
import "dotenv/config";

// Usar la DATABASE_URL tal cual viene del entorno
const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/backend";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: dbUrl,
  },
});
