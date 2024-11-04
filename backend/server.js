const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Jesus@1989', 
    database: 'regtable'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed: ', err);
        process.exit(1);
    }
    console.log('MySQL Connected');
});

// Registration endpoint
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

// Google OAuth setup
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if the user already exists in the database
        const query = 'SELECT * FROM users WHERE google_id = ?';
        db.query(query, [profile.id], async (err, results) => {
            if (err) return done(err);
            if (results.length > 0) {
                // User exists, return the user
                return done(null, results[0]);
            } else {
                // Create a new user in the database
                const newUser = {
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    google_id: profile.id
                };
                const insertQuery = 'INSERT INTO users (name, email, google_id) VALUES (?, ?, ?)';
                db.query(insertQuery, [newUser.name, newUser.email, newUser.google_id], (err, result) => {
                    if (err) return done(err);
                    newUser.id = result.insertId; // Set the ID for the new user
                    return done(null, newUser);
                });
            }
        });
    } catch (error) {
        return done(error);
    }
}));

// Routes for Google OAuth
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, generate a JWT token and send it
        const token = jwt.sign({ id: req.user.id, name: req.user.name, email: req.user.email }, process.env.JWT_SECRET);
        res.redirect(`http://localhost:${PORT}/?token=${token}`); // Redirect with token
    }
);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
