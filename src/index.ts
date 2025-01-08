import dotenv from 'dotenv';

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
import cookieParser from 'cookie-parser';

// Load environment variables based on the current environment

const env = process.env.NODE_ENV?.trim() || 'development';
console.log(`Environment: ${env}`);

const envFile = env === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const app = express();
const PORT = process.env.PORT || 3000;

// Passport setup
import '../config/passport-setup';
// Allow CORS
app.use(
  cors({
    origin: [
      'http://192.168.0.174:3002',
      'https://samiul3041.vercel.app', // Production frontend
      'http://localhost:3002',
    ], // Specify the allowed origin (React app)
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    credentials: true, // Allow cookies, authorization headers, etc.
  })
);
app.options('*', cors());
// Middleware
app.use(express.json());
// Connect to MongoDB
connectDB();
// session middleware
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
app.use(cookieParser());

// Routes
app.get('/', (req, res) => {
  res.send(`Hello, World! Environment: ${process.env.NODE_ENV}`);
});
app.use('/api', userRoutes);
app.use(projectRoutes);
app.use(managerRoutes);
app.use(paymentRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});
