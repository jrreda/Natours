const AppError = require('./../utils/appError');

const handleCastErrorDB = error => {
    const message = `Invalid ${error.path}: ${error.value}.`;

    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = error => {
    const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use a unique value.`;

    return new AppError(message, 400);
};

const handleValidationErrorDB = error => {
    const errors = Object.values(error.errors).map(err => err.message);
    const message = errors.join('. ');
    return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (error, res) => {
    return res.status(error.statusCode).json({
        status: error.status,
        error: error,
        message: error.message,
        stack: error.stack
    });
};

const sendErrorProd = (error, res) => {
    // Operational, trusted error: send message to client
    if (error.isOperational) {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message
        });

        // Programming or other unknown error: don't leak error details
    } else {
        // 1) log the error
        console.error('Error 🔥:', error);

        // 2) send generic error message
        return res.status(error.statusCode || 500).json({
            status: 'error',
            message: 'Something went wrong, please try again later.'
        });
    }
};

module.exports = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(error, res);
    } else if (process.env.NODE_ENV === 'production') {
        let err = { ...error };

        if (err.name === 'CastError') err = handleCastErrorDB(err);
        if (err.code === 11000) err = handleDuplicateFieldsDB(err);
        if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
        if (err.name === 'JsonWebTokenError') err = handleJWTError();
        if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();

        sendErrorProd(err, res);
    }
};
