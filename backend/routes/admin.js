const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Prompt = require('../models/Prompt');
const Payment = require('../models/Payment');
const { Quiz, QuizAttempt } = require('../models/Quiz');
const SystemSetting = require('../models/SystemSetting');

router.use(protect, adminOnly);

// ── MODULES ─────────────────────────────────────────────────────────────────
router.get('/modules', async (req, res) => {
  try {
    const modules = await Module.find().sort('order');
    const withCounts = await Promise.all(modules.map(async (m) => {
      const lessonCount = await Lesson.countDocuments({ moduleId: m._id });
      return { ...m.toJSON(), lessonCount };
    }));
    res.json({ success: true, data: withCounts });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/modules', async (req, res) => {
  try {
    const mod = await Module.create(req.body);
    res.status(201).json({ success: true, data: mod });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.put('/modules/:id', async (req, res) => {
  try {
    const mod = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!mod) return res.status(404).json({ success: false, message: 'Module not found.' });
    res.json({ success: true, data: mod });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.delete('/modules/:id', async (req, res) => {
  try {
    await Lesson.deleteMany({ moduleId: req.params.id });
    await Module.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/modules/:id/reorder', async (req, res) => {
  try {
    const { order } = req.body;
    await Module.findByIdAndUpdate(req.params.id, { order });
    res.json({ success: true });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// ── LESSONS ─────────────────────────────────────────────────────────────────
router.get('/modules/:moduleId/lessons', async (req, res) => {
  try {
    const lessons = await Lesson.find({ moduleId: req.params.moduleId }).sort('order');
    res.json({ success: true, data: lessons });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/lessons', async (req, res) => {
  try {
    const lesson = await Lesson.create(req.body);
    res.status(201).json({ success: true, data: lesson });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.put('/lessons/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found.' });
    res.json({ success: true, data: lesson });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.delete('/lessons/:id', async (req, res) => {
  try {
    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── PROMPTS ─────────────────────────────────────────────────────────────────
router.get('/prompts', async (req, res) => {
  try {
    const { search, toolType, category, difficulty, page = 1, limit = 50 } = req.query;
    const query = {};
    if (search)     query.$or = [{ title: { $regex: search, $options: 'i' } }, { promptText: { $regex: search, $options: 'i' } }];
    if (toolType)   query.toolType = toolType;
    if (category)   query.category = { $regex: category, $options: 'i' };
    if (difficulty) query.difficulty = difficulty;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Prompt.countDocuments(query);
    const prompts = await Prompt.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    const categories = await Prompt.distinct('category');
    const toolTypes = await Prompt.distinct('toolType');
    res.json({ success: true, data: prompts, meta: { total, page: Number(page), pages: Math.ceil(total / Number(limit)), categories, toolTypes } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/prompts', async (req, res) => {
  try {
    const prompt = await Prompt.create(req.body);
    res.status(201).json({ success: true, data: prompt });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.post('/prompts/bulk-import', async (req, res) => {
  try {
    const { prompts } = req.body;
    if (!Array.isArray(prompts) || prompts.length === 0) {
      return res.status(400).json({ success: false, message: 'Prompts array is required.' });
    }
    const inserted = await Prompt.insertMany(prompts, { ordered: false });
    res.status(201).json({ success: true, data: inserted, count: inserted.length });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.put('/prompts/:id', async (req, res) => {
  try {
    const prompt = await Prompt.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found.' });
    res.json({ success: true, data: prompt });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.patch('/prompts/:id/featured', async (req, res) => {
  try {
    const prompt = await Prompt.findByIdAndUpdate(req.params.id, { featured: req.body.featured }, { new: true });
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found.' });
    res.json({ success: true, data: prompt });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/prompts/:id', async (req, res) => {
  try {
    await Prompt.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── USERS ───────────────────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { search, premium, page = 1, limit = 50 } = req.query;
    const query = {};
    if (search) query.$or = [{ username: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }, { fullName: { $regex: search, $options: 'i' } }];
    if (premium === 'true') query.isPremium = true;
    if (premium === 'false') query.isPremium = false;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    res.json({ success: true, data: users, meta: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/users/:id/premium', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isPremium: req.body.isPremium }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, data: user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'seller', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, data: user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── ANALYTICS ───────────────────────────────────────────────────────────────
router.get('/analytics', async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const totalUsers = await User.countDocuments();
    const premiumUsers = await User.countDocuments({ isPremium: true });
    const newSignups = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const totalModules = await Module.countDocuments();
    const totalLessons = await Lesson.countDocuments();
    const totalPrompts = await Prompt.countDocuments();

    const completedLessons = await User.aggregate([
      { $unwind: '$completedLessons' },
      { $group: { _id: null, total: { $sum: 1 } } },
    ]);

    const topLessons = await Lesson.aggregate([
      {
        $lookup: {
          from: 'users',
          let: { lessonId: '$_id' },
          pipeline: [
            { $unwind: '$completedLessons' },
            { $match: { $expr: { $eq: ['$completedLessons.lessonId', '$$lessonId'] } } },
          ],
          as: 'completed',
        },
      },
      { $project: { title: 1, count: { $size: '$completed' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const topPrompts = await Prompt.find().sort({ copyCount: -1 }).limit(10).select('title copyCount');

    const payments = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const dailySignups = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const moduleProgress = await Module.aggregate([
      { $lookup: { from: 'lessons', localField: '_id', foreignField: 'moduleId', as: 'lessons' } },
      { $project: { title: 1, lessonCount: { $size: '$lessons' } } },
      { $sort: { order: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        overview: { totalUsers, premiumUsers, newSignups, totalModules, totalLessons, totalPrompts, completedLessons: completedLessons[0]?.total || 0 },
        revenue: payments[0] || { totalRevenue: 0, count: 0 },
        topLessons: topLessons.filter(l => l.count > 0),
        topPrompts,
        dailySignups,
        moduleProgress,
      },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── PAYMENTS ────────────────────────────────────────────────────────────────
router.get('/payments', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Payment.countDocuments();
    const payments = await Payment.find().populate('userId', 'username email').sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    res.json({ success: true, data: payments, meta: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── QUIZZES ─────────────────────────────────────────────────────────────────
router.get('/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate('moduleId', 'title').sort({ createdAt: -1 });
    res.json({ success: true, data: quizzes });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/quizzes', async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json({ success: true, data: quiz });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.put('/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });
    res.json({ success: true, data: quiz });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.delete('/quizzes/:id', async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    await QuizAttempt.deleteMany({ quizId: req.params.id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/quiz-results/:quizId', async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ quizId: req.params.quizId }).populate('userId', 'username email').sort({ createdAt: -1 });
    const quiz = await Quiz.findById(req.params.quizId);
    const avgScore = attempts.length > 0 ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length) : 0;
    res.json({ success: true, data: { attempts, avgScore, totalAttempts: attempts.length, quizTitle: quiz?.title } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── SYSTEM SETTINGS ─────────────────────────────────────────────────────────
router.get('/settings', async (req, res) => {
  try {
    const keys = ['maintenanceMode', 'announcement', 'paymentMethods', 'communityLinks', 'premiumPricing'];
    const settings = await SystemSetting.find({ key: { $in: keys } });
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });
    res.json({ success: true, data: map });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/settings/:key', async (req, res) => {
  try {
    const setting = await SystemSetting.findOneAndUpdate(
      { key: req.params.key },
      { value: req.body.value },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: setting });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

module.exports = router;
