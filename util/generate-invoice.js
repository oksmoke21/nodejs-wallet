import fs from 'fs';
import path from 'path';

import Transaction from '../models/transaction.js';
import __dirname from './dirname.js';

export default (req, res, next) => {
    const userId = req.userId;
    const filePath = path.join(__dirname, '../', 'data', 'invoice.txt');
    let transactions
    Transaction.find({user: userId})
    .sort({createdAt: -1})
    .select('-receiverBalance -user -updatedAt -__v')
    .then(transaction => {
        transactions = transaction.toString();
        // console.log(transactions);
        fs.writeFile(filePath, transactions, cb => {
            if(cb)
            {
                console.log(cb);
            }
            return res.json({
                message: 'Invoice successfully downloaded'
            })
        })
    })
}