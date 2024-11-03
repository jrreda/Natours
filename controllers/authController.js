const User = require('./../models/userModel');
const AppError = require('./../utils/appError');

exports.signup = async (req, res, next) => {
    const { name, email, password, passwordConfirm } = req.body;

    // validate inputs
    if (!name || !email || !password || !passwordConfirm) {
        return next(new AppError('Please provide all required fields', 400));
    }

    const newUser = await User.create(req.body);

    // send response
    res.status(201).json({
        message: 'success',
        data: {
            user: newUser
        }
    });
};
