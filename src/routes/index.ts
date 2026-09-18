import { Router } from "express";
import usersRoutes from "./users";
import projectsRoutes from "./projects";
import managersRoutes from "./managers";
import paymentsRoutes from "./payments";
import adminRoutes from "./admin";

const router = Router();

router.use(usersRoutes);
router.use(projectsRoutes);
router.use(managersRoutes);
router.use(paymentsRoutes);
router.use(adminRoutes);

export default router;
