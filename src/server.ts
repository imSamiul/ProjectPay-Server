import { getConfig, loadEnv } from "./config/env";
import connectDB from "./db/mongoose";
import { createApp } from "./app";
import { logger } from "./utils/logger";

loadEnv();

async function start(): Promise<void> {
  await connectDB();

  const app = createApp();
  const { port } = getConfig();

  const server = app.listen(port, () => {
    logger.info(`Server is up on port ${port}`);
  });

  const shutdown = () => {
    logger.info("Shutting down...");
    server.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

start().catch((error) => {
  logger.error({ error }, "Failed to start server");
  process.exit(1);
});
