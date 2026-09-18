import mongoose from "mongoose";
import { logger } from "../utils/logger";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URL!);
    logger.info("MongoDB connected");
  } catch (error) {
    logger.error({ error }, "Error connecting to MongoDB");
    process.exit(1);
  }
};

export default connectDB;
