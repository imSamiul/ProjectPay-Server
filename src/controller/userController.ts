import { Request, Response } from 'express';
import Client from '../model/clientModel';
import ProjectManager from '../model/managerModel';
import User from '../model/userModel';

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
// Get the user details
export async function getUserDetails(req: Request, res: Response) {
  try {
    res.status(200).send({ user: req.user });
  } catch (error) {
    let errorMessage = 'Failed to load the client list';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).send({ message: errorMessage });
  }
}

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
    const token = await newUser.generateAuthToken();
    if (!token) {
      return res.status(500).send('Failed to generate token');
    }
    const savedUser = await newUser.save();
    res.status(201).send({ user: savedUser, token });
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).send({ message: errorMessage });
  }
};

// Login User
export async function loginUser(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    const loginSuccessful = await User.findByCredentials(email, password);
    if (!loginSuccessful) {
      return res.status(400).send('Invalid email or password');
    }
    const token = await loginSuccessful.generateAuthToken();
    res.status(201).send({ user: loginSuccessful, token });
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).send({ message: errorMessage });
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
    res.status(200).send('Logged out successfully');
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).send({ message: errorMessage });
  }
}

// PATCH:

// DELETE:
