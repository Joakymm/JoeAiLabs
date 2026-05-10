const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  moduleId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  order:       { type: Number, required: true },
  title:       { type: String, required: true, trim: true },
  content:     { type: String, required: true },   // Rich text / markdown
  summary:     { type: String, default: '' },
  videoUrl:    { type: String, default: '' },
  duration:    { type: Number, default: 10 },       // minutes
  type:        { type: String, enum: ['text', 'video', 'interactive'], default: 'text' },
  tips:        [{ type: String }],
  keyTakeaways:[{ type: String }],
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

// Compound index: one order per module
lessonSchema.index({ moduleId: 1, order: 1 }, { unique: true });

module.exports = mongoose.model('Lesson', lessonSchema);
