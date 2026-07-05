const express = require('express');
const User = require('../models/User');
const FollowRequest = require('../models/FollowRequest');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/follow/:userId - Follow user (or send request for private accounts)
router.post('/:userId', protect, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
    }

    const isFollowing = req.user.following.includes(targetUser._id);
    if (isFollowing) {
      return res.status(400).json({ success: false, message: 'Already following this user' });
    }

    if (targetUser.isPrivate) {
      const existing = await FollowRequest.findOne({
        from: req.user._id,
        to: targetUser._id,
        status: 'pending',
      });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Follow request already sent' });
      }

      await FollowRequest.create({
        from: req.user._id,
        to: targetUser._id,
        status: 'pending',
      });

      await User.findByIdAndUpdate(targetUser._id, {
        $addToSet: { pendingFollowRequests: req.user._id },
      });

      await Notification.create({
        recipient: targetUser._id,
        sender: req.user._id,
        type: 'follow_request',
        referenceId: req.user._id,
      });

      const io = req.app.get('io');
      if (io) {
        io.to(`user:${targetUser._id}`).emit('follow-event', {
          type: 'request',
          from: req.user._id,
        });
      }

      return res.json({ success: true, message: 'Follow request sent', isPending: true });
    }

    req.user.following.push(targetUser._id);
    await req.user.save();
    await User.findByIdAndUpdate(targetUser._id, { $addToSet: { followers: req.user._id } });

    await Notification.create({
      recipient: targetUser._id,
      sender: req.user._id,
      type: 'follow_accepted',
      referenceId: req.user._id,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${targetUser._id}`).emit('follow-event', {
        type: 'followed',
        from: req.user._id,
      });
    }

    res.json({ success: true, message: 'Followed successfully', isPending: false });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/follow/:userId - Unfollow user
router.delete('/:userId', protect, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    req.user.following.pull(targetUser._id);
    await req.user.save();
    await User.findByIdAndUpdate(targetUser._id, { $pull: { followers: req.user._id } });

    await FollowRequest.findOneAndDelete({ from: req.user._id, to: targetUser._id });

    res.json({ success: true, message: 'Unfollowed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/follow/requests/:requestId/accept - Accept follow request
router.put('/requests/:requestId/accept', protect, async (req, res) => {
  try {
    const request = await FollowRequest.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    if (request.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    request.status = 'accepted';
    await request.save();

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { followers: request.from } });
    await User.findByIdAndUpdate(request.from, { $addToSet: { following: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $pull: { pendingFollowRequests: request.from } });

    await Notification.create({
      recipient: request.from,
      sender: req.user._id,
      type: 'follow_accepted',
      referenceId: req.user._id,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${request.from}`).emit('follow-event', { type: 'accepted', by: req.user._id });
    }

    res.json({ success: true, message: 'Follow request accepted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/follow/requests/:requestId/decline - Decline follow request
router.put('/requests/:requestId/decline', protect, async (req, res) => {
  try {
    const request = await FollowRequest.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    if (request.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    request.status = 'declined';
    await request.save();

    await User.findByIdAndUpdate(req.user._id, { $pull: { pendingFollowRequests: request.from } });

    res.json({ success: true, message: 'Follow request declined' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/follow/requests/pending - Get pending follow requests (incoming)
router.get('/requests/pending', protect, async (req, res) => {
  try {
    const requests = await FollowRequest.find({ to: req.user._id, status: 'pending' })
      .populate('from', 'username avatar bio skills reputationScore');

    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/follow/suggestions - Get suggested users to follow
router.get('/suggestions', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('skills following followers');

    const followingIds = [...(user.following || []), req.user._id];

    const similarUsers = await User.find({
      _id: { $nin: followingIds },
      skills: { $in: user.skills || [] },
    })
      .select('username avatar bio skills reputationScore stats.postsCount followers')
      .sort({ reputationScore: -1 })
      .limit(10);

    if (similarUsers.length < 10) {
      const existingIds = similarUsers.map(u => u._id);
      const moreUsers = await User.find({
        _id: { $nin: [...followingIds, ...existingIds] },
      })
        .select('username avatar bio skills reputationScore stats.postsCount followers')
        .sort({ reputationScore: -1 })
        .limit(10 - similarUsers.length);

      similarUsers.push(...moreUsers);
    }

    const data = similarUsers.map(u => ({
      _id: u._id,
      username: u.username,
      avatar: u.avatar,
      bio: u.bio,
      skills: u.skills,
      reputationScore: u.reputationScore,
      postsCount: u.stats?.postsCount || 0,
      followersCount: u.followers?.length || 0,
      isFollowing: user.following.some(f => f.toString() === u._id.toString()),
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/follow/:userId/status - Get follow relationship status
router.get('/:userId/status', protect, async (req, res) => {
  try {
    const targetId = req.params.userId;
    const isFollowing = req.user.following.some(id => id.toString() === targetId);
    const hasPendingRequest = await FollowRequest.exists({
      from: req.user._id,
      to: targetId,
      status: 'pending',
    });

    res.json({
      success: true,
      data: {
        isFollowing,
        hasPendingRequest: !!hasPendingRequest,
        isOwnProfile: req.user._id.toString() === targetId,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
