import { Router } from "express";
import { auth } from "../../middleware/auth";
import { requireRole } from "../../middleware/require-role";
import { validateRequest } from "../../middleware/validate-request";
import {
  createNewProject,
  deleteProject,
  getProjectDetails,
  linkClient,
  listMyProjects,
  searchProject,
  unlinkClient,
  updateProjectDetails,
  updateProjectStatus,
} from "./controller";
import {
  createProjectSchema,
  linkClientSchema,
  projectCodeParamsSchema,
  projectIdParamsSchema,
  searchProjectSchema,
  unlinkClientSchema,
  updateProjectDetailsSchema,
  updateProjectStatusSchema,
} from "./validators";

const router = Router();
const managerOnly = [auth, requireRole("project manager")] as const;
const clientOnly = [auth, requireRole("client")] as const;
const managerOrClient = [
  auth,
  requireRole("project manager", "client"),
] as const;

router.get(
  "/projects/search",
  ...managerOnly,
  validateRequest(searchProjectSchema),
  searchProject,
);
router.get("/projects/mine", ...clientOnly, listMyProjects);
router.get(
  "/projects/details/:projectCode",
  ...managerOrClient,
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
router.post(
  "/projects/:projectCode/clients",
  ...managerOnly,
  validateRequest(linkClientSchema),
  linkClient,
);
router.delete(
  "/projects/:projectCode/clients/:clientId",
  ...managerOnly,
  validateRequest(unlinkClientSchema),
  unlinkClient,
);

export default router;
