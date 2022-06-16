import express from 'express';

import isAuth from '../middleware/is-auth.js';
import isActivated from '../middleware/is-activated.js';
import { getTransactions, addMoney, payMoney } from '../controllers/wallet.js';
import invoiceGenerator from '../util/generate-invoice.js';

const router = express.Router();

router.get('/transactions', isAuth, isActivated, getTransactions);

router.post('/add-money', isAuth, isActivated, addMoney);

router.post('/pay', isAuth, isActivated, payMoney);

router.get('/invoice', isAuth, isActivated, invoiceGenerator);

export default router;