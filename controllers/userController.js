const User = require('./../models/userModel');

// get all users
exports.getAllUsers = async (req, res) => {
    const users = await User.find();

    res.status(500).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    });
};
exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'fail',
        message: 'No tour found'
    });
};
exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'fail',
        message: 'No tour found'
    });
};
exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'fail',
        message: 'No tour found'
    });
};
exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'fail',
        message: 'No tour found'
    });
};
