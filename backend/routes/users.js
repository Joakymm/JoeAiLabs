const router = require('express').Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/leaderboard', protect, async (req, res) => {
  try {
    const users = await User.find()
      .select('username avatar reputationScore completedLessons createdAt')
      .sort({ reputationScore: -1 })
      .limit(100)
      .lean();
    const data = users.map((u, i) => ({
      rank: i + 1,
      _id: u._id,
      username: u.username,
      avatar: u.avatar,
      reputationScore: u.reputationScore,
      lessonsCompleted: u.completedLessons?.length || 0,
      joinedAt: u.createdAt,
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
