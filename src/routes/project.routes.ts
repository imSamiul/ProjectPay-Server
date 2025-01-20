import express from 'express';
import {
  acceptClientRequest,
  createNewProject,
  deleteProject,
  getProjectDetails,
  handleClientRequest,
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
router.patch(
  '/projects/sendClientRequest/:projectCode',
  isAuthenticated,
  hasPermission(ROLE.CLIENT),
  handleClientRequest
);
router.patch(
  '/projects/acceptClientRequest/:projectId',
  isAuthenticated,
  hasPermission(ROLE.PROJECT_MANAGER),
  acceptClientRequest
);

// DELETE:
router.delete('/projects/delete/:projectId', isAuthenticated, deleteProject);

export default router;
