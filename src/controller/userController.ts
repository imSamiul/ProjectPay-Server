import { Request, Response } from 'express';
import Client from '../model/clientModel';
import ProjectManager from '../model/managerModel';
import User from '../model/userModel';

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
    res.status(200).json({ user: req.user });
  } catch (error) {
    let errorMessage = 'Failed to load the client list';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ message: errorMessage });
  }
}

// POST: Create a new client
export const createUser = async (req: Request, res: Response) => {
  const { name, email, phone, password, userType } = req.body;
  console.log(req.body);

  try {
    let newUser;

    switch (userType) {
      case 'client':
        newUser = new Client({
          name,
          email,
          phone,
          password,
        });
        break;
      case 'project manager':
        newUser = new ProjectManager({
          name,
          email,
          phone,
          password,
        });

        break;
      default:
        return res.status(400).json({ message: 'Invalid user type' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    if (!newUser) {
      return res.status(500).json({ message: 'Failed to create user' });
    }
    const token = await newUser.generateAuthToken();
    if (!token) {
      return res.status(500).json({ message: 'Failed to generate token' });
    }
    const savedUser = await newUser.save();
    res.status(201).json({ user: savedUser, token });
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ message: errorMessage });
  }
};

// Login User
export async function loginUser(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    const loginSuccessful = await User.findByCredentials(email, password);
    if (!loginSuccessful) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const token = await loginSuccessful.generateAuthToken();
    res.status(201).json({ user: loginSuccessful, token });
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ message: errorMessage });
  }
}
// Logout User
export async function logOutUser(req: Request, res: Response) {
  try {
    const checkIfTokenExists = req.user!.tokens.find((token) => {
      return token.token === req.token;
    });
    if (!checkIfTokenExists) {
      throw new Error('Token does not exist');
    }

    req.user!.tokens = req.user!.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user!.save();
    res.status(200).json('Logged out successfully');
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ message: errorMessage });
  }
}

// PATCH:

// DELETE:
