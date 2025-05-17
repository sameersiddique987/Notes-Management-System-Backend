



// import express from 'express';
// import cors from 'cors';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import authRoutes from './src/routes/user.routes.js';
// import noteRoutes from './src/routes/note.routes.js';
// import http from 'http';
// import { Server } from 'socket.io';

// dotenv.config();

// const app = express();
// const server = http.createServer(app);

// Socket.io setup
// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:5173',
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   },
// });

// const allowedOrigins = [
  
//   'http://localhost:5173',
  
// ];


// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
// }));

// // Middleware
// app.use(cors());
// app.use(express.json());

// // MongoDB Connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('✅ MongoDB connected'))
//   .catch((err) => console.error('❌ MongoDB connection error:', err));

// // Routes
// app.get('/', (req, res) => {
//   res.send('📡 Notes Management API is running...');
// });

// app.use('/api/auth', authRoutes);
// app.use('/api/notes', noteRoutes);

// // Socket.io user tracking
// const onlineUsers = new Map();

// io.on('connection', (socket) => {
//   console.log('🟢 User connected:', socket.id);

//   socket.on('register', (userId) => {
//     onlineUsers.set(userId, socket.id);
//     console.log(`👤 User ${userId} registered with socket ${socket.id}`);
//   });

//   socket.on('disconnect', () => {
//     for (let [userId, sockId] of onlineUsers.entries()) {
//       if (sockId === socket.id) {
//         onlineUsers.delete(userId);
//         break;
//       }
//     }
//     console.log('🔴 User disconnected:', socket.id);
//   });
// });

// // Share io and onlineUsers map in app context
// app.set('io', io);
// app.set('onlineUsers', onlineUsers);

// // Start server
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });













import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './src/routes/user.routes.js';
import noteRoutes from './src/routes/note.routes.js';
import profileRoutes from './src/routes/profile.routes.js'
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ Allowed frontend origins
const allowedOrigins = [
  'http://localhost:5173', 
  'https://notes-management-system-green.vercel.app'
];

// ✅ CORS Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ✅ Express Middleware
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Routes
app.get('/', (req, res) => {
  res.send('📡 Notes Management API is running...');
});

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use("/api/profile", profileRoutes);

// ✅ Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  socket.on('register', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`👤 User ${userId} registered with socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    for (let [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    console.log('🔴 User disconnected:', socket.id);
  });
});

// ✅ Make io and users available to other files
app.set('io', io);
app.set('onlineUsers', onlineUsers);

// ✅ Start Server
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
