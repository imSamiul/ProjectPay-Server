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

router.patch(
  '/projects/acceptClientRequest/:projectId',
  isAuthenticated,
  hasPermission(ROLE.PROJECT_MANAGER),
  acceptClientRequest
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
router.patch(
  '/projects/sendClientRequest/:projectCode',
  isAuthenticated,
  hasPermission(ROLE.CLIENT),
  handleClientRequest
);

// ------------ FOR BOTH: ------------
// GET:
router.get(
  '/projects/details/:projectCode',
  isAuthenticated,
  getProjectDetails
);
export default router;
