const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT and attach user to req
exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Not authenticated.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ success: false, message: 'User no longer exists.' });
    User.findById(decoded.id).select('lastActive').then(u => {
      if (!u || Date.now() - new Date(u.lastActive).getTime() > 3600000) {
        User.findByIdAndUpdate(decoded.id, { lastActive: new Date() }).catch(() => {});
      }
    }).catch(() => {});
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// Admin-only guard
exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }
  next();
};

// Premium guard (for locked modules)
exports.premiumOrAdmin = (req, res, next) => {
  if (req.user?.isPremium || req.user?.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Premium access required for this content.' });
};

// Helper: generate JWT
exports.generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
