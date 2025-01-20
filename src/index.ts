/* eslint-disable no-console */
import dotenv from 'dotenv';
const env = process.env.NODE_ENV?.trim() || 'development';
console.log(`Environment: ${env}`);
const envFile = env === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user.routes';
import projectRoutes from './routes/project.routes';
import managerRoutes from './routes/manager.routes';
import clientRoutes from './routes/client.routes';
import paymentRoutes from './routes/payment.routes';
import authRoutes from './routes/auth.routes';
import connectDB from './db/mongoose';

import cookieParser from 'cookie-parser';

// Load environment variables based on the current environment

const app = express();
const PORT = process.env.PORT || 3000;

// Passport setup
import '../config/passport-setup';
import passport from 'passport';

// Middleware
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(passport.initialize());

const corsOptions = {
  origin: 'http://localhost:3002', // Frontend URL
  credentials: true,
};
app.use(cors(corsOptions));
// Connect to MongoDB
connectDB();

// Routes
app.get('/', (req, res) => {
  res.send(`Hello, World! Environment: ${process.env.NODE_ENV}`);
});

app.use('/api', userRoutes);
app.use('/api', projectRoutes);
app.use('/api', managerRoutes);
app.use('/api', clientRoutes);
app.use('/api', paymentRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

interface ServerError extends Error {
  code?: string;
}

app.listen(PORT || 5000, (error?: ServerError) => {
  if (error) {
    console.log('Error in server setup');
    return;
  }
  console.log('Server listening on Port', PORT);
});
