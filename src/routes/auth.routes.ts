import express from 'express';

import {
  generateRefreshToken,
  handleAddRole,
  handleLogin,
  handleLogout,
  handleSignUp,
} from '../controllers/auth.controller';

import passport from 'passport';
import { User } from '../types/user.type';
import UserModel from '../models/user.model';
import ms from 'ms';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/signup', handleSignUp);
router.post('/login', handleLogin);
router.post('/refresh-token', generateRefreshToken);
router.post('/logout', handleLogout);

// login with OAuth route
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// callback route for google to redirect to
router.get(
  '/google/redirect',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    const user = req.user as User;
    const googleIdSecret = process.env.GOOGLE_ID_SECRET;
    if (!googleIdSecret) {
      return res.status(500).json({ message: 'Google ID secret not found' });
    }
    const googleId = jwt.sign({ googleId: user.googleId }, googleIdSecret);
    if (!user.role) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/signup/addOtherInfo?email=${user.email}&googleId=${googleId}`
      );
    }
    const foundUser = await UserModel.findOne({ email: user.email });
    if (!foundUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    const accessToken = await foundUser.createAccessToken();
    const refreshToken = await foundUser.createRefreshToken();
    const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE ?? '7d';
    const jwtCookieExpire = ms(refreshTokenLife); // Converts '7d' to milliseconds
    res.cookie('refreshToken', refreshToken, {
      expires: new Date(Date.now() + jwtCookieExpire),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return res.redirect(
      `${process.env.FRONTEND_URL}/signUp/OAuthSuccess?accessToken=${accessToken}`
    );
  }
);
router.post('/addRole', handleAddRole);
export default router;
