const mongoose = require('mongoose');

const TOOL_TYPES = ['image-generation', 'video-generation', 'voice-audio', 'writing-copy', 'code-generation', 'automation', 'research-analysis', 'presentation'];

const promptSchema = new mongoose.Schema({
  promptId:    { type: String, required: true, unique: true },
  category:    { type: String, required: true, index: true },
  subcategory: { type: String, default: '' },
  title:       { type: String, required: true },
  promptText:  { type: String, required: true },
  placeholders:[{ type: String }],
  description: { type: String, default: '' },
  tags:        [{ type: String }],
  difficulty:  { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  pluginsNeeded:[{ type: String }],
  estimatedTime:{ type: String, default: '5 min' },
  copyCount:   { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  toolType:    { type: String, enum: TOOL_TYPES, default: 'writing-copy', index: true },
  toolName:    { type: String, default: '' },
  sampleOutput: {
    type: { type: String, enum: ['text', 'image', 'video', 'audio', ''], default: '' },
    url: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    _id: false,
  },
}, { timestamps: true });

promptSchema.index({ category: 1, subcategory: 1 });
promptSchema.index({ tags: 1 });

module.exports = mongoose.model('Prompt', promptSchema);
