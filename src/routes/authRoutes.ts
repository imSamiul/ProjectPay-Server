import express from 'express';
import passport from 'passport';

import {
  createUserUsingForm,
  handleLogin,
  handleLogout,
  handleRefreshToken,
} from '../controllers/authController';
import auth from '../middlewares/auth';

// import { UserType } from '../types/userType';

const router = express.Router();

router.post('/signup', createUserUsingForm);
router.post('/login', handleLogin);
router.post('/logout', auth, handleLogout);
router.post('/refresh-token', handleRefreshToken);

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
