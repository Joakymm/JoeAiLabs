const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const ChatMessage = require('./models/ChatMessage');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const helmet = require('helmet');
const SystemSetting = require('./models/SystemSetting');
require('dotenv').config();

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
app.use(helmet({ contentSecurityPolicy: false })); // Basic security headers
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

// ── In-memory fallback rate limiter (used when Redis unavailable) ─────────────
const fallbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
  skip: () => redisEnabled, // skip when Redis is active
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
// Chat namespace handling
io.of('/chat').on('connection', (socket) => {
  socket.join('public');
  // broadcast online count
  io.of('/chat').emit('online', { count: io.of('/chat').sockets.size });
  socket.on('message', async (msg) => {
    try {
      const chatMsg = new ChatMessage({
        user: socket.userId,
        content: msg.content || '',
        type: msg.type || 'text',
        attachments: msg.attachments || [],
      });
      await chatMsg.save();
      const populated = await chatMsg.populate('user', 'username avatar');
      io.of('/chat').to('public').emit('message', populated);
    } catch (err) {
      console.error('Socket Chat Error:', err.message);
      socket.emit('error', { message: 'Failed to send message.' });
    }
  });
  socket.on('typing', (data) => {
    socket.to('public').emit('typing', { userId: socket.userId, typing: data.typing });
  });
  socket.on('disconnect', () => {
    io.of('/chat').emit('online', { count: io.of('/chat').sockets.size });
  });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 JOEAILABS API running on port ${PORT}`));
