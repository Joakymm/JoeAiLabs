const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');
const { avatarUpload, coverUpload, uploadAvatar, uploadCover, deleteFromCloudinary } = require('../services/cloudinary');

const router = express.Router();

router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find()
      .sort({ reputationScore: -1, xp: -1 })
      .limit(100)
      .select('username avatar reputationScore xp isPremium completedLessons createdAt stats.postsCount followers');
    const data = users.map((u, i) => ({
      rank: i + 1,
      _id: u._id,
      username: u.username,
      avatar: u.avatar || '',
      reputationScore: u.reputationScore || 0,
      xp: u.xp || 0,
      isPremium: u.isPremium || false,
      completedLessons: u.completedLessons || 0,
      stats: u.stats || { postsCount: 0 },
      followerCount: u.followers?.length || 0,
      createdAt: u.createdAt,
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/profile - Update profile info
router.put('/profile', protect, async (req, res) => {
  try {
    const allowed = ['bio', 'location', 'username', 'isPrivate'];
    allowed.forEach(f => {
      if (req.body[f] !== undefined) req.user[f] = req.body[f];
    });
    if (req.user.bio && req.user.bio.length > 300) {
      return res.status(400).json({ success: false, message: 'Bio must be under 300 characters' });
    }
    await req.user.save();
    res.json({ success: true, data: req.user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/users/avatar - Upload profile picture
router.post('/avatar', protect, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    if (req.user.avatar) {
      const publicId = req.user.avatar.split('/').pop().split('.')[0];
      await deleteFromCloudinary(`joeailabs/avatars/${publicId}`);
    }
    const result = await uploadAvatar(req.file.buffer);
    req.user.avatar = result.secure_url;
    await req.user.save();
    res.json({ success: true, data: { avatar: req.user.avatar } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/users/cover - Upload cover photo
router.post('/cover', protect, coverUpload.single('cover'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    if (req.user.coverPhoto) {
      const publicId = req.user.coverPhoto.split('/').pop().split('.')[0];
      await deleteFromCloudinary(`joeailabs/covers/${publicId}`);
    }
    const result = await uploadCover(req.file.buffer);
    req.user.coverPhoto = result.secure_url;
    await req.user.save();
    res.json({ success: true, data: { coverPhoto: req.user.coverPhoto } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/users/skills - Add skill tags
router.post('/skills', protect, async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill || typeof skill !== 'string') {
      return res.status(400).json({ success: false, message: 'Skill is required' });
    }
    if (req.user.skills.length >= 20) {
      return res.status(400).json({ success: false, message: 'Maximum 20 skills allowed' });
    }
    if (req.user.skills.includes(skill)) {
      return res.status(400).json({ success: false, message: 'Skill already added' });
    }
    req.user.skills.push(skill);
    await req.user.save();
    res.json({ success: true, data: { skills: req.user.skills } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/users/skills/:skill - Remove skill tag
router.delete('/skills/:skill', protect, async (req, res) => {
  try {
    req.user.skills = req.user.skills.filter(s => s !== req.params.skill);
    await req.user.save();
    res.json({ success: true, data: { skills: req.user.skills } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/search - Search users by name/skills
router.get('/search', protect, async (req, res) => {
  try {
    const q = req.query.q || '';
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const filter = q ? {
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { skills: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
      ],
    } : {};

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('username avatar bio skills reputationScore isPremium stats.postsCount followers')
        .sort({ reputationScore: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    const data = users.map(u => ({
      _id: u._id,
      username: u.username,
      avatar: u.avatar,
      bio: u.bio,
      skills: u.skills,
      reputationScore: u.reputationScore,
      postsCount: u.stats?.postsCount || 0,
      followerCount: u.followers?.length || 0,
      isFollowing: req.user.following?.some(f => f.toString() === u._id.toString()) || false,
    }));

    res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/:userId - Get user profile
router.get('/:userId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -email -pendingFollowRequests');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isFollowing = req.user.following?.some(f => f.toString() === user._id.toString());
    const isOwnProfile = req.user._id.toString() === user._id.toString();

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        isFollowing: isFollowing || false,
        isOwnProfile,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/:userId/posts - Get user's posts
router.get('/:userId/posts', protect, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isOwnProfile = req.user._id.toString() === targetUser._id.toString();
    const isFollowing = req.user.following?.some(f => f.toString() === targetUser._id.toString());

    if (targetUser.isPrivate && !isOwnProfile && !isFollowing) {
      return res.json({ success: true, data: [], message: 'This account is private' });
    }

    const cursor = req.query.cursor;
    const limit = Math.min(20, parseInt(req.query.limit) || 10);

    const query = { author: targetUser._id, isHidden: false };
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate('author', 'username avatar role isPremium reputationScore')
      .populate('comments.author', 'username avatar role isPremium');

    const hasMore = posts.length > limit;
    if (hasMore) posts.pop();

    const nextCursor = posts.length ? posts[posts.length - 1].createdAt.toISOString() : null;

    res.json({ success: true, data: posts, nextCursor, hasMore });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/:userId/followers - Get user's followers
router.get('/:userId/followers', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('followers', 'username avatar bio skills reputationScore isPremium');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user.followers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/:userId/following - Get users being followed
router.get('/:userId/following', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('following', 'username avatar bio skills reputationScore isPremium');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user.following });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
