const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connectDB = require('../db/mongoClient');

const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
  try {
    const db = await connectDB();
    const { email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await db.collection('users').findOne({ email: normalizedEmail });

    if (existingUser) {
      console.log('Signup failed: account already exists');
      return res.status(409).json({ message: 'Account already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await db.collection('users').insertOne({
      email: normalizedEmail,
      password: hashed
    });

    console.log('Signup success for', normalizedEmail);
    res.status(201).json({ message: 'Signup successful', user: { email: normalizedEmail, id: result.insertedId } });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const db = await connectDB();
    const { email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();
    console.log('Login attempt for:', normalizedEmail);

    const user = await db.collection('users').findOne({ email: normalizedEmail });

    if (!user) {
      console.log('Login failed: account not found for', normalizedEmail);
      return res.status(401).json({ message: 'Account not found' });
    }

    console.log('User found, verifying password...');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login failed: incorrect password for', normalizedEmail);
      return res.status(401).json({ message: 'Incorrect Password' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallbacksecret';
    const token = jwt.sign(
      { id: user._id, email: user.email },
      jwtSecret,
      { expiresIn: '2h' }
    );

    console.log('Login success for', normalizedEmail);
    res.status(200).json({ token, username: user.email });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
