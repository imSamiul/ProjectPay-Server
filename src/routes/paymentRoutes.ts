import express from 'express';
import auth from '../middleware/auth';
import { addPayment } from '../controller/paymentController';
const router = express.Router();

// GET:

// POST:
// add payment for specific project and decrease the due amount
router.post('/payment/add', auth, addPayment);

// PATCH:

// DELETE:

export default router;
