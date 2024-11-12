import express, { Request, Response } from 'express';
import passport from 'passport';

import { createUserUsingForm } from '../controller/authController';
import { UserType } from '../types/userType';

const router = express.Router();

// signup route using form
router.post('/signup', createUserUsingForm);
// login route using form
router.post('/login', (req, res, next) => {
  console.log(req);

  passport.authenticate(
    'local',
    (err: Error, user: UserType, info: { message: string }) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      if (!user) {
        return res.status(400).json({ message: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        return res.status(200).json({ user });
      });
    }
  )(req, res, next);
});
// logout route

router.post('/logout', (req: Request, res: Response) => {
  // logout logic
  res.send('logout');
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
