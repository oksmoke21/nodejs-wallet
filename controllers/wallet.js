import Transaction from '../models/transaction.js';
import User from '../models/user.js';
import mailer from '../util/mailer.js';

const transporter = mailer;

export const getTransactions = (req, res, next) => { // displays previous transactions to user
    const userId = req.userId;
    Transaction.find({user: userId})
    .sort({createdAt: -1})
    .select('-receiverBalance -user -updatedAt -_id -__v')  // exclude certain data that user does not need to see, like receiver's account balance
    .then(transactions => {
        res.status(200).json({ 
            message: 'Posts fetched successfully', 
            transactions: transactions, 
        });
    })
    .catch(err=>console.log(err));
}

export const payMoney = (req, res, next) => { // money transfer from logged-in sender to receiver
    const userId = req.userId;
    const senderId = userId;
    const receiverId = req.body.receiver;
    const message = req.body.message;
    const amount = req.body.amount;
    let senderObject;
    let receiverObject;
    let senderBalance;
    let receiverBalance;
    let transactionId;
    User.findById(senderId)
    .then(sender => {
        senderObject = sender;
        senderBalance = senderObject.balance;
        if(senderBalance<amount) // checks if sender has sufficient balance in acc
        {
            return res.json({
                message: 'Insufficient balance in wallet. Please add funds at "/add-money" and retry'
            })
        }
        return User.findById(receiverId);
    })
    .then(receiver => { // checks if receiver account with given id exists
        if(!receiver)
        {
            const error = new Error('No account with given user ID found');
            error.status = 401;
            throw error;
        }
        if(!receiver.isActivated) // checks if receiver account is activated/deactivated by admin
        {
            const error = new Error('The receiver account is deactivated. Cannot transfer funds.');
            res.json({
                message: 'The receiver account is deactivated. Cannot transfer funds.'
            });
            throw error;
        }
        receiverObject = receiver;
        senderBalance = senderBalance - amount;
        senderObject.balance = senderBalance;
        receiverBalance = receiverObject.balance + amount;
        receiverObject.balance = receiverBalance; // money transfer from sender to receiver
        const transaction = new Transaction({
            amount: amount,
            sender: senderId,
            receiver: receiverId,
            user: userId,
            senderBalance: senderBalance,
            receiverBalance: receiverBalance
        });
        return transaction.save();
    })
    .then(transactionResult => { // stores transaction details in user model of sender and receiver
        transactionId = transactionResult._id;
        senderObject.transaction.push(transactionResult);
        receiverObject.transaction.push(transactionResult);
        receiverObject.save();
        return senderObject.save();
    })
    .then(resultSenderObject => {
        transporter.sendMail({
            to: senderObject.email, // mail to money sender
            from: 'Sigma Wallet <wallet@sigma-wallet.org>',
            subject: 'Transaction success',
            text: 'Your transaction of INR ' + amount + ' was successful. Your transaction ID is ' + transactionId,
        });
        transporter.sendMail({
            to: receiverObject.email, // mail to money receiver
            from: 'Sigma Wallet <wallet@sigma-wallet.org>',
            subject: 'INR ' + amount + ' added to your wallet',
            text: 'Your deposit of INR ' + amount + ' was successful. Your transaction ID is ' + transactionId,
        });
        return res.json({
            message: "Amount transferred successfully: " + message,
            amount: amount,
            senderBalance: senderBalance
        })
    })
    .catch(err=>{
        console.log(err);
        transporter.sendMail({
            to: senderObject.email, // transaction failure mail to money sender
            from: 'Sigma Wallet <wallet@sigma-wallet.org>',
            subject: 'Transaction failed',
            text: 'Your transaction of INR ' + amount + ' failed. Please try again.'
        });
    })
}

export const addMoney = (req, res, next) => { // adding money to user wallet
    const userId = req.userId;
    const amount = req.body.amount;
    User.findById(userId)
    .then(user => {
        user.balance += amount;
        return user.save();
    })
    .then(result => {
        return res.json({
            message: "Added amount to wallet succesfully",
            balance: result.balance
        });
    })
    .catch(err=>console.log(err));
}