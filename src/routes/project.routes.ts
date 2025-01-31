import express from 'express';

import {
  cancelInvitationToClient,
  createNewProject,
  deleteProject,
  getProjectDetails,
  removeClientFromProject,
  searchProject,
  sendInvitationToClient,
  updateProjectDetails,
  updateProjectStatus,
} from '../controllers/project.controller';
import { hasPermission, ROLE } from '../middlewares/hasPermission';
import { isAuthenticated } from '../middlewares/isAuthenticated';

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
// send invitation to client to join project
router.patch(
  '/projects/invite/:projectId',
  isAuthenticated,
  hasPermission(ROLE.PROJECT_MANAGER),
  sendInvitationToClient
);
// cancel invitation to client
router.patch(
  '/projects/cancelInvitation/:projectId',
  isAuthenticated,
  hasPermission(ROLE.PROJECT_MANAGER),
  cancelInvitationToClient
);
// remove client from project
router.patch(
  '/projects/removeClient/:projectId',
  isAuthenticated,
  hasPermission(ROLE.PROJECT_MANAGER),
  removeClientFromProject
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

// PATCH:

// ------------ FOR BOTH: ------------
// GET:
router.get(
  '/projects/details/:projectCode',
  isAuthenticated,
  getProjectDetails
);

export default router;
