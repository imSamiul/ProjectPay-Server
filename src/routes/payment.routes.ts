import express from 'express';

import {
  addPayment,
  deletePayment,
  updatePayment,
} from '../controllers/payment.controller';
import { isAuthenticated } from '../middlewares/isAuthenticated';
const router = express.Router();

// GET:

// POST:
// add payment for specific project and decrease the due amount
router.post('/payment/add', isAuthenticated, addPayment);

// PATCH:
router.patch('/payment/update/:paymentId', isAuthenticated, updatePayment);

// DELETE:
router.delete('/payment/delete/:paymentId', isAuthenticated, deletePayment);

export default router;
