const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');

const app = express();

// Database connection details
const db = mysql.createConnection({
    host: 'database-2.crezjbu8x9vl.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: 'admin12345',
    database: 'employee_info'
});

// Connect to the database
db.connect(err => {
    if (err) {
        throw err;
    }
    console.log('MySQL connected...');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/submit', (req, res) => {
    const { first_name, last_name, email, hire_date, job_title, salary } = req.body;
    const sql = 'INSERT INTO employee (first_name, last_name, email, hire_date, job_title, salary) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [first_name, last_name, email, hire_date, job_title, salary], (err, result) => {
        if (err) {
            throw err;
        }
        console.log('Employee data inserted');
        res.redirect('/');
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
