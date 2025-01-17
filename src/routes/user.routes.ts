import express from 'express';
import { isAuthenticated } from '../middlewares/isAuthenticated';
import { getUserDetails } from '../controllers/user.controller';

const router = express.Router();

// GET:
router.get('/users/me', isAuthenticated, getUserDetails);

// POST:

// PATCH:

// DELETE:

export default router;
