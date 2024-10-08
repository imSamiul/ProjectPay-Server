import express from 'express';
import {
  createNewProject,
  searchProject,
} from '../controller/projectController';
import auth from '../middleware/auth';
const router = express.Router();

// GET:
router.get('/projects/search', auth, searchProject);

// POST:
// create a new project
router.post('/projects/create', auth, createNewProject);

// PATCH:

// DELETE:

export default router;
