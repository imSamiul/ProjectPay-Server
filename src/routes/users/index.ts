import { Router } from "express";
import rateLimit from "express-rate-limit";
import { auth } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validate-request";
import {
  createUser,
  getUserDetails,
  loginUser,
  logOutUser,
} from "./controller";
import { loginSchema, signUpSchema } from "./validators";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/user/me", auth, getUserDetails);
router.post(
  "/user/signUp",
  authLimiter,
  validateRequest(signUpSchema),
  createUser,
);
router.post(
  "/user/login",
  authLimiter,
  validateRequest(loginSchema),
  loginUser,
);
router.post("/user/logout", auth, logOutUser);

export default router;
