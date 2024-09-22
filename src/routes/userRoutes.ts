import express from 'express';
import { createUser, getClientList } from '../controller/userController';

const router = express.Router();

router.route('/user').post(createUser).get(getClientList);

export default router;
