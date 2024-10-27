"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const paymentSchema = new mongoose_1.Schema({
    projectId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
    },
    paymentAmount: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    transactionId: {
        type: String,
    },
    paymentDate: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true,
});
const Payment = (0, mongoose_1.model)('Payment', paymentSchema);
exports.default = Payment;
