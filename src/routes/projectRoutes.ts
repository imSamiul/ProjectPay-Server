import express from 'express';
import {
  createNewProject,
  getProjectDetails,
  searchProject,
  updateProjectDetails,
  updateProjectStatus,
} from '../controller/projectController';
import auth from '../middleware/auth';
const router = express.Router();

// GET:
router.get('/projects/search', auth, searchProject);
router.get('/projects/details/:projectCode', auth, getProjectDetails);

// POST:
// create a new project
router.post('/projects/create', auth, createNewProject);

// PATCH:
router.patch(
  '/projects/updateProjectStatus/:projectCode',
  auth,
  updateProjectStatus
);
router.patch(
  '/projects/updateProjectDetails/:projectCode',
  auth,
  updateProjectDetails
);

// DELETE:

export default router;
