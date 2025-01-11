import dotenv from 'dotenv';
const env = process.env.NODE_ENV?.trim() || 'development';
console.log(`Environment: ${env}`);
const envFile = env === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from 'express';
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

const app = express();
const PORT = process.env.PORT || 3000;

// Passport setup
import '../config/passport-setup';
// Allow CORS
if (env === 'development') {
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
}

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
app.use(cookieParser(process.env.COOKIE_SECRET));

// Routes
app.get('/', (req, res) => {
  res.send(`Hello, World! Environment: ${process.env.NODE_ENV}`);
});
// app.use((req, res, next) => {
//   const error = new Error('Not Found') as { status?: number };
//   error.status = 404;
//   next(error);
// });

// interface CustomError extends Error {
//   status?: number;
// }

// const errorHandler: ErrorRequestHandler = (
//   error: CustomError,
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   console.error('\x1b[31m', error);
//   if (res.headersSent) {
//     return next(error);
//   }
//   return res.status(error.status || 500).json({
//     error: {
//       status: error.status || 500,
//       message: error.status ? error.message : 'Internal Server Error',
//     },
//   });
// };

// app.use(errorHandler);

app.use('/api', userRoutes);
app.use(projectRoutes);
app.use(managerRoutes);
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
