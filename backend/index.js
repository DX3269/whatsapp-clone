const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const messagesRouter = require('./routes/messages');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Use the FRONTEND_URL from your Render environment variables
const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000";

const io = new Server(server, {
  cors: {
    origin: frontendURL, // Use the variable for Socket.IO
    methods: ["GET", "POST", "DELETE"]
  }
});

const PORT = process.env.PORT || 5002;

// Also use the variable for the Express app
app.use(cors({ origin: frontendURL }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connection established successfully.'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/messages', messagesRouter);

app.get('/', (req, res) => {
  res.send('🚀 WhatsApp Clone Backend is up and running!');
});

io.on('connection', (socket) => {
  console.log('🔌 A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('❌ A user disconnected:', socket.id);
  });
});

server.listen(PORT, '0.0.0.0',() => {
  console.log(`👂 Server is listening on http://localhost:${PORT}`);
});