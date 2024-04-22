const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path'); // Import the 'path' module

const app = express();
const port = 3063;

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

        // Render the dashboard HTML page with student data
        const studentData = results[0];
        res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Dashboard</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
        
                .container {
                    max-width: 800px;
                    margin: 50px auto;
                    padding: 20px;
                    background-color: #fff;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
        
                h1 {
                    text-align: center;
                    color: #333;
                }
        
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
        
                th, td {
                    padding: 12px 15px;
                    text-align: left;
                    border: 1px solid #ddd; /* Add border to all sides */
                    vertical-align: middle; /* Align content in the middle vertically */
                }
        
                th {
                    background-color: #333;
                    color: #fff;
                    width: 40%; /* Adjust the width of the attribute column */
                    text-align: center; /* Center table header */
                }
        
                tr:hover {
                    background-color: #f5f5f5;
                }
        
                .btn-container {
                    text-align: center;
                    margin-top: 20px;
                }
        
                .btn {
                    background-color: #4CAF50;
                    border: none;
                    color: white;
                    padding: 10px 20px;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    font-size: 16px;
                    margin: 4px 2px;
                    cursor: pointer;
                    border-radius: 4px;
                }
        
                .btn:hover {
                    background-color: #45a049;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Student Dashboard</h1>
                <table>
                    <tr>
                        <th>Attribute</th>
                        <th>Value</th>
                    </tr>
                    <tr>
                        <td>Student ID</td>
                        <td>${studentData.STUDENT_ID}</td>
                    </tr>
                    <tr>
                        <td>Name</td>
                        <td>${studentData.NAME}</td>
                    </tr>
                    <tr>
                        <td>Department</td>
                        <td>${studentData.DEPARTMENT}</td>
                    </tr>
                    <tr>
                        <td>Session</td>
                        <td>${studentData.SESSION}</td>
                    </tr>
                    <tr>
                        <td>Phone Number</td>
                        <td>${studentData.PHONE_NO}</td>
                    </tr>
                    <tr>
                        <td>Attached Hall</td>
                        <td>${studentData.ATTACHED_HALL_ID}</td>
                    </tr>
                    <!-- Add more table rows for additional attributes as needed -->
                </table>
                <div class="btn-container">
                    <a href="http://localhost:3100" class="btn">Apply For Seat</a>
                </div>
            </div>
        </body>
        </html>
        


        `);
    });
});






// Set up static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Start server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
