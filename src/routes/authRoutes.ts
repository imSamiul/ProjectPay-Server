import express from 'express';
import passport from 'passport';

import {
  handleLogin,
  handleLogout,
  handleRefreshAccessToken,
  handleSignUp,
} from '../controllers/authController';
import { generateAuthTokens } from '../middlewares/generateAuthTokens';
import { isAuthenticated } from '../middlewares/isAuthenticated';

// import { UserType } from '../types/userType';

const router = express.Router();

router.post('/signup', handleSignUp, generateAuthTokens);
router.post('/login', handleLogin, generateAuthTokens);
router.post('/logout', isAuthenticated, handleLogout);
router.get('/refresh-token', handleRefreshAccessToken);

// login with OAuth route
router.get(
  '/OAuthLogin',
  passport.authenticate('google', {
    scope: ['profile'],
  })
);

// callback route for google to redirect to
// router.get(
//   '/google/redirect',
//   passport.authenticate('google', { session: false }),
//   (req, res) => {
//     const user = req.user as UserType;
//     if (!user.role) {
//       return res.redirect(
//         `${process.env.FRONTEND_UR}/addOtherInfo?email=${user.email}`
//       );
//     }
//     return res.redirect(`${process.env.FRONTEND_URL}`);
//   }
// );

export default router;
