const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 3105;

// MySQL database connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: null,
  database: 'hall_management'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database as id ' + connection.threadId);
});

// Middleware to parse request body
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static('public'));


// Route to display the data display page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/ad_display.html');
});



// Route to fetch data from database
app.get('/getData', (req, res) => {
  const sql = 'SELECT * FROM application';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data from MySQL table:', err);
      res.status(500).json({ error: 'Error retrieving data' });
    } else {
      res.json(results);
    }
  });
});


app.delete('/reject', (req, res) => {
    const { applicationId } = req.query;
    const sql = `DELETE FROM application WHERE AP_ID = ${applicationId}`;
    connection.query(sql, (err, results) => {
      if (err) {
        console.error('Error rejecting application:', err);
        res.status(500).json({ error: 'Error rejecting application' });
      } else {
        console.log(`Application with ID ${applicationId} rejected successfully`);
        res.sendStatus(200);
      }
    });
  });
  

  app.get('/checkAllocation', (req, res) => {
    const studentId = req.query.studentId;
    const sql = 'SELECT * FROM seat WHERE STUDENT_ID = ?';
    connection.query(sql, [studentId], (err, results) => {
      if (err) {
        console.error('Error checking allocation:', err);
        res.status(500).json({ error: 'Error checking allocation' });
      } else {
        const allocated = results.length > 0;
        res.json({ allocated });
      }
    });
  });

  // Route to delete an application
app.delete('/deleteApplication', (req, res) => {
    const applicationId = req.query.applicationId;
    const sql = 'DELETE FROM application WHERE STUDENT_ID = ?';
    connection.query(sql, [applicationId], (err, results) => {
      if (err) {
        console.error('Error deleting application:', err);
        res.status(500).json({ error: 'Error deleting application' });
      } else {
        res.status(200).json({ message: 'Application deleted successfully' });
      }
    });
  });





  // Route to fetch the attached hall ID for a student
app.get('/getAttachedHall', (req, res) => {
  const studentId = req.query.studentId;
  const sql = 'SELECT ATTACHED_HALL_ID FROM student WHERE STUDENT_ID = ?';
  connection.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error('Error fetching attached hall:', err);
      res.status(500).json({ error: 'Error fetching attached hall' });
    } else {
      if (results.length > 0) {
        res.json({ attachedHallId: results[0].ATTACHED_HALL_ID });
      } else {
        res.status(404).json({ error: 'Student not found' });
      }
    }
  });
});






  
  // Existing code remains the same

// Route to fetch available rooms based on the student's attached hall
app.get('/availableRooms', (req, res) => {
  const { studentId } = req.query;
  const sql = `
    SELECT DISTINCT r.ROOM_ID, r.ROOM_NO
    FROM seat s
    JOIN room r ON s.ROOM_ID = r.ROOM_ID
    WHERE s.STUDENT_ID IS NULL
      AND r.HALL_ID = (
        SELECT ATTACHED_HALL_ID FROM student WHERE STUDENT_ID = ?
      )
  `;
  connection.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error('Error fetching available rooms:', err);
      res.status(500).json({ error: 'Error fetching available rooms' });
    } else {
      res.json({ rooms: results });
    }
  });
});

// Route to fetch available seats based on the selected room
app.get('/availableSeats', (req, res) => {
  const { roomId } = req.query;
  const sql = `
    SELECT s.SEAT_ID, s.SEAT_NO
    FROM seat s
    WHERE s.STUDENT_ID IS NULL
      AND s.ROOM_ID = ?
  `;
  connection.query(sql, [roomId], (err, results) => {
    if (err) {
      console.error('Error fetching available seats:', err);
      res.status(500).json({ error: 'Error fetching available seats' });
    } else {
      res.json({ seats: results });
    }
  });
});



// Route to insert the student into the seat table
app.post('/allocateStudent', (req, res) => {
  const { studentId, roomId, seatId } = req.body;
  const sql = 'INSERT INTO seat (STUDENT_ID, ROOM_ID, SEAT_ID) VALUES (?, ?, ?)';
  connection.query(sql, [studentId, roomId, seatId], (err, results) => {
    if (err) {
      console.error('Error allocating student:', err);
      res.status(500).json({ error: 'Error allocating student' });
    } else {
      res.status(200).json({ message: 'Student allocated successfully' });
    }
  });
});


// Start server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
