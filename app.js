import express from 'express';
import walletRoutes from './routes/wallet.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.oyp4k.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

const app = express();

app.use(bodyParser.json({
    extended: true
}));

app.use((req, res, next) => { // set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(walletRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

app.use((error, req, res, next) => { // error handling middleware
    console.log('Errors: ', error);
    const statusCode = error.status || 500;
    const message = error.message;
    const data = error.data;
    res.status(statusCode).json({
        message: message,
        data: data
    })
});

mongoose.connect(MONGODB_URI) // sets connection to mongodb database via mongoose
    .then(result=> {
        app.listen(process.env.PORT || 5000); // set
    })
    .catch(err=>{
        console.log(err)
    });