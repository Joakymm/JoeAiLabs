const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
  title:          { type: String, required: true, trim: true },
  promptText:     { type: String },
  content:        { type: String, required: true },
  category:       { type: String, default: 'general' },
  toolType:       { type: String, default: '' },
  toolName:       { type: String, default: '' },
  difficulty:     { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  subcategory:    { type: String, default: '' },
  estimatedTime:  { type: String, default: '' },
  tags:           [{ type: String }],
  featured:       { type: Boolean, default: false },
  isFeatured:     { type: Boolean, default: false },
  copyCount:      { type: Number, default: 0 },
  createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Prompt', promptSchema);
