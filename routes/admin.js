import express from 'express';

const router = express.Router();

import { getTransactions, getAccountStatus, switchAccountStatus } from '../controllers/admin.js';
import isAuth from '../middleware/is-auth.js';
import isAdmin from '../middleware/is-admin.js';

router.get('/transactions', isAuth, isAdmin, getTransactions); // admin can check transactions of user i.e userId in body

router.get('/accounts', isAuth, isAdmin, getAccountStatus); // admin can check if an account is activated or deactivated

router.post('/accounts/manage', isAuth, isAdmin, switchAccountStatus); // admin can activate or deactivate any account

export default router;