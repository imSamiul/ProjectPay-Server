import express from 'express';
import {
  acceptProjectInvitation,
  getClientInvitations,
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
// Get all invitations of a project for a client
router.get(
  '/clients/invitations',
  isAuthenticated,
  hasPermission(ROLE.CLIENT),
  getClientInvitations
);

// POST:
// PATCH:

router.patch(
  '/clients/acceptProjectInvitation/:projectId',
  isAuthenticated,
  hasPermission(ROLE.CLIENT),
  acceptProjectInvitation
);
// DELETE:

export default router;
