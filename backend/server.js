const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Jesus@1989', // replace with your actual password
    database: 'regtable'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed: ', err);
        process.exit(1);
    }
    console.log('MySQL Connected');
});

app.post('/api/register', 
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
            db.query(query, [name, email, hashedPassword], (err, result) => {
                if (err) {
                    return res.status(500).send({ message: 'Database error' });
                }
                const token = jwt.sign({ id: result.insertId, name, email }, process.env.JWT_SECRET);
                res.status(201).send({ message: 'User registered', token });
            });
        } catch (error) {
            res.status(500).send({ message: 'Server error' });
        }
    }
);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
