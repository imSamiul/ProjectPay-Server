import { Router } from "express";
import { auth } from "../../middleware/auth";
import { requireRole } from "../../middleware/require-role";
import { validateRequest } from "../../middleware/validate-request";
import { addPayment, deletePayment, updatePayment } from "./controller";
import {
  addPaymentSchema,
  paymentIdParamsSchema,
  updatePaymentSchema,
} from "./validators";

const router = Router();
const managerOnly = [auth, requireRole("project manager")] as const;

router.post(
  "/payment/add",
  ...managerOnly,
  validateRequest(addPaymentSchema),
  addPayment,
);
router.patch(
  "/payment/update/:paymentId",
  ...managerOnly,
  validateRequest(updatePaymentSchema),
  updatePayment,
);
router.delete(
  "/payment/delete/:paymentId",
  ...managerOnly,
  validateRequest(paymentIdParamsSchema),
  deletePayment,
);

export default router;
