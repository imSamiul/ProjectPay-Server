import express from 'express';
import passport from 'passport';
import {
  generateRefreshToken,
  handleLogin,
  handleLogout,
  handleSignUp,
} from '../controllers/auth.controller';
import { isAuthenticated } from '../middlewares/isAuthenticated';

// import { UserType } from '../types/userType';

const router = express.Router();

//@route POST /api/auth/signup
router.post('/signup', handleSignUp);
//@route POST /api/auth/login
router.post('/login', handleLogin);
//@route POST /api/auth/refresh_token
router.post('/refresh-token', generateRefreshToken);
//@route DELETE /api/auth/logout
router.post('/logout', handleLogout);
//@route GET /api/protected_resource
//@access to only authenticated users
router.get('/users/me', isAuthenticated, (req, res) => {
  return res.status(200).json({ user: req.user });
});

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
