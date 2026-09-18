import Project from "../models/project-model";
import Payment from "../models/payment-model";
import { PaymentType } from "../types/payment-type";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../utils/app-error";

async function getOwnedProject(projectId: string, managerId: string) {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError("Project");
  }
  if (String(project.projectManager) !== String(managerId)) {
    throw new ForbiddenError("You do not own this project");
  }
  return project;
}

export async function addPayment(
  managerId: string,
  input: {
    projectId: string;
    paymentAmount: number;
    paymentMethod: string;
    transactionId: string;
    paymentDate: Date;
  },
) {
  const project = await getOwnedProject(input.projectId, managerId);

  if (project.due < input.paymentAmount) {
    throw new BadRequestError("Payment amount exceeds due amount");
  }

  const payment = new Payment({
    paymentAmount: input.paymentAmount,
    paymentMethod: input.paymentMethod,
    transactionId: input.transactionId,
    paymentDate: input.paymentDate,
    projectId: project._id,
  } as PaymentType);
  await payment.save();

  project.due -= input.paymentAmount;
  project.totalPaid += input.paymentAmount;
  project.paymentList.push(payment._id);
  await project.save();

  return { payment, project };
}

export async function updatePayment(
  managerId: string,
  paymentId: string,
  input: {
    projectId: string;
    paymentAmount: number;
    paymentMethod: string;
    transactionId: string;
    paymentDate: Date;
  },
) {
  const project = await getOwnedProject(input.projectId, managerId);

  const updatedPayment = await Payment.findOneAndUpdate(
    { _id: paymentId, projectId: project._id },
    {
      paymentAmount: input.paymentAmount,
      paymentMethod: input.paymentMethod,
      transactionId: input.transactionId,
      paymentDate: input.paymentDate,
      projectId: project._id,
    },
    { new: true },
  );

  if (!updatedPayment) {
    throw new NotFoundError("Payment");
  }

  const updatedProject = await project.reCalculateAll();
  return { updatedPayment, updatedProject };
}

export async function deletePayment(managerId: string, paymentId: string) {
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new NotFoundError("Payment");
  }

  const project = await getOwnedProject(String(payment.projectId), managerId);

  await Payment.deleteOne({ _id: paymentId });
  await Project.findByIdAndUpdate(project._id, {
    $pull: { paymentList: payment._id },
  });

  const freshProject = await Project.findById(project._id);
  if (!freshProject) {
    throw new NotFoundError("Project");
  }

  const updatedProject = await freshProject.reCalculateAll();
  return { payment, updatedProject };
}
