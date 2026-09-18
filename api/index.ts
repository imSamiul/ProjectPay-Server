import { loadEnv } from "../src/config/env";
import connectDB from "../src/db/mongoose";
import { createApp } from "../src/app";

loadEnv();
connectDB();

export default createApp();
