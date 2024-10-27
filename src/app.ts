import path from 'path';
import dotenv from 'dotenv';

import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import projectRoutes from './routes/projectRoutes';
import managerRoutes from './routes/managerRoutes';
import paymentRoutes from './routes/paymentRoutes';
import connectDB from './db/mongoose';

const env = process.env.NODE_ENV?.trim() || 'development';

const envPath = path.resolve(__dirname, `../config/.env.${env}`);
console.log(envPath);

dotenv.config({ path: envPath });

connectDB();

const app = express();
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(userRoutes);
app.use(projectRoutes);
app.use(managerRoutes);
app.use(paymentRoutes);

export default app;
