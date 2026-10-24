import app from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { testConnection } from "./config/database";

async function startServer(): Promise<void> {
  try {
    await testConnection();

    const server = app.listen(env.port, "0.0.0.0", () => {
      logger.info(
        `Server running in ${env.nodeEnv} mode on port ${env.port}`
      );
    });

    process.on("unhandledRejection", (reason) => {
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
