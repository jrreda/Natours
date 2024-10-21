const dotenv = require('dotenv');
const app = require('./app');

// Load environment variables from.env file
dotenv.config({ path: './config.env' });


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App is running on port: ${PORT}...`);
});
