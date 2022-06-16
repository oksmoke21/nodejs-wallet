import User from '../models/user.js';

export default (req, res, next) => {
    const userId = req.userId;
    User.findById(userId)
    .then(user => {
        if(!user.isActivated)
        {
            return res.json({
                message: 'User account is deactivated. Contact admin to request account status change.'
            })
        }
        next();
    })
}