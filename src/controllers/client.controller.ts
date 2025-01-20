import { Request, Response } from 'express';
import ClientModel from '../models/client.model';

// GET: Search for a client
export const searchClient = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    const clients = await ClientModel.find({
      name: { $regex: search, $options: 'i' },
    });
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
