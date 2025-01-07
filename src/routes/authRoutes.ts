import express from 'express';
import passport from 'passport';

import {
  createUserUsingForm,
  handleLogin,
  handleLogout,
} from '../controllers/authController';

import { ensureAuthenticated } from '../middlewares/passport-auth';
import { UserType } from '../types/userType';

const router = express.Router();

// signup route using form
router.post('/signup', createUserUsingForm);
// login route using form

router.post('/login', handleLogin);

// logout route
router.post('/logout', ensureAuthenticated, handleLogout);

// login with OAuth route
router.get(
  '/login',
  passport.authenticate('google', {
    scope: ['profile'],
  })
);

// callback route for google to redirect to
router.get(
  '/google/redirect',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const user = req.user as UserType;
    if (!user.role) {
      return res.redirect(
        `${process.env.FRONTEND_UR}/addOtherInfo?email=${user.email}`
      );
    }
    return res.redirect(`${process.env.FRONTEND_URL}`);
  }
);

export default router;
