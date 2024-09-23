import express from 'express';
import { createUser, loginUser } from '../controller/userController';

const router = express.Router();

router.post('/user/signUp', createUser);
router.post('/user/login', loginUser);

export default router;
