import { NextFunction, Request, Response } from 'express';
import User from '../models/user.model';
import ms from 'ms';
import bcrypt from 'bcrypt';
import ProjectManager from '../models/manager.model';
import Token from '../models/token.model';
import { clearTokens, generateJWT, verifyToken } from '../utils/auth';
import { UserType } from '../types/userType';

// POST: Create a user using form
export async function handleSignUp(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(422).json({ message: 'Please fill all the fields' });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(422)
        .json({ message: 'User already exist with this email' });
    }

    const newUser = new User({
      userName: name,
      email,
      password,
      role,
    } as UserType);
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
    req.user = newUser;
    return next();
  } catch (error) {
    return next(error);
  }
}

// POST: Login User using form
export async function handleLogin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ message: 'Please fill all the fields' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    req.user = user;

    return next();
  } catch (error) {
    return next(error);
  }
}

// POST: Logout user
export async function handleLogout(req: Request, res: Response) {
  try {
    await clearTokens(req, res);
    if (!res.headersSent) {
      return res.status(200).json({ message: 'Logged out successfully' });
    }
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(403).json({ message: errorMessage });
  }
}
// POST: Refresh token and fetch a new access token
export async function handleRefreshAccessToken(req: Request, res: Response) {
  const { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET, ACCESS_TOKEN_LIFE } =
    process.env;

  const { signedCookies } = req;
  const { refreshToken } = signedCookies;

  if (!refreshToken) {
    return res.status(204).json({ message: 'Refresh token not found' });
  }

  try {
    const refreshTokenInDb = await Token.findOne({
      refreshToken,
    });

    if (!refreshTokenInDb) {
      await clearTokens(req, res);
      throw new Error('Token not found in database');
    }

    const id = verifyToken(refreshToken, REFRESH_TOKEN_SECRET as string);
    const user = await User.findById({ _id: id });
    if (!user) {
      await clearTokens(req, res);
      throw new Error('User not found');
    }
    const newAccessToken = generateJWT(
      user._id,
      ACCESS_TOKEN_SECRET as string,
      ACCESS_TOKEN_LIFE as string
    );

    res.status(200).json({
      user,
      token: newAccessToken,
      expiresAt: new Date(Date.now() + ms(ACCESS_TOKEN_LIFE as string)),
    });
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(403).json({ message: errorMessage });
  }
}
