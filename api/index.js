/**
 * Vercel serverless entry — exports the Express app.
 * All /api/* requests are routed here via vercel.json.
 */
const path = require('path');

// Make backend modules resolvable
process.env.NODE_PATH = path.join(__dirname, '../backend/node_modules');
require('module').Module._initPaths();

// Load env (Vercel injects process.env; dotenv is a no-op when vars already set)
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const mongoose = require('mongoose');

// Cached connection across warm invocations
let cached = global.__joeailabs_mongoose;
if (!cached) {
  cached = global.__joeailabs_mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!process.env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI environment variable');
  }
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, { bufferCommands: false })
      .then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Build Express app (without listening / Socket.IO — those need a long-lived server)
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

const allowedOrigins = process.env.CLIENT_ORIGINS
  ? process.env.CLIENT_ORIGINS.split(',').map((o) => o.trim())
  : true; // allow all in serverless if not set (Vercel frontend same-origin via /api)

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '10mb' }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Ensure DB is connected before any route runs
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connect error:', err.message);
    res.status(503).json({ success: false, message: 'Database unavailable. Check MONGODB_URI.' });
  }
});

// Routes (paths relative to backend/)
app.use('/api/auth', require('../backend/routes/auth'));
app.use('/api/modules', require('../backend/routes/modules'));
app.use('/api/lessons', require('../backend/routes/lessons'));
app.use('/api/progress', require('../backend/routes/progress'));
app.use('/api/prompts', require('../backend/routes/prompts'));
app.use('/api/dashboard', require('../backend/routes/dashboard'));
app.use('/api/chat', require('../backend/routes/chat'));
app.use('/api/payments', require('../backend/routes/payments'));
app.use('/api/admin', require('../backend/routes/admin'));
app.use('/api/quizzes', require('../backend/routes/quizzes'));
app.use('/api/users', require('../backend/routes/users'));
app.use('/api/certificates', require('../backend/routes/certificates'));
app.use('/api/posts', require('../backend/routes/posts'));
app.use('/api/follow', require('../backend/routes/follow'));
app.use('/api/notifications', require('../backend/routes/notifications'));
app.use('/api/conversations', require('../backend/routes/conversations'));

app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', platform: 'JOEAILABS', version: '1.0.0', runtime: 'vercel-serverless' })
);

app.get('/api/settings/public', async (req, res) => {
  try {
    const SystemSetting = require('../backend/models/SystemSetting');
    const keys = ['announcement', 'paymentMethods', 'communityLinks', 'premiumPricing'];
    const settings = await SystemSetting.find({ key: { $in: keys } });
    const map = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });
    res.json({ success: true, data: map });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
