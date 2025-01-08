import { Request, Response } from 'express';

import User from '../models/user.model';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from '../utils/token';
import bcrypt from 'bcrypt';
import ProjectManager from '../models/manager.model';

// POST: Create a user using form
export async function createUserUsingForm(req: Request, res: Response) {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'User already exist with this email' });
    }

    const newUser = new User({
      userName: name,
      email,
      password,
      roles: [...role],
    });
    await newUser.save();
    if (role === 'project_manager') {
      const existingProjectManager = await ProjectManager.findOne({
        userId: newUser._id,
      });
      if (existingProjectManager) {
        return res.status(400).json({
          message: 'Project Manager already exist with this email',
        });
      }
      const newProjectManager = new ProjectManager({
        userId: newUser._id,
      });
      await newProjectManager.save();
    }
    // TODO: another if statement for client

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.status(201).json({ user: newUser, accessToken });
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ message: errorMessage });
  }
}

// POST: Login User using form
export async function handleLogin(req: Request, res: Response) {
  const { email, password } = req.body;
  console.log(email, password);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(isPasswordValid);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.status(200).json({ accessToken });
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ message: errorMessage });
  }
}

// POST: Logout user
export async function handleLogout(req: Request, res: Response) {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });
  res.status(200).json({ message: 'Logged out successfully' });
}

// POST: Refresh token and fetch a new access token
export async function handleRefreshToken(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(403).json({ message: 'Refresh token not found' });
  }

  try {
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET as string;
    const id = verifyToken(refreshToken, refreshTokenSecret);
    const user = await User.findById({ _id: id });
    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }
    const newAccessToken = generateAccessToken({
      _id: user._id,
      roles: user.roles,
    });

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(403).json({ message: errorMessage });
  }
}
