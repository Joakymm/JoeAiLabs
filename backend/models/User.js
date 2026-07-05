const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  username:        { type: String, required: true, unique: true, trim: true },
  email:           { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:        { type: String, required: true, minlength: 6, select: false },
  avatar:          { type: String, default: '' },
  coverPhoto:      { type: String, default: '' },
  role:            { type: String, enum: ['user', 'seller', 'moderator', 'admin'], default: 'user' },
  isPremium:       { type: Boolean, default: false },
  isPrivate:       { type: Boolean, default: false },
  xp:              { type: Number, default: 0 },
  reputationScore: { type: Number, default: 0 },
  bio:             { type: String, default: '', maxlength: 300 },
  location:        { type: String, default: '' },
  skills:          [{ type: String }],
  completedLessons:{ type: Number, default: 0 },
  followers:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pendingFollowRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  badges:          [{ type: String }],
  stats: {
    postsCount:       { type: Number, default: 0 },
    coursesCompleted: { type: Number, default: 0 },
  },
}, { timestamps: true });

userSchema.index({ skills: 1 });
userSchema.index({ followers: 1 });
userSchema.index({ following: 1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.generateToken = function() {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

userSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
