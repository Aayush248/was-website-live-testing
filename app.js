const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const path = require('path');
const mysql = require('mysql');

const app = express();

// Initialize S3 without explicitly specifying credentials
const s3 = new aws.S3({
    region: 'us-east-1'
});

// Multer middleware setup for file uploads
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'source-bucket-90',
        acl: 'private', // Make uploaded file private
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '-' + file.originalname); // Unique file name
        }
    })
});

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

// POST route for form submission
app.post('/submit', upload.single('image'), (req, res) => {
    const { first_name, last_name, email, hire_date, job_title, salary } = req.body;
    const imageUrl = req.file.location; // URL of the uploaded image in S3

    const sql = 'INSERT INTO employee (first_name, last_name, email, hire_date, job_title, salary, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [first_name, last_name, email, hire_date, job_title, salary, imageUrl], (err, result) => {
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
