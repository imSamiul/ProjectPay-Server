import { Request, Response } from 'express';

import bcrypt from 'bcrypt';
import ProjectManager from '../models/manager.model';
import Token from '../models/token.model';

import jwt from 'jsonwebtoken';
import ms from 'ms';
import { User } from '../types/user.type';
import UserModel from '../models/user.model';

// POST: Create a user using form
export async function handleSignUp(req: Request, res: Response) {
  const { userName, email, password, role } = req.body;
  if (!userName || !email || !password || !role) {
    return res.status(422).json({ message: 'Please fill all the fields' });
  }

  try {
    //check if username is already taken:
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is taken.' });
    } else {
      //create new user and generate a pair of tokens and send
      const newUser = new UserModel({
        userName,
        email,
        password,
        role,
      } as User);
      const savedUser = await newUser.save();
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
      const accessToken = await newUser.createAccessToken();
      const refreshToken = await newUser.createRefreshToken();

      const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE ?? '7d';
      const jwtCookieExpire = ms(refreshTokenLife); // Converts '7d' to milliseconds
      const options: {
        expires: Date;
        httpOnly: boolean;
        secure: boolean;
        sameSite: 'strict';
      } = {
        expires: new Date(Date.now() + jwtCookieExpire),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      };

      res.status(201).cookie('refreshToken', refreshToken, options).json({
        user: savedUser,
        accessToken,
      });
    }
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).send({ message: errorMessage });
  }
}

// POST: Login User using form
export async function handleLogin(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ message: 'Please fill all the fields' });
  }
  try {
    //check if user exists in database:
    const user = await UserModel.findOne({ email });
    //send error if no user found:
    if (!user) {
      return res.status(404).json({ error: 'No user found!' });
    } else {
      //check if password is valid:
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        //generate a pair of tokens if valid and send
        const accessToken = await user.createAccessToken();
        const refreshToken = await user.createRefreshToken();

        const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE ?? '7d';
        const jwtCookieExpire = ms(refreshTokenLife); // Converts '7d' to milliseconds
        const options: {
          expires: Date;
          httpOnly: boolean;
          secure: boolean;
          sameSite: 'strict';
        } = {
          expires: new Date(Date.now() + jwtCookieExpire),
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        };

        res.status(201).cookie('refreshToken', refreshToken, options).json({
          user,
          accessToken,
        });
      } else {
        //send error if password is invalid
        return res.status(401).json({ error: 'Invalid password!' });
      }
    }
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).send({ message: errorMessage });
  }
}

// POST: Logout user
export async function handleLogout(req: Request, res: Response) {
  try {
    // Get the refresh token from the cookie
    const refreshToken = req.cookies.refreshToken;

    // If no refresh token is found, send a success response (optional)
    if (!refreshToken) {
      return res.status(200).json({ message: 'Logged out successfully' });
    }

    // Find the user associated with the refresh token
    const token = await Token.findOneAndDelete({ refreshToken });

    // If no user is found, send an error response
    if (!token) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Clear the refresh token cookie
    res.clearCookie('refreshToken');

    // Send a success response
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    let errorMessage = 'Failed to logout';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).send({ message: errorMessage });
  }
}

// POST: Refresh token and fetch a new access token
export async function generateRefreshToken(req: Request, res: Response) {
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || '';
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || '';
  const accessTokenLife = process.env.ACCESS_TOKEN_LIFE || '10m';
  type TJwtPayload = { user: { _id: string; role: string } };

  try {
    //get refreshToken
    const refreshToken = req.cookies.refreshToken;
    //send error if no refreshToken is sent
    if (!refreshToken) {
      return res.status(403).json({ error: 'Access denied,token missing!' });
    } else {
      //query for the token to check if it is valid:
      const tokenDoc = await Token.findOne({ refreshToken });
      //send error if no token found:
      if (!tokenDoc) {
        return res.status(401).json({ error: 'Token expired!' });
      } else {
        //extract payload from refresh token and generate a new access token and send it
        const payload = jwt.verify(
          tokenDoc.refreshToken,
          refreshTokenSecret
        ) as TJwtPayload;
        const accessToken = jwt.sign(
          { user: payload.user },
          accessTokenSecret,
          {
            expiresIn: accessTokenLife,
          }
        );
        return res.status(200).json({ accessToken });
      }
    }
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(403).json({ message: errorMessage });
  }
}
