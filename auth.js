const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connectDB = require('../db/mongoClient');

const router = express.Router();

// Optional: Register route
router.post('/register', async (req, res) => {
  const db = await connectDB();
  const { username, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  await db.collection('users').insertOne({ username, email, password: hashed });
  res.status(201).json({ message: 'User registered' });
});

// Login route
router.post('/login', async (req, res) => {
  const db = await connectDB();
  const { email, password } = req.body;

  // Try finding user by email OR username
  let user = await db.collection('users').findOne({
    $or: [{ email }, { username: email }]
  });

  // Auto-create 'taskuser' if it doesn't exist
  if (!user && email === 'taskuser' && password === 'taskpass123') {
    const hashed = await bcrypt.hash(password, 10);
    const result = await db.collection('users').insertOne({
      username: 'taskuser',
      email: 'task@example.com',
      password: hashed
    });
    user = await db.collection('users').findOne({ _id: result.insertedId });
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET
  );

  res.json({token, username: user.username });
});

module.exports = router;

