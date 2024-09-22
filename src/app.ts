import express from 'express';
import cors from 'cors';
import clientRoutes from './routes/userRoutes';
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
app.use(clientRoutes);

export default app;
