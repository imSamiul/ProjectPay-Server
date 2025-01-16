import { Request, Response } from 'express';

import Project from '../models/project.model';

import { Payment } from '../types/payment.type';
import PaymentModel from '../models/payment.model';
import ProjectModel from '../models/project.model';

// GET:

// POST:
// add payment for specific project and decrease the due amount
export async function addPayment(req: Request, res: Response) {
  try {
    const {
      projectId,
      paymentAmount,
      paymentMethod,
      transactionId,
      paymentDate,
    } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).send({ error: 'Project not found' });
    }
    if (project.due < paymentAmount) {
      return res
        .status(400)
        .send({ error: 'Payment amount exceeds due amount' });
    }

    const payment = new PaymentModel<Payment>({
      paymentAmount,
      paymentMethod,
      transactionId,
      paymentDate,
      projectId: projectId,
    });

    project.due -= paymentAmount;
    project.totalPaid += paymentAmount;
    project.paymentList.push(payment._id);

    const isProjectSaved = await project.save();
    if (isProjectSaved) {
      await payment.save();
    }

    res.status(201).send({ payment, project });
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).send({ message: errorMessage });
  }
}

// PATCH: update payment details
export async function updatePayment(req: Request, res: Response) {
  const paymentId = req.params.paymentId;
  const {
    paymentAmount,
    paymentMethod,
    transactionId,
    paymentDate,
    projectId,
  } = req.body;
  try {
    const existingProject = await ProjectModel.findById(projectId);
    if (!existingProject) {
      return res.status(404).send('Project not found');
    }
    const updatedPayment = await PaymentModel.findByIdAndUpdate(
      { _id: paymentId },
      {
        paymentAmount,
        paymentMethod,
        transactionId,
        paymentDate,
        projectId,
      },
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).send('Payment not found');
    }

    const updatedProject = await existingProject.recalculateAll();
    res.status(200).send({ updatedPayment, updatedProject });
  } catch (error) {
    res.status(500).send({
      message:
        error instanceof Error ? error.message : 'Failed to update payment',
    });
  }
}

// DELETE: delete payment
export async function deletePayment(req: Request, res: Response) {
  const paymentId = req.params.paymentId;
  try {
    const payment = await Payment.findByIdAndDelete(paymentId);
    if (!payment) {
      return res.status(404).send('Payment not found');
    }
    const project = await Project.findById({ _id: payment.projectId });
    if (!project) {
      return res.status(404).send('Project not found');
    }

    const updatedProject = await project.reCalculateAll();
    console.log(updatedProject);

    res.status(200).send({ payment, updatedProject });
  } catch (error) {
    res.status(500).send({
      message:
        error instanceof Error ? error.message : 'Failed to delete payment',
    });
  }
}
