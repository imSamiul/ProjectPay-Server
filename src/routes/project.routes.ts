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

// ------------- FOR MANAGER: -------------
// GET:
// search for projects
router.get(
  '/projects/search',
  isAuthenticated,
  hasPermission(ROLE.PROJECT_MANAGER),
  searchProject
);

// POST:
// create a new project
router.post(
  '/projects/create',
  isAuthenticated,
  hasPermission(ROLE.PROJECT_MANAGER),
  createNewProject
);

// PATCH:
router.patch(
  '/projects/updateProjectStatus/:projectCode',
  isAuthenticated,
  hasPermission(ROLE.PROJECT_MANAGER),
  updateProjectStatus
);
router.patch(
  '/projects/updateProjectDetails/:projectCode',
  isAuthenticated,
  hasPermission(ROLE.PROJECT_MANAGER),
  updateProjectDetails
);

// DELETE:
router.delete(
  '/projects/delete/:projectId',
  isAuthenticated,
  hasPermission(ROLE.PROJECT_MANAGER),
  deleteProject
);

// ------------- FOR CLIENT: -------------
// GET:
// TODO: Will delete if necessary
router.get(
  '/projects/client/search',
  isAuthenticated,
  hasPermission(ROLE.CLIENT),
  searchProjectForClient
);
// PATCH:

// ------------ FOR BOTH: ------------
// GET:
router.get(
  '/projects/details/:projectCode',
  isAuthenticated,
  getProjectDetails
);
export default router;
