import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './src/routes/user.routes.js';
import noteRoutes from './src/routes/note.routes.js';
import profileRoutes from './src/routes/profile.routes.js';
import http from 'http';
import { Server } from 'socket.io';
import configureSocket from './src/socket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ Allowed frontend origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://notes-management-system-green.vercel.app',
];

// ✅ CORS Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`❌ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ✅ Express Middleware
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Routes
app.get('/', (req, res) => {
  res.send('📡 Notes Management API is running...');
});

app.get('/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.status(isConnected ? 200 : 500).send({ mongo: isConnected });
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/profile', profileRoutes);

// ✅ Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

const onlineUsers = new Map();
configureSocket(io, onlineUsers);

// ✅ Make io and users available to routes/controllers
app.set('io', io);
app.set('onlineUsers', onlineUsers);

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
