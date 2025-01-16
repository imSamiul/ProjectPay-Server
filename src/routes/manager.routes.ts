import express from 'express';
import { getManagerProjects } from '../controllers/manager.controller';
import { isAuthenticated } from '../middlewares/isAuthenticated';

const router = express.Router();

// GET:
router.get('/manager/projects', isAuthenticated, getManagerProjects);

// POST:

// PATCH:

// DELETE:

export default router;
