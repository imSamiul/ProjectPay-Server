"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../middleware/auth"));
const paymentController_1 = require("../controller/paymentController");
const router = express_1.default.Router();
// GET:
// POST:
// add payment for specific project and decrease the due amount
router.post('/payment/add', auth_1.default, paymentController_1.addPayment);
// PATCH:
router.patch('/payment/update/:paymentId', auth_1.default, paymentController_1.updatePayment);
// DELETE:
router.delete('/payment/delete/:paymentId', auth_1.default, paymentController_1.deletePayment);
exports.default = router;
