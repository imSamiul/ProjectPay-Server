import express from 'express';
import { addUserOtherInfo, getUserDetails } from '../controller/userController';

import {
  ensureAuthenticated,
  ensureUserExists,
} from '../middleware/passport-auth';

const router = express.Router();

// GET:
router.get('/user/me', ensureUserExists, getUserDetails);

// POST:
router.post('/user/addOtherInfo', ensureAuthenticated, addUserOtherInfo);

// PATCH:

// DELETE:

export default router;
