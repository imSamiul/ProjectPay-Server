"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPayment = addPayment;
exports.updatePayment = updatePayment;
exports.deletePayment = deletePayment;
const projectModel_1 = __importDefault(require("../model/projectModel"));
const paymentModel_1 = __importDefault(require("../model/paymentModel"));
// GET:
// POST:
// add payment for specific project and decrease the due amount
function addPayment(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { projectId, paymentAmount, paymentMethod, transactionId, paymentDate, } = req.body;
            const project = yield projectModel_1.default.findById(projectId);
            if (!project) {
                return res.status(404).send({ error: 'Project not found' });
            }
            const payment = new paymentModel_1.default({
                paymentAmount,
                paymentMethod,
                transactionId,
                paymentDate,
                projectId: projectId,
            });
            yield payment.save();
            if (project.due < paymentAmount) {
                return res
                    .status(400)
                    .send({ error: 'Payment amount exceeds due amount' });
            }
            project.due -= paymentAmount;
            project.totalPaid += paymentAmount;
            project.paymentList.push(payment._id);
            yield project.save();
            res.status(201).send({ payment, project });
        }
        catch (error) {
            res.status(400).send(error);
            console.log(error);
        }
    });
}
// PATCH: update payment details
function updatePayment(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const paymentId = req.params.paymentId;
        const { paymentAmount, paymentMethod, transactionId, paymentDate, projectId, } = req.body;
        try {
            const updatedPayment = yield paymentModel_1.default.findByIdAndUpdate({ _id: paymentId }, {
                paymentAmount,
                paymentMethod,
                transactionId,
                paymentDate,
                projectId,
            }, { new: true });
            if (!updatedPayment) {
                return res.status(404).send('Payment not found');
            }
            const existingProject = yield projectModel_1.default.findById(projectId);
            if (!existingProject) {
                return res.status(404).send('Project not found');
            }
            const updatedProject = yield existingProject.reCalculateAll();
            res.status(200).send({ updatedPayment, updatedProject });
        }
        catch (error) {
            res.status(500).send({
                message: error instanceof Error ? error.message : 'Failed to update payment',
            });
        }
    });
}
// DELETE: delete payment
function deletePayment(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const paymentId = req.params.paymentId;
        try {
            const payment = yield paymentModel_1.default.findByIdAndDelete(paymentId);
            if (!payment) {
                return res.status(404).send('Payment not found');
            }
            const project = yield projectModel_1.default.findById({ _id: payment.projectId });
            if (!project) {
                return res.status(404).send('Project not found');
            }
            const updatedProject = yield project.reCalculateAll();
            console.log(updatedProject);
            res.status(200).send({ payment, updatedProject });
        }
        catch (error) {
            res.status(500).send({
                message: error instanceof Error ? error.message : 'Failed to delete payment',
            });
        }
    });
}
