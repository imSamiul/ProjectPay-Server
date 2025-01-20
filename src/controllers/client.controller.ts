import { Request, Response } from 'express';
import ClientModel from '../models/client.model';

// GET: Search for a client
export const searchClient = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    const clients = await ClientModel.find({
      email: { $regex: new RegExp(email as string, 'i') },
    });
    res.status(200).json(clients);
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).send({ message: errorMessage });
  }
};
