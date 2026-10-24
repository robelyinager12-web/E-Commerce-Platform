
import app from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { testConnection } from "./config/database";

async function startServer(): Promise<void> {
  try {
    // Safely diagnose database configuration without printing secrets.
    console.log("Database connection diagnostics:", {
      nodeEnv: process.env.NODE_ENV || "(not set)",
      configuredHostPresent: Boolean(process.env.DB_HOST),
      configuredHostIsLocalhost:
        process.env.DB_HOST === "localhost" ||
        process.env.DB_HOST === "127.0.0.1" ||
        process.env.DB_HOST === "::1",
      configuredPort: process.env.DB_PORT || "5432 (default)",
      databaseNamePresent: Boolean(process.env.DB_NAME),
      databaseUserPresent: Boolean(process.env.DB_USER),
      databasePasswordPresent: Boolean(process.env.DB_PASSWORD),
      effectiveHostIsLocalhost:
        env.db.host === "localhost" ||
        env.db.host === "127.0.0.1" ||
        env.db.host === "::1",
      productionMode: env.isProduction,
    });

    // Verify the PostgreSQL connection before starting the server.
    await testConnection();

    const server = app.listen(env.port, "0.0.0.0", () => {
      logger.info(
        `Server running in ${env.nodeEnv} mode on port ${env.port}`
      );
    });

    process.on("unhandledRejection", (reason: unknown) => {
      logger.error(`Unhandled Rejection: ${String(reason)}`);
      server.close(() => process.exit(1));
    });

    process.on("SIGTERM", () => {
      logger.info("SIGTERM received. Shutting down gracefully...");
      server.close(() => process.exit(0));
    });
  } catch (err: unknown) {
    console.error("Failed to start server:", err);

    if (err instanceof Error) {
      console.error("Error name:", err.name);
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
    }

    process.exit(1);
  }
}

startServer();
