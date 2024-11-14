import express from 'express';
import auth from '../middlewares/auth';
import {
  addPayment,
  deletePayment,
  updatePayment,
} from '../controllers/paymentController';
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
