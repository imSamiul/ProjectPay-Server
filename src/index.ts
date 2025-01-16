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
import paymentRoutes from './routes/paymentRoutes';
import authRoutes from './routes/auth.routes';
import connectDB from './db/mongoose';

import cookieParser from 'cookie-parser';

// Load environment variables based on the current environment

const app = express();
const PORT = process.env.PORT || 3000;

// Passport setup
import '../config/passport-setup';

// Middleware
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

// session middleware
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || 'secret',
//     resave: false,
//     saveUninitialized: true,
//     store: MongoStore.create({
//       mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/ProjectPay',
//       collectionName: 'sessions',
//     }),
//     cookie: {
//       maxAge: 1000 * 60 * 60 * 24 * 7,
//     },
//   })
// );
// app.use(passport.initialize());
// app.use(passport.session());
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
app.use(paymentRoutes);
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
