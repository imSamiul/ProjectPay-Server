import express from 'express';
import {
  acceptProjectInvitation,
  getClientInvitations,
  searchClient,
  sendInvitationToClient,
} from '../controllers/client.controller';
import { hasPermission, ROLE } from '../middlewares/hasPermission';
import { isAuthenticated } from '../middlewares/isAuthenticated';

const router = express.Router();

// GET:
// Search for a client
router.get(
  '/clients/search',
  hasPermission(ROLE.PROJECT_MANAGER),
  searchClient
);
// Get all invitations project for a client
router.get(
  '/clients/invitations',
  isAuthenticated,
  hasPermission(ROLE.CLIENT),
  getClientInvitations
);

// POST:
// PATCH:
// send invitation to client to join project
router.patch(
  '/clients/sendInvitation/:projectId',
  isAuthenticated,
  hasPermission(ROLE.PROJECT_MANAGER),
  sendInvitationToClient
);
router.patch(
  '/clients/acceptProjectInvitation/:projectId',
  isAuthenticated,
  hasPermission(ROLE.CLIENT),
  acceptProjectInvitation
);
// DELETE:

export default router;
