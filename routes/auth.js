import express from 'express';
import { body } from 'express-validator';

import { login, otp, signup } from '../controllers/auth.js';

const router = express.Router();

router.put('/signup', [
    body('email').isEmail().normalizeEmail(),
    body('password').trim().isLength({min: 5}),
    body('password').trim().notEmpty()
], signup); // put method, not post

router.post('/login', login);

router.post('/otp', otp);

export default router;