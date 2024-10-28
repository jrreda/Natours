const mongoose = require('mongoose');
const dotenv = require('dotenv');

// handle uncaught exceptions
process.on('uncaughtException', error => {
    console.error('Uncaught exception at:', error.name, error.message);
    console.log('Uncaught exception! 🫴 shutting down...');

    // Exit process
    process.exit(1);
});

// Load environment variables from.env file
dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

// Connect to the MongoDB database
mongoose
    // .connect(process.env.DATABASE_LOCAL, {
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() => console.log('Database connection successful! 💾'));

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`App is running on port: ${PORT}...`);
});

// handle unhandled rejection
process.on('unhandledRejection', error => {
    console.error('Unhandled rejection at:', error.name, error.message);
    console.log('Unhandled rejection! 🗿 shutting down...');

    // Close the server and exit process
    server.close(() => process.exit(1));
});
