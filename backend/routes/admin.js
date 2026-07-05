const express = require('express');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Prompt = require('../models/Prompt');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const SystemSetting = require('../models/SystemSetting');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(protect, adminOnly);

// ── Modules ──────────────────────────────────────────────────
router.get('/modules', async (req, res) => {
  try {
    const modules = await Module.find().sort({ order: 1 });
    res.json({ success: true, data: modules });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/modules', async (req, res) => {
  try {
    const mod = await Module.create(req.body);
    res.status(201).json({ success: true, data: mod });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/modules/:id', async (req, res) => {
  try {
    const mod = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!mod) return res.status(404).json({ success: false, message: 'Module not found' });
    res.json({ success: true, data: mod });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/modules/:id', async (req, res) => {
  try {
    await Module.findByIdAndDelete(req.params.id);
    await Lesson.deleteMany({ moduleId: req.params.id });
    res.json({ success: true, message: 'Module deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/modules/:id/reorder', async (req, res) => {
  try {
    const mod = await Module.findByIdAndUpdate(req.params.id, { order: req.body.order }, { new: true });
    res.json({ success: true, data: mod });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Lessons ──────────────────────────────────────────────────
router.get('/modules/:moduleId/lessons', async (req, res) => {
  try {
    const lessons = await Lesson.find({ moduleId: req.params.moduleId }).sort({ order: 1 });
    res.json({ success: true, data: lessons });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/lessons', async (req, res) => {
  try {
    const lesson = await Lesson.create(req.body);
    res.status(201).json({ success: true, data: lesson });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/lessons/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    res.json({ success: true, data: lesson });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/lessons/:id', async (req, res) => {
  try {
    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Lesson deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Prompts ──────────────────────────────────────────────────
router.get('/prompts', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) filter.title = { $regex: req.query.search, $options: 'i' };
    const prompts = await Prompt.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: prompts });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/prompts', async (req, res) => {
  try {
    const prompt = await Prompt.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: prompt });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/prompts/bulk-import', async (req, res) => {
  try {
    const prompts = await Prompt.insertMany(
      (req.body.prompts || []).map(p => ({ ...p, createdBy: req.user._id }))
    );
    res.status(201).json({ success: true, data: prompts });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/prompts/:id', async (req, res) => {
  try {
    const prompt = await Prompt.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found' });
    res.json({ success: true, data: prompt });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/prompts/:id/featured', async (req, res) => {
  try {
    const prompt = await Prompt.findByIdAndUpdate(
      req.params.id, { featured: req.body.featured }, { new: true }
    );
    res.json({ success: true, data: prompt });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/prompts/:id', async (req, res) => {
  try {
    await Prompt.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Prompt deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Users ────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) filter.$or = [
      { username: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/users/:id/premium', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id, { isPremium: req.body.isPremium }, { new: true }
    );
    res.json({ success: true, data: user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id, { role: req.body.role }, { new: true }
    );
    res.json({ success: true, data: user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Analytics ────────────────────────────────────────────────
router.get('/analytics', async (req, res) => {
  try {
    const [totalUsers, totalModules, totalLessons, totalPrompts] = await Promise.all([
      User.countDocuments(),
      Module.countDocuments(),
      Lesson.countDocuments(),
      Prompt.countDocuments(),
    ]);
    res.json({ success: true, data: { totalUsers, totalModules, totalLessons, totalPrompts } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Payments ─────────────────────────────────────────────────
router.get('/payments', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const payments = await Payment.find(filter).populate('user', 'username email').sort({ createdAt: -1 });
    res.json({ success: true, data: payments });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Quizzes ──────────────────────────────────────────────────
router.get('/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate('moduleId', 'title');
    res.json({ success: true, data: quizzes });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/quizzes', async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json({ success: true, data: quiz });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    res.json({ success: true, data: quiz });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/quizzes/:id', async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Quiz deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/quiz-results/:quizId', async (req, res) => {
  try {
    const results = await QuizResult.find({ quizId: req.params.quizId }).populate('user', 'username email');
    res.json({ success: true, data: results });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Settings ─────────────────────────────────────────────────
router.get('/settings', async (req, res) => {
  try {
    const settings = await SystemSetting.find();
    res.json({ success: true, data: settings });
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
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
