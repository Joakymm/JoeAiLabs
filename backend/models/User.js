const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const progressEntrySchema = new mongoose.Schema({
  lessonId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  moduleId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  completedAt: { type: Date, default: Date.now },
}, { _id: false });

const userSchema = new mongoose.Schema({
  username:        { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
  email:           { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:        { type: String, required: true, minlength: 6, select: false },
  fullName:        { type: String, trim: true, default: '' },
  avatar:          { type: String, default: '' },
  bio:             { type: String, default: '', maxlength: 500 },
  role:            { type: String, enum: ['user', 'seller', 'moderator', 'admin'], default: 'user' },
  isPremium:       { type: Boolean, default: false },
  reputationScore: { type: Number, default: 0 },
  completedLessons:{ type: [progressEntrySchema], default: [] },
  bookmarks:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prompt' }],
  lastActive:      { type: Date, default: Date.now },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

// Virtual: completion count
userSchema.virtual('completedCount').get(function () {
  return this.completedLessons.length;
});

module.exports = mongoose.model('User', userSchema);
