import User from '../models/user.js';
import Transaction from '../models/transaction.js';
import mailer from '../util/mailer.js';

const transporter = mailer;

export function getTransactions(req, res, next) { // admin can retrieve transaction details of any user 
    const userId = req.body.userId; // id of the user who is being investigated by admin. admin's account's userId is stored in req.userId
    Transaction.find({user: userId})
    .sort({createdAt: -1})
    .then(transactions => {
        res.status(200).json({ 
            message: 'Transactions fetched successfully', 
            transactions: transactions, 
        });
    })
    .catch(err=>console.log(err));
}

export function getAccountStatus(req, res, next) { // admin can see if an account is currently activated or deactivated
    const userId = req.body.userId;
    User.findById(userId)
    .then(user => {
        if(user.isActivated == true)
        {
            return res.json({
                message: 'Account is activated'
            });
        }
        else
        {
            return res.json({
                message: 'Account is deactivated'
            });
        }
    })
    .catch(err=>console.log(err));
}

export function switchAccountStatus(req, res, next) { // flips account activation status of account targeted by admin
    const userId = req.body.userId;
    let accountStatus;
    User.findById(userId)
    .then(user => {
        accountStatus = user.isActivated;
        if(accountStatus == true)
        {
            accountStatus = false;
        }
        else
        {
            accountStatus = true;
        }
        user.isActivated = accountStatus;
        return user.save();
        })
    .then(user => {
        return transporter.sendMail({ // sends mail to user stating their account has been activaed/deactivated
            to: user.email,
            from: 'Sigma Wallet <wallet@sigma-wallet.org>',
            subject: `Your account has been ${(accountStatus==true? 'activated' : 'deactivated')}`,
            text: `Your account has been ${(accountStatus==true? 'activated' : 'deactivated')}. Please contact the admin for help.`,
        });
    })
    .then(result => {
            return res.json({
            message: `Account status switched successfully. Account active: ${accountStatus}.` 
        })
    })
    .catch(err => console.log(err));
}