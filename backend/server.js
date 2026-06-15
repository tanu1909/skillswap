import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import connectDB from './config/db.js';
import Message from './models/Message.model.js';

// Connect Database
connectDB();

// Create HTTP Server wrapped around Express app instance
const server = http.createServer(app);

// Initialize Socket.io Server instance with CORS configuration
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Frontend URL port
    methods: ["GET", "POST"]
  }
});

// Socket Event Listening Handler Terminal
io.on('connection', (socket) => {
  console.log(`🔌 Web Chat Socket Connected: ${socket.id}`);

  // Event: Join a specific conversation room channel
  socket.on('join_room', (data) => {
    const { userId, counterpartId } = data;
    const roomName = [userId, counterpartId].sort().join('_');
    socket.join(roomName);
    console.log(`👥 User ${userId} joined trade room channel: ${roomName}`);
  });

  // Event: Join classroom for code/whiteboard collaboration
  socket.on('join-classroom', (bookingId) => {
    socket.join(`room_${bookingId}`);
    console.log(`📚 User ${socket.id} joined classroom: room_${bookingId}`);
  });

  // Event: Sending real-time messages
  socket.on('send_message', async (data) => {
    const { senderId, receiverId, text } = data;
    const roomName = [senderId, receiverId].sort().join('_');
    
    try {
      // Save message records seamlessly to MongoDB Atlas in real-time
      const newMessage = await Message.create({
        chatRoomId: roomName,
        sender: senderId,
        receiver: receiverId,
        text
      });

      // Broadcast message event directly to everyone inside the target chat room channel
      io.to(roomName).emit('receive_message', newMessage);
    } catch (err) {
      console.error("Failed to route immediate socket text delivery:", err);
    }
  });

  // Event: Real-time code changes
  socket.on('code-changed', ({ bookingId, code, language }) => {
    socket.to(`room_${bookingId}`).emit('code-receive', { code, language });
  });

  // Event: Real-time drawing on whiteboard
  socket.on('drawing', ({ bookingId, x0, y0, x1, y1, color }) => {
    socket.to(`room_${bookingId}`).emit('drawing-receive', { x0, y0, x1, y1, color });
  });

  // Event: Clear canvas for both users
  socket.on('clear-canvas', (bookingId) => {
    socket.to(`room_${bookingId}`).emit('clear-canvas-receive');
  });

  socket.on('disconnect', () => {
    console.log(`❌ Socket Connection Closed down safely: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is sailing smoothly on port ${PORT}`);
});