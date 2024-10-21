const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load the Tour model
const Tour = require('./../../models/tourModel');

// Load environment variables from.env file
dotenv.config({ path: './config.env' });

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

// read the json data
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

// Import the data
const importData = async () => {
    try {
        await Tour.create(tours);
        console.log('Data imported successfully!');
    } catch (error) {
        console.error('Error importing data', error.message);
    }
    // Close the connection after importing data
    process.exit();
};

// Delete all data
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data deleted successfully!');
    } catch (error) {
        console.error('Error deleting data', error.message);
    }
    // Close the connection after deleting data
    process.exit();
};

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}
