import { Request, Response } from 'express';

import { SignUpFormType } from '../types/userType';
import User from '../model/user.model';
import passport from 'passport';
import jwt from 'jsonwebtoken';

// POST: Create a user using form
export async function createUserUsingForm(req: Request, res: Response) {
  const { email, password, name } = req.body;
  const secret = process.env.TEMPORARY_TOKEN;
  if (!secret) {
    return res.status(500).json({ message: 'Temporary token is not defined' });
  }
  const temporaryToken = jwt.sign({ email }, secret, {
    expiresIn: '5m',
  });

  try {
    const existingUser = await User.findOne({ email });
    // Case 1: User already exists
    if (existingUser) {
      // Check if the user is already logged in (i.e., a session exists)
      if (req.isAuthenticated()) {
        // User is logged in but hasn't completed the profile
        if (!existingUser?.role) {
          return res.status(208).json({
            message: 'User already registered. Please add other info.',
            temporaryToken,
          });
        }
        // User is fully registered
        return res
          .status(400)
          .json({ message: 'User already exist with this email' });
      }

      // Case 2: User exists but no session, login the user
      if (!existingUser?.role) {
        // Log the user in without creating a new session if they are already authenticated
        req.login(existingUser, (err) => {
          if (err) {
            return res.status(500).json({ message: err.message });
          }
          return res.status(208).json({
            message: 'User needs to add additional info',
            temporaryToken,
          });
        });
        return;
      }
    }
    // Case 3: New user registration
    const newUser = new User<SignUpFormType>({
      name,
      email,
      password,
    });

    const savedUser = await newUser.save();
    req.login(savedUser, (err) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }

      passport.authenticate('local')(req, res, () => {
        return res.status(200).json({ temporaryToken });
      });
    });
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ message: errorMessage });
  }
}

// POST: Login User using form
