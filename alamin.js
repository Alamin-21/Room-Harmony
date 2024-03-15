const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3062;

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'alamin',
    database: 'my_database'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL Connected...');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error('Error querying MySQL database: ' + err.stack);
            res.status(500).send('Internal server error');
        } else {
            if (results.length > 0) {
                const userData = results[0];
                res.redirect(`/afterlogin.html?username=${userData.username}`);
            } else {
                console.log('Invalid credentials');
                res.status(401).send('Invalid Username/Password');
            }
        }
    });
});

app.get('/afterlogin.html', (req, res) => {
    const { username } = req.query;
    const sql = 'SELECT firstName, lastName, email FROM users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error('Error querying MySQL database: ' + err.stack);
            res.status(500).send('Internal server error');
        } else {
            if (results.length > 0) {
                const user = results[0];
                const htmlContent = `
                <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Dashboard</title>
    <style>
        /* CSS styles */
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f2f2f2;
        }

        header {
            background-color: #333;
            color: white;
            padding: 20px;
            text-align: center;
        }

        main {
            margin: 20px;
            text-align: center; /* Center student information and button */
        }

        .table-container {
            width: 60%; /* Adjusted width */
            margin: 0 auto; /* Centering the container */
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            border: 2px solid #ddd; /* Add border around table */
        }

        th, td {
            padding: 10px;
            border: 1px solid #ddd; /* Add border around cells */
        }

        th {
            background-color: #333;
            color: white;
        }

        td {
            background-color: #f9f9f9;
        }

        .btn-container {
            text-align: center; /* Align button to the center */
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
    <header>
        <h1>Student Dashboard</h1>
    </header>
    <main>
        <div class="table-container">
                        <h2>Welcome</h2>
                        <p>Hello, ${username}!</p>
                        <h3>User Information</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>${user.firstName}</td>
                                    <td>${user.lastName}</td>
                                    <td>${user.email}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div class="btn-container">
                        <a href="/application_form.html" class="btn">Go to Application Form</a>
                    </div>
                    </div>
                </body>
                </html>
                `;
                res.send(htmlContent);
            } else {
                res.status(404).send('User not found');
            }
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

