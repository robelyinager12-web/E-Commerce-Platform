import { pool, withTransaction } from "../../config/database";
import { logger } from "../../config/logger";
import { upsertCategories } from "./categories.seed";

/** Seeds only the categories (no users or sample listings). Run: npm run seed:categories */
withTransaction(async (client) => {
  const ids = await upsertCategories(client);
  logger.info(`Seeded ${Object.keys(ids).length} categories`);
})
  .then(() => pool.end())
  .catch(async (err: Error) => {
    logger.error(`Category seed failed: ${err.message}`);
    await pool.end();
    process.exit(1);
  });