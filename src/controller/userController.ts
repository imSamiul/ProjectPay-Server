import { Request, Response } from 'express';
import Client from '../model/clientModel';
import ProjectManager from '../model/managerModel';
import User from '../model/userModel';

// POST:
// Create a new client
export const createUser = async (req: Request, res: Response) => {
  const { name, email, phone, password, userType } = req.body;

  try {
    let newUser;

    switch (userType) {
      case 'Client':
        newUser = new Client({
          name,
          email,
          phone,
          password,
        });
        break;
      case 'Project Manager':
        newUser = new ProjectManager({
          name,
          email,
          phone,
          password,
        });

        break;
      default:
        return res.status(400).send('Invalid user type');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('Email already exists');
    }

    if (!newUser) {
      return res.status(500).send('Failed to create user');
    }
    const savedClient = await newUser.save();
    res.status(201).send({ savedClient });
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).send({ message: errorMessage });
  }
};

// GET:

// Get all clients
export async function getClientList(req: Request, res: Response) {
  try {
    const clientsList = await Client.find();
    res.status(200).send({ clientsList });
  } catch (error) {
    let errorMessage = 'Failed to load the client list';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).send({ message: errorMessage });
  }
}
