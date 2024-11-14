import express from 'express';
import passport from 'passport';

import {
  createUserUsingForm,
  handleLogin,
  handleLogout,
} from '../controllers/authController';

import { ensureAuthenticated } from '../middlewares/passport-auth';

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
    scope: ['profile', 'email'],
  })
);

// callback route for google to redirect to
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
  res.redirect('http://localhost:5173/');
});

export default router;
