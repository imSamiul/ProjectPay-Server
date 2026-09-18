import { Router } from "express";
import { auth } from "../../middleware/auth";
import { requireRole } from "../../middleware/require-role";
import { validateRequest } from "../../middleware/validate-request";
import {
  createNewProject,
  deleteProject,
  getProjectDetails,
  searchProject,
  updateProjectDetails,
  updateProjectStatus,
} from "./controller";
import {
  createProjectSchema,
  projectCodeParamsSchema,
  projectIdParamsSchema,
  searchProjectSchema,
  updateProjectDetailsSchema,
  updateProjectStatusSchema,
} from "./validators";

const router = Router();
const managerOnly = [auth, requireRole("project manager")] as const;

router.get(
  "/projects/search",
  ...managerOnly,
  validateRequest(searchProjectSchema),
  searchProject,
);
router.get(
  "/projects/details/:projectCode",
  ...managerOnly,
  validateRequest(projectCodeParamsSchema),
  getProjectDetails,
);
router.post(
  "/projects/create",
  ...managerOnly,
  validateRequest(createProjectSchema),
  createNewProject,
);
router.patch(
  "/projects/updateProjectStatus/:projectCode",
  ...managerOnly,
  validateRequest(updateProjectStatusSchema),
  updateProjectStatus,
);
router.patch(
  "/projects/updateProjectDetails/:projectCode",
  ...managerOnly,
  validateRequest(updateProjectDetailsSchema),
  updateProjectDetails,
);
router.delete(
  "/projects/delete/:projectId",
  ...managerOnly,
  validateRequest(projectIdParamsSchema),
  deleteProject,
);

export default router;
