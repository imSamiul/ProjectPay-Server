import express from 'express';
import {
  createNewProject,
  deleteProject,
  getProjectDetails,
  searchProject,
  searchProjectForClient,
  updateProjectDetails,
  updateProjectStatus,
} from '../controllers/project.controller';
import { isAuthenticated } from '../middlewares/isAuthenticated';
import { hasPermission, ROLE } from '../middlewares/hasPermission';

const router = express.Router();

// GET:
router.get('/projects/search', isAuthenticated, searchProject);
router.get(
  '/projects/details/:projectCode',
  isAuthenticated,
  getProjectDetails
);
router.get(
  '/projects/client/search',
  isAuthenticated,
  hasPermission(ROLE.CLIENT),
  searchProjectForClient
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
