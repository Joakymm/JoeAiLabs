const express = require('express');
const Prompt = require('../models/Prompt');
const Bookmark = require('../models/Bookmark');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.toolType) filter.toolType = req.query.toolType;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    if (req.query.featured) filter.featured = true;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const [prompts, total] = await Promise.all([
      Prompt.find(filter).sort({ featured: -1, copyCount: -1 }).skip(skip).limit(limit),
      Prompt.countDocuments(filter),
    ]);
    res.json({ success: true, data: prompts, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/bookmarks/list', protect, async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id }).populate('prompt');
    res.json({ success: true, data: bookmarks.map(b => b.prompt) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found' });
    res.json({ success: true, data: prompt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/copy', async (req, res) => {
  try {
    const prompt = await Prompt.findByIdAndUpdate(
      req.params.id,
      { $inc: { copyCount: 1 } },
      { new: true }
    );
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found' });
    res.json({ success: true, data: prompt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/bookmark', protect, async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found' });
    const existing = await Bookmark.findOne({ user: req.user._id, prompt: prompt._id });
    if (existing) {
      await existing.deleteOne();
      return res.json({ success: true, bookmarked: false });
    }
    await Bookmark.create({ user: req.user._id, prompt: prompt._id });
    res.json({ success: true, bookmarked: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id/related', async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found' });
    const related = await Prompt.find({
      _id: { $ne: prompt._id },
      category: prompt.category,
    }).limit(5);
    res.json({ success: true, data: related });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
