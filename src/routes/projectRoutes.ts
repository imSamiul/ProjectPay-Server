import express from 'express';
import { createNewProject } from '../controller/projectController';
import auth from '../middleware/auth';
const router = express.Router();

// POST:
// create a new project
router.post('/project/create', auth, createNewProject);

export default router;
