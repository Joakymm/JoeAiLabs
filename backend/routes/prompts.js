const router = require('express').Router();
const Prompt = require('../models/Prompt');
const { protect } = require('../middleware/auth');

// ── GET /api/prompts — list with search & filter ──────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const { search, category, difficulty, tag, toolType, page = 1, limit = 20 } = req.query;
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

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Prompt.countDocuments(query);
    const prompts = await Prompt.find(query)
      .sort({ copyCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const categories = await Prompt.distinct('category', { isPublished: true });
    const toolTypes = await Prompt.distinct('toolType', { isPublished: true });
    const toolTypeCounts = {};
    for (const tt of toolTypes) {
      toolTypeCounts[tt] = await Prompt.countDocuments({ isPublished: true, toolType: tt });
    }

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

module.exports = router;
