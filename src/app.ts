import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import projectRoutes from './routes/projectRoutes';
import managerRoutes from './routes/managerRoutes';
import paymentRoutes from './routes/paymentRoutes';
import path from 'path';
import dotenv from 'dotenv';
import connectDB from './db/mongoose';

dotenv.config({
  path: path.resolve(__dirname, '../config/dev.env'),
});

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
