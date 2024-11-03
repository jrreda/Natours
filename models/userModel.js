const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User must have a name'],
        unique: true,
        trim: true,
        match: /^\w+$/,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, 'User must have an email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Invalid email address'],
        match: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    password: {
        type: String,
        required: [true, 'User must have a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // this only works on SAVE!!!
            validator: function(value) {
                return this.password === value;
            },
            message: 'Passwords do not match'
        }
    }
});

// Hash password before saving/creating
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    // Hash the password using bcrypt with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete the passwordConfirm field since it's not needed for storing
    this.passwordConfirm = undefined;

    next();
});

module.exports = mongoose.model('User', userSchema);
