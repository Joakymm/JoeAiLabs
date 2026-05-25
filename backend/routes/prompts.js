const router = require('express').Router();
const Prompt = require('../models/Prompt');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// ── GET /api/prompts — list with search & filter ──────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const { search, category, difficulty, tag, toolType, sort = 'popular', page = 1, limit = 20 } = req.query;
    const query = { isPublished: true };

    if (category)   query.category   = { $regex: category,   $options: 'i' };
    if (difficulty) query.difficulty  = difficulty;
    if (tag)        query.tags        = { $in: [tag] };
    if (toolType)   query.toolType    = toolType;
    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { promptText:  { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags:        { $in: [new RegExp(search, 'i')] } },
      ];
    }

    let sortOpt = {};
    if (sort === 'popular')       sortOpt = { copyCount: -1, createdAt: -1 };
    else if (sort === 'newest')   sortOpt = { createdAt: -1 };
    else if (sort === 'oldest')   sortOpt = { createdAt: 1 };
    else if (sort === 'az')       sortOpt = { title: 1 };
    else if (sort === 'za')       sortOpt = { title: -1 };
    else                          sortOpt = { copyCount: -1, createdAt: -1 };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Prompt.countDocuments(query);
    const prompts = await Prompt.find(query)
      .sort(sortOpt)
      .skip(skip)
      .limit(Number(limit));

    const categories = await Prompt.distinct('category', { isPublished: true });
    const toolTypes = await Prompt.distinct('toolType', { isPublished: true });
    
    // Efficiently aggregate counts for all tool types in one query
    const toolTypeCountsRaw = await Prompt.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$toolType', count: { $sum: 1 } } }
    ]);

    const toolTypeCounts = {};
    toolTypeCountsRaw.forEach(item => toolTypeCounts[item._id] = item.count);

    res.json({
      success: true,
      data: prompts,
      meta: {
        total, page: Number(page), limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
        categories, toolTypes, toolTypeCounts,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/prompts/bookmarks/list — get user's bookmarked prompt IDs ─────────
router.get('/bookmarks/list', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user.bookmarks || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/prompts/:id — single prompt ──────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found.' });
    res.json({ success: true, data: prompt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/prompts/:id/copy — increment copy counter ───────────────────────
router.post('/:id/copy', protect, async (req, res) => {
  try {
    await Prompt.findByIdAndUpdate(req.params.id, { $inc: { copyCount: 1 } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/prompts/:id/bookmark ─────────────────────────────────────────
router.post('/:id/bookmark', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const idx = user.bookmarks.findIndex(b => b.toString() === req.params.id);
    if (idx !== -1) user.bookmarks.splice(idx, 1);
    else user.bookmarks.push(req.params.id);

    await user.save();
    res.json({ success: true, bookmarked: idx === -1 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/prompts/:id/related — similar prompts ─────────────────────────
router.get('/:id/related', protect, async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found.' });
    const related = await Prompt.find({
      _id: { $ne: prompt._id },
      isPublished: true,
      $or: [
        { toolType: prompt.toolType },
        { category: prompt.category },
        { tags: { $in: prompt.tags } },
      ],
    }).limit(6).sort({ copyCount: -1 });
    res.json({ success: true, data: related });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
