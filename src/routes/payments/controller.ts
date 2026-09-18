import { Request, Response, NextFunction } from "express";
import * as paymentsService from "../../services/payments-service";

export async function addPayment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await paymentsService.addPayment(
      String(req.user!._id),
      req.body,
    );
    res.status(201).send(result);
  } catch (error) {
    next(error);
  }
}

export async function updatePayment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await paymentsService.updatePayment(
      String(req.user!._id),
      req.params.paymentId,
      req.body,
    );
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
}

export async function deletePayment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await paymentsService.deletePayment(
      String(req.user!._id),
      req.params.paymentId,
    );
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
}
