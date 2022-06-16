import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import User from '../models/user.js';
import mailer from '../util/mailer.js';

dotenv.config();

const transporter = mailer;

export const signup = (req, res, next) => { // users signup here
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        const error = new Error('Validation failed, errors in data entered');
        error.data = errors;
        throw error;
    }
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    User.find({email:email})
    .then(user => {
        if(user.length != 0) // checks if a user already exists with the given email id
        {
            const error = new Error('User with given email ID already exists');
            throw error;
        }
        return bcrypt.hash(password,12);
    })
    .then(hashedPassword => {
        const user = new User({
            name: name,
            email: email,
            password: hashedPassword,
            balance: 1000, // balance of INR 1000 is added to user's wallet on signup
            isActivated: true,
            isAdmin: false
        });
        return user.save();
    })
    .then(USER => {
        return transporter.sendMail({ // sends mail to user's email id on successful signup
            to: USER.email,
            from: 'Sigma Wallet <wallet@sigma-wallet.org>',
            subject: 'Sign-up successful',
            text: 'You have successfully signed up at Sigma Wallet. Please login and continue to enjoy our wallet services.'
        });
    })
    .then(USER => {
        return res.status(201).json({message: 'Signup successful'});
    })
    .catch(err => {
        console.log(err);
    });
}

export const login = (req, res, next) => { // users verify their credentials and login here
    const email = req.body.email;
    const password = req.body.password;
    let USER;
    User.findOne({email: email})
    .then(user => {
        if(!user)
        {
            const error = new Error('Cannot find user with given email ID');
            error.status = 401;
            throw error;
        }
        user.otp = null; // otp field in user database model set to null at every login attempt
        USER = user;
        return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
        if(!isEqual)
        {
            const otp = Math.floor(Math.random() * (Math.floor(999999) - Math.ceil(100000) + 1)) + Math.ceil(100000);
            console.log('OTP generated: ',otp);
            USER.otp = otp;
            return USER.save(); // sets otp to user database if passwords do NOT match
        }
        return USER; // returns user if passwords do match
    })
    .then(user => {
        if(user.otp) // checks if password is incorrect
        {
            return transporter.sendMail({
                to: user.email,
                from: 'Sigma Wallet <wallet@sigma-wallet.org>',
                subject: 'OTP for password recovery',
                text: `You have requested for a One-Time-Password (OTP) for recovery of your account at Sigma Wallet.
                Your One-Time-Password is ` + user.otp + `. Login and continue to enjoy our wallet services.`,
                otp: user.otp
            }); // for incorrect password i.e otp
        }
        return user.save(); // for correct password i.e jwt token
    })
    .then(result =>{
        if(!result.message)
        {
            const token = jwt.sign(
                {
                    email: USER.email,
                    userId: USER._id.toString()
                },
                `${process.env.JWT_SECRET_CODE}`,
                { expiresIn: '1h' }
            );
            return res.status(200).json({
                message: 'Logged in successfully',
                token: token,
                userId: USER._id.toString()
            });
        }
        return res.status(200).json({
            message: 'Logged in failed. Use OTP.'
        });
    })
    .catch(err => {
        console.log(err);
    });
}

export const otp = (req, res, next) => { // for user to log in via email & otp
    const otp = req.body.otp;
    const email = req.body.email;
    User.findOne({email: email})
    .then(USER => {
        if(!USER)
        {
            const error = new Error('Cannot find user with given email ID');
            error.status(401);
            throw error;
        }
        if(otp !== USER.otp)
        {
            const error = new Error('OTP is incorrect');
            throw error;
        }
        const token = jwt.sign(
            {
                email: USER.email,
                userId: USER._id.toString()
            },
            'thisisasuperlongsecretcodeforjwt',
            { expiresIn: '1h' }
        );
        return res.status(200).json({
            message: 'Logged in successfully',
            token: token,
            userId: USER._id.toString()
        });
    })
    .catch(err => {
        console.log(err);
    });
}