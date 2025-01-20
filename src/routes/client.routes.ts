import express from 'express';
import { searchClient } from '../controllers/client.controller';
import { hasPermission, ROLE } from '../middlewares/hasPermission';

const router = express.Router();

// GET:
// Search for a client
router.get(
  '/clients/search',
  hasPermission(ROLE.PROJECT_MANAGER),
  searchClient
);

// POST:
// PATCH:
// DELETE:

export default router;
