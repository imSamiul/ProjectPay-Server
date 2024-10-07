import express from 'express';
import { createNewProject } from '../controller/projectController';
import auth from '../middleware/auth';
const router = express.Router();

// GET:

// POST:
// create a new project
router.post('/projects/create', auth, createNewProject);

// PATCH:

// DELETE:

export default router;
