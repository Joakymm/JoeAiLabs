const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('./models/Message');
const Notification = require('./models/Notification');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const helmet = require('helmet');
const SystemSetting = require('./models/SystemSetting');
require('dotenv').config({ path: path.join(__dirname, '.env') });

if (!process.env.MONGODB_URI) {
  console.error('❌ Missing MONGODB_URI in environment.');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('❌ Missing JWT_SECRET in environment.');
  process.exit(1);
}

const { rateLimiter, enabled: redisEnabled } = require('./services/redisClient');

const app = express();

// ── Connect DB ────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => { console.error('❌ MongoDB error:', err.message); process.exit(1); });

// ── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.CLIENT_ORIGINS
  ? process.env.CLIENT_ORIGINS.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Redis-backed rate limiter (falls back to in-memory when Redis unavailable)
app.use('/api/', async (req, res, next) => {
  const key = req.ip || req.connection.remoteAddress || 'unknown';
  const result = await rateLimiter(key, redisEnabled ? 300 : 200, 15 * 60 * 1000);
  if (!result.allowed) {
    return res.status(429).json({ success: false, message: 'Too many requests, please try again later.' });
  }
  next();
});

// ── Maintenance mode middleware ────────────────────────────────────────────────
const { maintenanceCheck } = require('./middleware/maintenance');
app.use(maintenanceCheck);

// ── In-memory fallback rate limiter ──────────────────────────────────────────
const fallbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
  skip: () => redisEnabled,
});
app.use('/api/', fallbackLimiter);

// ── Public settings endpoint ──────────────────────────────────────────────────
app.get('/api/settings/public', async (req, res) => {
  try {
    const keys = ['announcement', 'paymentMethods', 'communityLinks', 'premiumPricing'];
    const settings = await SystemSetting.find({ key: { $in: keys } });
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });
    res.json({ success: true, data: map });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/modules',  require('./routes/modules'));
app.use('/api/lessons',  require('./routes/lessons'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/prompts',  require('./routes/prompts'));
app.use('/api/dashboard',require('./routes/dashboard'));
app.use('/api/chat',     require('./routes/chat'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/quizzes',  require('./routes/quizzes'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/certificates', require('./routes/certificates'));
// ── New Social Routes ─────────────────────────────────────────────────────────
app.use('/api/posts',    require('./routes/posts'));
app.use('/api/follow',   require('./routes/follow'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/conversations', require('./routes/conversations'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', platform: 'JOEAILABS', version: '1.0.0' }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ── Start & Socket.IO ────────────────────────────────────────────────────────────

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
});

// Make io accessible to routes
app.set('io', io);

// Socket authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication error'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (e) {
    next(new Error('Invalid token'));
  }
});

// Track online users
const onlineUsers = new Map();

// Main socket namespace for social features
io.on('connection', (socket) => {
  const userId = socket.userId;
  onlineUsers.set(userId, socket.id);
  socket.join(`user:${userId}`);
  io.emit('presence-update', { userId, online: true });

  // ── Chat message events ──
  socket.on('send-message', async (data) => {
    try {
      const { conversationId, text } = data;
      if (!conversationId || !text?.trim()) return;

      const Conversation = require('./models/Conversation');
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      const message = await Message.create({
        conversationId,
        sender: userId,
        text,
        readBy: [userId],
        sentAt: new Date(),
        deliveredAt: new Date(),
      });

      conversation.lastMessage = { sender: userId, text: text.substring(0, 100), sentAt: new Date() };
      conversation.updatedAt = new Date();
      await conversation.save();

      const populated = await message.populate('sender', 'username avatar');

      conversation.participants.forEach(p => {
        if (p.toString() !== userId) {
          io.to(`user:${p}`).emit('send-message', { message: populated, conversationId });
        }
      });
    } catch (err) {
      console.error('Socket send-message error:', err.message);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('typing-start', (data) => {
    const { conversationId } = data;
    socket.to(`conversation:${conversationId}`).emit('typing-start', { userId, conversationId });
  });

  socket.on('typing-stop', (data) => {
    const { conversationId } = data;
    socket.to(`conversation:${conversationId}`).emit('typing-stop', { userId, conversationId });
  });

  socket.on('message-read', async (data) => {
    try {
      const { messageId, conversationId } = data;
      const msg = await Message.findById(messageId);
      if (msg && !msg.readBy.includes(userId)) {
        msg.readBy.push(userId);
        msg.readAt = new Date();
        await msg.save();
        socket.to(`conversation:${conversationId}`).emit('message-read', { messageId, conversationId, readBy: userId });
      }
    } catch (err) {
      console.error('Socket message-read error:', err.message);
    }
  });

  // ── Join conversation room ──
  socket.on('join-conversation', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
  });

  socket.on('leave-conversation', (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
    io.emit('presence-update', { userId, online: false });
  });
});

// ── Serve React frontend in production ───────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(distPath, { maxAge: '1y', immutable: true }));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other process or change PORT in .env`);
    process.exit(1);
  }
  console.error('Server error:', err.message);
});

const PORT = process.env.PORT || 5001;
mongoose.connection.once('open', () => {
  server.listen(PORT, () => console.log(`🚀 JOEAILABS API running on port ${PORT}`));
});
