import { loadEnv } from "../config/env";
import connectDB from "../db/mongoose";
import User from "../models/user-model";
// Registering the discriminators is what adds the "userType" schema path to
// the base User model — without this import, Mongoose's strict mode silently
// drops userType when a plain User document is created (as opposed to going
// through User.discriminator(...)).
import "../models/client-model";
import "../models/manager-model";
import { logger } from "../utils/logger";

loadEnv();

function readArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index !== -1 ? process.argv[index + 1] : undefined;
}

async function main(): Promise<void> {
  const name = readArg("--name");
  const email = readArg("--email");
  const phone = readArg("--phone");
  const password = readArg("--password");

  if (!name || !email || !phone || !password) {
    logger.error(
      "Usage: pnpm run create-admin -- --name <name> --email <email> --phone <phone> --password <password>",
    );
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    logger.error(`A user with email ${email} already exists.`);
    process.exit(1);
  }

  const admin = new User({ name, email, phone, password, userType: "admin" });
  await admin.save();

  logger.info(`Admin account created for ${email}.`);
  process.exit(0);
}

main().catch((error) => {
  logger.error({ error }, "Failed to create admin account");
  process.exit(1);
});
