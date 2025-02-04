import express from 'express';
import {
  getClientProjects,
  getRequestedProjects,
  searchClient,
} from '../controllers/client.controller';
import { hasPermission, ROLE } from '../middlewares/hasPermission';
import { isAuthenticated } from '../middlewares/isAuthenticated';

const router = express.Router();

// GET:
// Search for a client
router.get(
  '/clients',
  isAuthenticated,
  hasPermission(ROLE.PROJECT_MANAGER),
  searchClient
);

// get client projects
router.get(
  '/client-projects',
  isAuthenticated,
  hasPermission(ROLE.CLIENT),
  getClientProjects
);

// get requested projects
router.get(
  '/requested-projects',
  isAuthenticated,
  hasPermission(ROLE.CLIENT),
  getRequestedProjects
);
// POST:
// PATCH:

// DELETE:

export default router;
