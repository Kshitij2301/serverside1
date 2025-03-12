// server.js

// Import necessary modules
const express = require('express'); // Express framework for creating the server
const path = require('path');     // Path module for handling file paths
const fs = require('fs');         // File system module for reading and writing files
const bodyParser = require('body-parser'); // Body-parser middleware to parse request bodies

const app = express(); // Create an Express application

const usersFilePath = path.join(__dirname, 'users.json'); // Path to the users.json file

// Middleware to serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse URL-encoded bodies (for form data)
app.use(bodyParser.urlencoded({ extended: false }));

// --------------------------------------------------------------------
// Signup Endpoint - Handles POST requests to /signup
// --------------------------------------------------------------------
app.post('/signup', (req, res) => {
    const { email, password } = req.body; // Extract email and password from the request body

    if (!email || !password) {
        return res.status(400).send('Email and password are required.'); // Respond with an error if email or password is missing
    }

    const newUser = {
        email: email,
        password: password, // In a real application, you would hash the password!
        timestamp: new Date().toISOString() // Add a timestamp for when the user signed up
    };

    // Read existing users from users.json file
    fs.readFile(usersFilePath, (err, data) => {
        let users = []; // Initialize an empty array for users

        if (!err) { // If no error occurred while reading the file
            try {
                users = JSON.parse(data); // Try to parse the JSON data from the file
            } catch (parseError) {
                console.error("Error parsing users.json:", parseError);
                users = []; // If parsing fails, start with an empty array
            }
        } else if (err.code === 'ENOENT') {
            // File doesn't exist, it's okay, we'll create it when we write
            console.log('users.json does not exist, will create a new one.');
        } else {
            console.error("Error reading users.json:", err);
            return res.status(500).send('Error reading user data.'); // Respond with a server error if there's an issue reading the file
        }

        // Add the new user to the users array
        users.push(newUser);

        // Write the updated users array back to users.json file
        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (writeErr) => {
            if (writeErr) {
                console.error("Error writing to users.json:", writeErr);
                return res.status(500).send('Error saving user data.'); // Respond with a server error if there's an issue writing to the file
            }
            console.log('New user signed up:', newUser.email);
            res.send('Signup successful!'); // Respond with a success message to the client
        });
    });
});


// --------------------------------------------------------------------
// Login Endpoint - Handles POST requests to /login
// --------------------------------------------------------------------
app.post('/login', (req, res) => {
    const { email, password } = req.body; // Extract email and password from the request body

    if (!email || !password) {
        return res.status(400).send('Email and password are required.'); // Respond with an error if email or password is missing
    }

    // Read users from users.json file
    fs.readFile(usersFilePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.status(401).send('Invalid credentials.'); // If users.json doesn't exist, no users are registered yet
            } else {
                console.error("Error reading users.json:", err);
                return res.status(500).send('Error reading user data.'); // Respond with a server error if there's an issue reading the file
            }
        }

        let users = [];
        try {
            users = JSON.parse(data); // Parse user data from JSON
        } catch (parseError) {
            console.error("Error parsing users.json:", parseError);
            return res.status(500).send('Error processing user data.'); // Respond with a server error if there's an issue parsing JSON
        }

        // Find user by email and password
        const user = users.find(u => u.email === email && u.password === password); // In real app, compare hashed passwords!

        if (user) {
            console.log('User logged in:', user.email);
            res.send('Login successful!'); // Respond with a success message if login is successful
        } else {
            console.log('Login failed for email:', email);
            res.status(401).send('Invalid credentials.'); // Respond with an error if credentials are invalid
        }
    });
});


// --------------------------------------------------------------------
// Start the server
// --------------------------------------------------------------------
const PORT = process.env.PORT || 3000; // Use environment port or default to 3000

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`); // Log message when server starts
});
