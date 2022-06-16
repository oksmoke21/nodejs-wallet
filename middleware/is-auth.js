import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export default (req, res, next) => {
    const authToken = req.get('Authorization');
    if(!authToken)
    {
        const error = new Error('User not authenticated (authorization header not present)');
        error.status = 401;
        throw error;
    }
    const token = authToken.split(' ')[1];
    let decodedToken;
    try{
        decodedToken = jwt.verify(token, `${process.env.JWT_SECRET_CODE}`);
    }
    catch(err){
        err.status = 500;
        throw err;
    }
    if(!decodedToken)
    {
        const error = new Error('Not authenticated');
        error.status = 401;
        throw error;
    }
    req.userId = decodedToken.userId;
    next();
}