import app from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { testConnection } from "./config/database";

async function startServer(): Promise<void> {
  try {
    await testConnection();

    const server = app.listen(env.port, () => {
      logger.info(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
    });

    process.on("unhandledRejection", (reason) => {
      logger.error(`Unhandled Rejection: ${reason}`);
      server.close(() => process.exit(1));
    });

    process.on("SIGTERM", () => {
      logger.info("SIGTERM received. Shutting down gracefully...");
      server.close(() => process.exit(0));
    });
  } catch (err) {
    logger.error(`Failed to start server: ${(err as Error).message}`);
    process.exit(1);
  }
}

startServer();