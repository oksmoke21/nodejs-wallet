import User from '../models/user.js';

export default (req, res, next) => {
    const userId = req.userId;
    User.findById(userId)
    .then(user => {
        if(!user.isAdmin)
        {
            return res.json({
                message: 'Cannot proceed. User does not have admin privileges.'
            })
        }
        next();
    })
}