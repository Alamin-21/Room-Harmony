const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3210;

// MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Replace with your MySQL username
  password: null, // Replace with your MySQL password
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

// Serve the room.html file when a request is made to the root URL
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/Abdur Rab Hall.html');
});

// Route to fetch seat data based on hall name and room ID
app.get('/room/:hallName/:roomId', (req, res) => {
  const hallName = req.params.hallName;
  const roomId = req.params.roomId;
  const query = `
  SELECT 
  s.SEAT_NO,
  IFNULL(s.STUDENT_ID, 'null') AS STUDENT_ID,
  IFNULL(st.NAME, 'null') AS STUDENT_NAME,
  r.ROOM_NO
FROM 
  ROOM r
LEFT JOIN 
  seat s ON r.ROOM_ID = s.ROOM_ID
LEFT JOIN 
  STUDENT st ON s.STUDENT_ID = st.STUDENT_ID
WHERE
  r.HALL_ID = ? AND r.ROOM_ID = ?;

  `;

  connection.query(query, [hallName, roomId], (err, rows) => {
    if (err) {
      console.error('Error querying MySQL:', err);
      res.status(500).json({ error: 'Error querying MySQL' });
      return;
    }
    res.json(rows);
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
