const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3062;

// MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: null,
    database: 'hall_management'
});

// Connect to MySQL
connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Serve login form
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

// Handle login request
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if the username (student ID) exists in the registration table
    const loginQuery = 'SELECT * FROM registration WHERE USERNAME = ?';
    connection.query(loginQuery, [username], (err, results) => {
        if (err) {
            console.error('Error querying registration table:', err);
            res.status(500).send('Error logging in');
            return;
        }

        // If no registration record is found with the given username, reject the login
        if (results.length === 0) {
            res.status(400).send('Invalid username. Please provide a valid student ID.');
            return;
        }

        // Verify the password
        const user = results[0];
        if (user.PASSWORD !== password) {
            res.status(401).send('Invalid password');
            return;
        }

        // Login successful. Redirect to dashboard
        res.redirect(`/dashboard?username=${username}`);
    });
});

// Serve dashboard HTML
app.get('/dashboard', (req, res) => {
    res.sendFile(__dirname + '/dashboard.html');
});

// Endpoint to fetch student and registration data
app.get('/data', (req, res) => {
    const studentId = req.query.username;

    // Fetch student data
    const studentQuery = 'SELECT * FROM student WHERE STUDENT_ID = ?';
    connection.query(studentQuery, [studentId], (err, studentData) => {
        if (err) {
            console.error('Error querying student data:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        // Fetch registration data
        const registrationQuery = 'SELECT * FROM registration WHERE STUDENT_ID = ?';
        connection.query(registrationQuery, [studentId], (err, registrationData) => {
            if (err) {
                console.error('Error querying registration data:', err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }

            // Send both student and registration data as JSON response
            res.json({ student: studentData[0], registration: registrationData[0] });
        });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
