import express from 'express';
import {
  createNewProject,
  deleteProject,
  getProjectDetails,
  searchProject,
  updateProjectDetails,
  updateProjectStatus,
} from '../controllers/projectController';
import auth from '../middlewares/auth';
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
router.delete('/projects/delete/:projectId', auth, deleteProject);

export default router;
