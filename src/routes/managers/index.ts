import { Router } from "express";
import { auth } from "../../middleware/auth";
import { requireRole } from "../../middleware/require-role";
import { validateRequest } from "../../middleware/validate-request";
import { getManagerProjects, getManagerStats, listClients } from "./controller";
import {
  managerClientsQuerySchema,
  managerProjectsQuerySchema,
} from "./validators";

const router = Router();
const managerOnly = [auth, requireRole("project manager")] as const;

router.get("/manager/stats", ...managerOnly, getManagerStats);
router.get(
  "/manager/projects",
  ...managerOnly,
  validateRequest(managerProjectsQuerySchema),
  getManagerProjects,
);
router.get(
  "/manager/clients",
  ...managerOnly,
  validateRequest(managerClientsQuerySchema),
  listClients,
);

export default router;
