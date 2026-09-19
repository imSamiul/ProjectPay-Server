import { Router } from "express";
import { auth, optionalAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/require-role";
import { validateRequest } from "../../middleware/validate-request";
import {
  createAdminHandler,
  deleteUserHandler,
  getProjects,
  getStats,
  getUsers,
  resetPasswordHandler,
  updateAdminHandler,
} from "./controller";
import {
  adminProjectsQuerySchema,
  adminUsersQuerySchema,
  createAdminSchema,
  deleteUserParamsSchema,
  resetPasswordSchema,
  updateAdminSchema,
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

// Admin creation: allows initial bootstrap if no admin exists, otherwise requires existing admin
router.post(
  "/admin/create",
  optionalAuth,
  validateRequest(createAdminSchema),
  createAdminHandler,
);

// Admin edit/update profile
router.patch(
  "/admin/users/:userId",
  ...adminOnly,
  validateRequest(updateAdminSchema),
  updateAdminHandler,
);

// Admin reset password for any user/admin
router.post(
  "/admin/users/:userId/reset-password",
  ...adminOnly,
  validateRequest(resetPasswordSchema),
  resetPasswordHandler,
);

export default router;

