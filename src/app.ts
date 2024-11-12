import path from 'path';
import dotenv from 'dotenv';
const env = process.env.NODE_ENV?.trim() || 'development';

const envPath = path.resolve(__dirname, `../config/.env.${env}`);
console.log(envPath);

dotenv.config({ path: envPath });

import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import projectRoutes from './routes/projectRoutes';
import managerRoutes from './routes/managerRoutes';
import paymentRoutes from './routes/paymentRoutes';
import authRoutes from './routes/authRoutes';
import connectDB from './db/mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';

connectDB();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:5173', // Allow only your frontend origin
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/ProjectPay',
      collectionName: 'sessions',
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
import '../config/passport-setup';

app.use('/api', userRoutes);
app.use(projectRoutes);
app.use(managerRoutes);
app.use(paymentRoutes);

app.use('/api/auth', authRoutes);

export default app;
