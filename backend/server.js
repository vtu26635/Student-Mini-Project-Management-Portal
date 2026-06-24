import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-Memory Database Fallback array
let inMemoryTasks = [];
let useMemoryDb = false;

// Attempt MongoDB Connection with Automatic Fallback
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student_portal')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.log('❌ MongoDB connection failed. Falling back to In-Memory Database.');
    useMemoryDb = true;
  });

// MongoDB Schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});
const Task = mongoose.model('Task', taskSchema);

// --- REST API ENDPOINTS ---

// 1. Fetch All Tasks (with Search, Filter, and Sort mechanisms)
app.get('/api/tasks', async (req, res) => {
  try {
    const { search, status, sort } = req.query;
    let tasks = [];

    if (useMemoryDb) {
      tasks = [...inMemoryTasks];
    } else {
      tasks = await Task.find();
    }

    if (search) {
      const query = search.toLowerCase();
      tasks = tasks.filter(t => t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query));
    }
    if (status) {
      tasks = tasks.filter(t => t.status === status);
    }

    tasks.sort((a, b) => {
      return sort === 'oldest' 
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Centralized Error: Fetching tasks failed' });
  }
});

// 2. Create Task Record (with Server-side Validation)
app.post('/api/tasks', async (req, res) => {
  const { title, description } = req.body;
  if (!title || !title.trim() || !description || !description.trim()) {
    return res.status(400).json({ message: 'Server Validation Error: Title and Description fields are mandatory.' });
  }

  const newTask = {
    _id: useMemoryDb ? Date.now().toString() : undefined,
    title: title.trim(),
    description: description.trim(),
    status: 'Pending',
    createdAt: new Date()
  };

  try {
    if (useMemoryDb) {
      inMemoryTasks.push(newTask);
      res.status(201).json(newTask);
    } else {
      const dbTask = new Task(newTask);
      await dbTask.save();
      res.status(201).json(dbTask);
    }
  } catch (error) {
    res.status(500).json({ message: 'Centralized Error: Saving task failed' });
  }
});

// 3. Update Status
app.put('/api/tasks/:id', async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    if (useMemoryDb) {
      const task = inMemoryTasks.find(t => t._id === id);
      if (!task) return res.status(404).json({ message: 'Task not found' });
      task.status = status;
      res.json(task);
    } else {
      const task = await Task.findByIdAndUpdate(id, { status }, { new: true });
      res.json(task);
    }
  } catch (error) {
    res.status(500).json({ message: 'Centralized Error: Updating task failed' });
  }
});

// 4. Delete Task
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (useMemoryDb) {
      inMemoryTasks = inMemoryTasks.filter(t => t._id !== id);
      res.json({ message: 'Deleted' });
    } else {
      await Task.findByIdAndDelete(id);
      res.json({ message: 'Deleted' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Centralized Error: Deleting task failed' });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));