import express from 'express';
import auth from '../middleware/auth';
import {
  addPayment,
  deletePayment,
  updatePayment,
} from '../controller/paymentController';
const router = express.Router();

// GET:

// POST:
// add payment for specific project and decrease the due amount
router.post('/payment/add', auth, addPayment);

// PATCH:
router.patch('/payment/update/:paymentId', auth, updatePayment);

// DELETE:
router.delete('/payment/delete/:paymentId', auth, deletePayment);

export default router;
