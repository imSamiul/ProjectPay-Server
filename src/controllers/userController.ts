import { Request, Response } from 'express';

import { UserType } from '../types/userType';
import Client from '../models/client.model';
import ProjectManager from '../models/manager.model';
import User from '../models/user.model';

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
    console.log(error);
  }
}
// GET: Get the user details
export async function getUserDetails(req: Request, res: Response) {
  try {
    const user = req.user as UserType | null;
    if (!user) {
      return res.status(200).json({ user: null });
    }
    res.status(200).json({ user });
  } catch (error) {
    let errorMessage = 'Failed to load the client list';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ message: errorMessage });
    console.log(error);
  }
}

// POST: Add user other info
export async function addUserOtherInfo(req: Request, res: Response) {
  try {
    const user = req.user;
    const { phone, role } = req.body;

    if (!user) {
      throw new Error('User not found');
    }
    if (role === 'client') {
      const client = new Client({
        clientPhone: phone,
        userId: (user as UserType)._id,
      });
      await client.save();
    }
    if (role === 'project_manager') {
      const projectManager = new ProjectManager({
        managerPhone: phone,
        userId: (user as UserType)._id,
      });
      await projectManager.save();
    }
    const updateUserRole = await User.findByIdAndUpdate(
      (user as UserType)._id,
      { role },
      { new: true }
    );
    if (!updateUserRole) {
      throw new Error('User role not updated');
    }
    const token = await updateUserRole.generateAuthToken();

    res.status(200).json({ user: updateUserRole, token });
  } catch (error) {
    let errorMessage = 'Failed to add user other info';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ message: errorMessage });
    console.log(error);
  }
}

// PATCH:

// DELETE:
