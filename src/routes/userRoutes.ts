import express from 'express';
import {
  createUser,
  getUserDetails,
  loginUser,
  logOutUser,
} from '../controller/userController';
import auth from '../middleware/auth';

const router = express.Router();

router.post('/user/signUp', createUser);
router.post('/user/login', loginUser);
router.post('/user/logout', auth, logOutUser);
router.get('/user/me', auth, getUserDetails);

export default router;
