import express from 'express';
import auth from '../middleware/auth';
import { addPayment, updatePayment } from '../controller/paymentController';
const router = express.Router();

// GET:

// POST:
// add payment for specific project and decrease the due amount
router.post('/payment/add', auth, addPayment);

// PATCH:
router.patch('/payment/update/:paymentId', auth, updatePayment);

// DELETE:

export default router;
