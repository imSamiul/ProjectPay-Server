import { Router } from "express";
import { auth } from "../../middleware/auth";
import { requireRole } from "../../middleware/require-role";
import { validateRequest } from "../../middleware/validate-request";
import { deleteUserHandler, getProjects, getStats, getUsers } from "./controller";
import {
  adminProjectsQuerySchema,
  adminUsersQuerySchema,
  deleteUserParamsSchema,
} from "./validators";

const router = Router();
const adminOnly = [auth, requireRole("admin")] as const;

router.get("/admin/stats", ...adminOnly, getStats);
router.get(
  "/admin/users",
  ...adminOnly,
  validateRequest(adminUsersQuerySchema),
  getUsers,
);
router.get(
  "/admin/projects",
  ...adminOnly,
  validateRequest(adminProjectsQuerySchema),
  getProjects,
);
router.delete(
  "/admin/users/:userId",
  ...adminOnly,
  validateRequest(deleteUserParamsSchema),
  deleteUserHandler,
);

export default router;
