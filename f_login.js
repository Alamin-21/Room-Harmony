const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path'); // Import the 'path' module

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
    const { studentid, password } = req.body;

    // Check if the username (student ID) exists in the registration table
    const loginQuery = 'SELECT * FROM registration WHERE STUDENT_ID = ?';
    connection.query(loginQuery, [studentid], (err, results) => {
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
      
        // Redirect to hello.html upon successful login
        res.redirect(`/hello.html?studentid=${studentid}`);

        
    });
});



// Serve dashboard
app.get('/dashboard', (req, res) => {
    // Retrieve student ID from the URL query parameter
    const studentid = req.query.studentid;

    // Query the database to get student information
    const studentQuery = 'SELECT * FROM student WHERE STUDENT_ID = ?';
    connection.query(studentQuery, [studentid], (err, results) => {
        if (err) {
            console.error('Error querying students table:', err);
            res.status(500).send('Error fetching student data');
            return;
        }

        // Check if student data is found
        if (results.length === 0) {
            res.status(404).send('Student not found');
            return;
        }

        // Render the dashboard page with student data
        res.json(results);
    });
});





// Set up static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Start server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
