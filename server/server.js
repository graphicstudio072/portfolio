const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const Project = require('./models/Project');
const Message = require('./models/Message');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolio')
  .then(() => console.log('MongoDB Connected successfully.'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Ensure MongoDB service is running locally or specify correct MONGO_URI in .env');
  });

// Authentication Middleware
const authenticateAdmin = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Access token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'creative-portfolio-secret-2026');
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
  }
};

// Multer storage configuration for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File validation
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/quicktime', 'video/webm'
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only standard images and videos are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB file size limit
});

// --- ROUTES ---

// 1. Auth routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const configUser = process.env.ADMIN_USERNAME || 'admin';
  const configPass = process.env.ADMIN_PASSWORD || 'adminpass';

  if (username === configUser && password === configPass) {
    const token = jwt.sign(
      { username },
      process.env.JWT_SECRET || 'creative-portfolio-secret-2026',
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Set to true in production over HTTPS
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.json({ success: true, username });
  }

  res.status(400).json({ success: false, message: 'Invalid credentials' });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/auth/verify', (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ authenticated: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'creative-portfolio-secret-2026');
    res.json({ authenticated: true, username: decoded.username });
  } catch (error) {
    res.json({ authenticated: false });
  }
});

// 2. Portfolio public routes
app.get('/api/portfolio', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving portfolio items', error: error.message });
  }
});

// 3. Admin Portfolio routes
app.post('/api/portfolio', authenticateAdmin, upload.single('media'), async (req, res) => {
  try {
    const { title, description, category, mediaType, externalUrl } = req.body;

    let mediaUrl = '';
    let finalMediaType = mediaType;

    // Handle uploaded file
    if (req.file) {
      mediaUrl = `/uploads/${req.file.filename}`;
      finalMediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    } else if (externalUrl) {
      mediaUrl = externalUrl;
      finalMediaType = 'embed'; // e.g. YouTube iframe URL
    } else {
      return res.status(400).json({ message: 'Please provide either an uploaded file or an external URL.' });
    }

    const newProject = new Project({
      title,
      description,
      category,
      mediaUrl,
      mediaType: finalMediaType
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ message: 'Error saving project', error: error.message });
  }
});

app.delete('/api/portfolio/:id', authenticateAdmin, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // If media is a local file, delete it from disk
    if (project.mediaUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, project.mediaUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
});

// 4. Contact messages routes
app.post('/api/messages', async (req, res) => {
  try {
    const { name, email, projectType, message } = req.body;
    if (!name || !email || !projectType || !message) {
      return res.status(400).json({ message: 'All contact fields are required.' });
    }

    const newMessage = new Message({
      name,
      email,
      projectType,
      message
    });

    await newMessage.save();
    res.status(201).json({ success: true, message: 'Message submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting message', error: error.message });
  }
});

app.get('/api/messages', authenticateAdmin, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
});

app.patch('/api/messages/:id/read', authenticateAdmin, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.read = !message.read;
    await message.save();
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error updating message status', error: error.message });
  }
});

app.delete('/api/messages/:id', authenticateAdmin, async (req, res) => {
  try {
    const deleted = await Message.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message', error: error.message });
  }
});

// Serve React Frontend in Production
const clientBuildDir = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientBuildDir)) {
  app.use(express.static(clientBuildDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildDir, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
