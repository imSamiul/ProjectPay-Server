import { Request, Response } from 'express';
import Client from '../models/client.model';
import UserModel from '../models/user.model';
import { User } from '../types/user.type';

// GET: Get all clients
export async function getClientList(req: Request, res: Response) {
  try {
    const clientsList = await Client.find();
    res.status(200).json({ clientsList });
  } catch (error) {
    let errorMessage = 'Failed to load the client list';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).json({ message: errorMessage });
  }
}
// GET: Get the user details
export async function getUserDetails(req: Request, res: Response) {
  try {
    const user = req.user;

    const findUser = await UserModel.findById((user as User)._id);

    if (!user) {
      return res.status(200).json({ user: null });
    }
    res.status(200).json({ user: findUser });
  } catch (error) {
    let errorMessage = 'Failed to load the client list';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ message: errorMessage });
  }
}

// PATCH:

// DELETE:
