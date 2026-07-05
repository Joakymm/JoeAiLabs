const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  moduleId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  title:       { type: String, required: true, trim: true },
  content:     { type: String, default: '' },
  summary:     { type: String, default: '' },
  videoUrl:    { type: String, default: '' },
  order:       { type: Number, default: 0 },
  duration:    { type: Number, default: 0 },
  published:   { type: Boolean, default: false },
  isPublished: { type: Boolean, default: false },
  tips:        [{ type: String }],
  keyTakeaways:[{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);
