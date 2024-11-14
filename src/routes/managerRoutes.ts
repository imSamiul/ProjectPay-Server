import express from 'express';
import { getManagerProjects } from '../controllers/managerController';
import auth from '../middlewares/auth';
const router = express.Router();

// GET:
router.get('/manager/projects', auth, getManagerProjects);

// POST:

// PATCH:

// DELETE:

export default router;
