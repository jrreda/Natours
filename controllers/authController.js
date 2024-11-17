const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

// create sign jwt token
const signToken = id => {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });

    return token;
};

exports.signup = catchAsync(async (req, res, next) => {
    // get user's credentials from request body
    const { name, email, password, passwordConfirm } = req.body;

    // validate inputs
    if (!name || !email || !password || !passwordConfirm) {
        return next(new AppError('Please provide all required fields', 400));
    }

    // create a new user
    const newUser = await User.create(req.body);

    // create JWT token
    const token = signToken(newUser._id);

    // send response
    res.status(201).json({
        message: 'success',
        token,
        data: {
            user: newUser
        }
    });
});

exports.login = catchAsync(async (req, res, next) => {
    // get user's credentials from request body
    const { email, password } = req.body;

    // validate inputs
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    // check if user exists and password is correct [+ because the password has a select: false property]
    const user = await User.findOne({ email }).select('+password');

    // check if user exists and password is correct
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Invalid email or password', 401));
    }

    // create JWT token
    const token = signToken(user._id);

    // send response
    res.json({
        message: 'success',
        token
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    // get token from request header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // check if token exists
    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    // check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please log in again.', 401));
    }

    // grant access to protected route
    req.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin', 'lead-guide']. role='user'
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
