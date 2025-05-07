import { defineConfig } from "drizzle-kit";
import { config } from "./server/config"; // Importa la configurazione

// Assicurati che il percorso del database sia definito per SQLite
const dbPath =
  config.database.type === "sqlite"
    ? config.database.path
    : "data/inventory.db"; // Default path

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite", // Cambia qui
  dbCredentials: {
    url: dbPath!, // Usa il percorso del file db SQLite
  },
  // Aggiungi questo per un output più chiaro
  verbose: true,
  strict: true,
});
