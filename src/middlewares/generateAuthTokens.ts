import { Request, Response } from 'express';

import User from '../models/user.model';
import { UserType } from '../types/userType';
import { generateJWT } from '../utils/auth';
import ms from 'ms';
import Token from '../models/token.model';

const {
  ACCESS_TOKEN_LIFE,
  REFRESH_TOKEN_LIFE,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} = process.env;

const dev = process.env.NODE_ENV?.trim() === 'development';

export async function generateAuthTokens(req: Request, res: Response) {
  console.log('Generating auth tokens');

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = (req.user as UserType)._id; // Now TypeScript knows _id exists on req.user
  try {
    const user = await User.findById(userId);

    const refreshToken = generateJWT(
      userId,
      REFRESH_TOKEN_SECRET as string,
      REFRESH_TOKEN_LIFE as string
    );

    const accessToken = generateJWT(
      userId,
      ACCESS_TOKEN_SECRET as string,
      ACCESS_TOKEN_LIFE as string
    );

    const token = {
      refreshToken,
      userId: userId,
      expirationTime: new Date(
        Date.now() + ms(REFRESH_TOKEN_LIFE as string)
      ).getTime(),
    };

    await Token.create(token);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: !dev,
      signed: true,
      expires: new Date(Date.now() + ms(REFRESH_TOKEN_LIFE as string)),
    });
    console.log(accessToken);

    const expiresAt = new Date(Date.now() + ms(ACCESS_TOKEN_LIFE as string));

    return res.status(200).json({
      user,
      token: accessToken,
      expiresAt,
    });
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).send({ message: errorMessage });
  }
}
