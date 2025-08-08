const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const messagesRouter = require('./routes/messages');
const http = require('http'); // 1. Import Node's http module
const { Server } = require("socket.io"); // 2. Import Socket.IO Server

const app = express();
const server = http.createServer(app); // 3. Create an http server with the Express app

// 4. Initialize Socket.IO with the http server and CORS configuration
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow connection from your frontend
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5002;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connection established successfully.'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// --- Pass the `io` instance to the routes ---
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/messages', messagesRouter);

app.get('/', (req, res) => {
  res.send('🚀 WhatsApp Clone Backend is up and running!');
});

// 5. Listen for new connections
io.on('connection', (socket) => {
  console.log('🔌 A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('❌ A user disconnected:', socket.id);
  });
});

// 6. Start the server using the http server instance
server.listen(PORT, () => {
  console.log(`👂 Server is listening on http://localhost:${PORT}`);
});