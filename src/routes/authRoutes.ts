import express, { Request, Response } from 'express';
import passport from 'passport';

import { createUserUsingForm } from '../controller/authController';
import { UserInstanceType } from '../types/userType';
import { ensureAuthenticated } from '../middleware/passport-auth';

const router = express.Router();

// signup route using form
router.post('/signup', createUserUsingForm);
// login route using form

router.post('/login', (req, res, next) => {
  passport.authenticate(
    'local',
    async (err: Error, user: UserInstanceType, info: { message: string }) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      if (!user) {
        return res.status(400).json({ message: info.message });
      }

      // Log the user in
      req.logIn(user, async (err) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }

        try {
          // Generate an auth token
          const token = await user.generateAuthToken();

          // Return user info and token to the client
          return res.status(200).json({ user, token });
        } catch (error) {
          let errorMessage = 'Failed to do something exceptional';
          if (error instanceof Error) {
            errorMessage = error.message;
          }

          res.status(500).json({ message: errorMessage });
        }
      });
    }
  )(req, res, next);
});

// logout route
router.post('/logout', ensureAuthenticated, (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    res.status(200).json({ message: 'logout successful' });
  });
});

// login with OAuth route
router.get(
  '/login',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// callback route for google to redirect to
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
  res.redirect('http://localhost:5173/');
});

export default router;
