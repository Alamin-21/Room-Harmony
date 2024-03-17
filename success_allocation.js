const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 3105;

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

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/ad_display.html');
});

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

// Route to allocate a seat to a student
app.post('/allocateSeat', (req, res) => {
  const { studentId, seatId } = req.body;
  const sql = 'UPDATE SEAT SET STUDENT_ID = ? WHERE SEAT_ID = ?';
  connection.query(sql, [studentId, seatId], (err, results) => {
    if (err) {
      console.error('Error updating seat:', err);
      res.status(500).json({ error: 'Error updating seat' });
    } else {
      console.log(`Seat updated successfully for student ID ${studentId}`);
      res.status(200).json({ message: 'Seat updated successfully' });
    }
  });
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
