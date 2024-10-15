import { Request, Response } from 'express';
import Project from '../model/projectModel';
import Payment from '../model/paymentModel';
import { PaymentType } from '../types/paymentType';

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

    const payment = new Payment<PaymentType>({
      paymentAmount,
      paymentMethod,
      transactionId,
      paymentDate,
      projectId: projectId,
    });
    await payment.save();
    if (project.due < paymentAmount) {
      return res
        .status(400)
        .send({ error: 'Payment amount exceeds due amount' });
    }

    project.due -= paymentAmount;
    project.paymentList.push(payment._id);
    await project.save();
    res.status(201).send({ payment, project });
  } catch (error) {
    res.status(400).send(error);
  }
}

// PATCH:

// DELETE:
