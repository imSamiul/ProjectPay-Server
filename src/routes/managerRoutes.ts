import express from 'express';
import { getManagerProjects } from '../controller/managerController';
import auth from '../middleware/auth';
const router = express.Router();

// GET:
router.get('/manager/projects', auth, getManagerProjects);

// POST:

// PATCH:

// DELETE:

export default router;
