const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = createServer(app);

// Initialize Socket.io for real-time updates
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8000'],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  socket.on('subscribe', (rooms) => {
    rooms.forEach(room => socket.join(room));
  });
  
  socket.on('unsubscribe', (rooms) => {
    rooms.forEach(room => socket.leave(room));
  });
  
  socket.on('disconnect', () => {
    // Handle cleanup if needed
  });
});

// Make io accessible to routes
app.set('io', io);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = { app, server, io };