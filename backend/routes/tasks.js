const express = require('express');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const connectDB = require('../db/mongoClient');

const router = express.Router();

// ✅ Middleware to verify JWT and extract user ID
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Missing token' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error('Invalid JWT:', err.message);
    return res.status(403).json({ message: 'Invalid token' });
  }
}

// ✅ GET /api/tasks — Get all tasks for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = await connectDB();
    const tasks = await db.collection('tasks').find({ userId: req.userId }).toArray();
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ message: 'Failed to retrieve tasks' });
  }
});

// ✅ POST /api/tasks — Create a new task
router.post('/', authMiddleware, async (req, res) => {
  try {
    const db = await connectDB();
    const task = {
      ...req.body,
      userId: req.userId,
      status: 'pending',
      createdAt: new Date(),
    };

    const result = await db.collection('tasks').insertOne(task);
    const createdTask = await db.collection('tasks').findOne({ _id: result.insertedId });

    res.status(201).json(createdTask);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ message: 'Failed to create task' });
  }
});

// ✅ DELETE /api/tasks/:id — Delete task
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection('tasks').deleteOne({
      _id: new ObjectId(req.params.id),
      userId: req.userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }

    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ message: 'Failed to delete task' });
  }
});

// ✅ PATCH /api/tasks/:id — Update task status
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const db = await connectDB();
    const { status } = req.body;

    const result = await db.collection('tasks').findOneAndUpdate(
      { _id: new ObjectId(req.params.id), userId: req.userId },
      { $set: { status } },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }

    res.json(result.value);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ message: 'Failed to update task' });
  }
});

module.exports = router;
