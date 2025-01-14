import express from 'express';
import {
  createNewProject,
  deleteProject,
  getProjectDetails,
  searchProject,
  updateProjectDetails,
  updateProjectStatus,
} from '../controllers/projectController';
import { isAuthenticated } from '../middlewares/isAuthenticated';

const router = express.Router();

// GET:
router.get('/projects/search', isAuthenticated, searchProject);
router.get(
  '/projects/details/:projectCode',
  isAuthenticated,
  getProjectDetails
);

// POST:
// create a new project
router.post('/projects/create', isAuthenticated, createNewProject);

// PATCH:
router.patch(
  '/projects/updateProjectStatus/:projectCode',
  isAuthenticated,
  updateProjectStatus
);
router.patch(
  '/projects/updateProjectDetails/:projectCode',
  isAuthenticated,
  updateProjectDetails
);

// DELETE:
router.delete('/projects/delete/:projectId', isAuthenticated, deleteProject);

export default router;
