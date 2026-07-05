const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const { upload, uploadImage, deleteFromCloudinary } = require('../services/cloudinary');

const router = express.Router();

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

// POST /api/posts - Create post (text, image, video, achievement)
router.post('/', protect, [
  body('content').optional().trim().isLength({ max: 5000 }),
  body('type').isIn(['text', 'image', 'video', 'achievement']),
], validate, async (req, res) => {
  try {
    const { content, type, mediaUrl, mediaPublicId, isAchievement, courseReference } = req.body;

    const post = await Post.create({
      author: req.user._id,
      content: content || '',
      type,
      mediaUrl: mediaUrl || '',
      mediaPublicId: mediaPublicId || '',
      isAchievement: isAchievement || false,
      courseReference: courseReference || undefined,
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.postsCount': 1 } });

    const populated = await Post.findById(post._id)
      .populate('author', 'username avatar role isPremium reputationScore')
      .populate('comments.author', 'username avatar role isPremium');

    const io = req.app.get('io');
    if (io) {
      const user = await User.findById(req.user._id).select('followers');
      if (user?.followers?.length) {
        user.followers.forEach(fId => {
          io.to(`user:${fId}`).emit('post-created', { post: populated });
        });
      }
    }

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/posts/with-media - Create post with file upload
router.post('/with-media', protect, upload.single('media'), async (req, res) => {
  try {
    const { content, type } = req.body;
    const postType = type || (req.file?.mimetype?.startsWith('video') ? 'video' : 'image');

    let mediaUrl = '';
    let mediaPublicId = '';
    if (req.file) {
      const result = await uploadImage(req.file.buffer);
      mediaUrl = result.secure_url;
      mediaPublicId = result.public_id;
    }

    const post = await Post.create({
      author: req.user._id,
      content: content || '',
      type: postType,
      mediaUrl,
      mediaPublicId,
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.postsCount': 1 } });

    const populated = await Post.findById(post._id)
      .populate('author', 'username avatar role isPremium reputationScore')
      .populate('comments.author', 'username avatar role isPremium');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/posts/feed - Get feed posts (paginated, cursor-based)
router.get('/feed', protect, async (req, res) => {
  try {
    const cursor = req.query.cursor;
    const limit = Math.min(20, parseInt(req.query.limit) || 10);

    const user = await User.findById(req.user._id).select('following');
    const followingIds = [...(user.following || []), req.user._id];

    const query = { author: { $in: followingIds }, isHidden: false };
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

// GET /api/posts/discover - Discovery feed (posts from users with similar skills)
router.get('/discover', protect, async (req, res) => {
  try {
    const cursor = req.query.cursor;
    const limit = Math.min(20, parseInt(req.query.limit) || 10);

    const user = await User.findById(req.user._id).select('skills following');
    const followingIds = [...(user.following || []), req.user._id];

    const similarUsers = await User.find({
      _id: { $nin: followingIds },
      skills: { $in: user.skills || [] },
    }).select('_id').limit(50);

    const similarIds = similarUsers.map(u => u._id);

    const query = {};
    if (similarIds.length) query.author = { $in: similarIds };
    else query.author = { $nin: followingIds };
    query.isHidden = false;

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1, likes: -1 })
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

// GET /api/posts/:postId - Get single post
router.get('/:postId', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('author', 'username avatar role isPremium reputationScore')
      .populate('comments.author', 'username avatar role isPremium');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/posts/:postId - Update post (within 24 hours)
router.put('/:postId', protect, [
  body('content').optional().trim().isLength({ max: 5000 }),
], validate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const hoursSinceCreation = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
      return res.status(400).json({ success: false, message: 'Can only edit posts within 24 hours' });
    }

    if (req.body.content !== undefined) post.content = req.body.content;
    post.isEdited = true;
    await post.save();

    const populated = await Post.findById(post._id)
      .populate('author', 'username avatar role isPremium reputationScore')
      .populate('comments.author', 'username avatar role isPremium');

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/posts/:postId - Delete post (author or admin only)
router.delete('/:postId', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (post.mediaPublicId) {
      await deleteFromCloudinary(post.mediaPublicId);
    }

    await Post.findByIdAndDelete(req.params.postId);
    await User.findByIdAndUpdate(post.author, { $inc: { 'stats.postsCount': -1 } });

    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/posts/:postId/like - Toggle like
router.post('/:postId/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const idx = post.likes.indexOf(req.user._id);
    let liked = false;
    if (idx === -1) {
      post.likes.push(req.user._id);
      liked = true;
    } else {
      post.likes.splice(idx, 1);
    }
    await post.save();

    if (liked && post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'like',
        referenceId: post._id,
        metadata: {
          postPreview: post.content?.substring(0, 100) || '',
        },
      });

      const io = req.app.get('io');
      if (io) {
        io.to(`user:${post.author}`).emit('like-event', {
          postId: post._id,
          userId: req.user._id,
        });
      }
    }

    res.json({ success: true, data: { likes: post.likes, likeCount: post.likes.length, liked } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/posts/:postId/comments - Add comment
router.post('/:postId/comments', protect, [
  body('text').trim().isLength({ min: 1, max: 1000 }),
  body('parentComment').optional().isMongoId(),
], validate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const { text, parentComment } = req.body;

    if (parentComment) {
      const parent = post.comments.id(parentComment);
      if (!parent) {
        return res.status(404).json({ success: false, message: 'Parent comment not found' });
      }
      if (parent.parentComment) {
        return res.status(400).json({ success: false, message: 'Cannot reply to a nested reply (max 2 levels)' });
      }
    }

    post.comments.push({
      author: req.user._id,
      text,
      parentComment: parentComment || null,
    });
    await post.save();

    const newComment = post.comments[post.comments.length - 1];

    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'comment',
        referenceId: post._id,
        metadata: {
          postPreview: post.content?.substring(0, 100) || '',
          commentPreview: text.substring(0, 100),
        },
      });

      const io = req.app.get('io');
      if (io) {
        io.to(`user:${post.author}`).emit('comment-created', {
          postId: post._id,
          comment: newComment,
        });
      }
    }

    const populated = await Post.findById(post._id)
      .populate('author', 'username avatar role isPremium reputationScore')
      .populate('comments.author', 'username avatar role isPremium');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/posts/:postId/comments/:commentId - Edit comment
router.put('/:postId/comments/:commentId', protect, [
  body('text').trim().isLength({ min: 1, max: 1000 }),
], validate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    comment.text = req.body.text;
    comment.isEdited = true;
    await post.save();

    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/posts/:postId/comments/:commentId - Delete comment
router.delete('/:postId/comments/:commentId', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    if (comment.author.toString() !== req.user._id.toString() && post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    post.comments.pull({ _id: req.params.commentId });
    await post.save();

    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/posts/:postId/comments/:commentId/like - Toggle comment like
router.post('/:postId/comments/:commentId/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const idx = comment.likes.indexOf(req.user._id);
    if (idx === -1) {
      comment.likes.push(req.user._id);
    } else {
      comment.likes.splice(idx, 1);
    }
    await post.save();

    res.json({ success: true, data: { likes: comment.likes, likeCount: comment.likes.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/posts/achievement - Auto-generate achievement post
router.post('/achievement', protect, async (req, res) => {
  try {
    const { courseReference, courseName } = req.body;
    if (!courseReference) {
      return res.status(400).json({ success: false, message: 'Course reference required' });
    }

    const post = await Post.create({
      author: req.user._id,
      type: 'achievement',
      content: `🎉 I just completed "${courseName || 'a course'}" on JOEAILABS! #NeverStopLearning`,
      isAchievement: true,
      courseReference,
    });

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.postsCount': 1, 'stats.coursesCompleted': 1 },
    });

    const populated = await Post.findById(post._id)
      .populate('author', 'username avatar role isPremium reputationScore');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/posts/:postId/report - Report a post
router.post('/:postId/report', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    if (post.reportedBy.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Already reported' });
    }
    post.reportedBy.push(req.user._id);
    post.reportCount = post.reportedBy.length;
    await post.save();
    res.json({ success: true, message: 'Reported' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/posts/:postId/comments/:commentId/report - Report a comment
router.post('/:postId/comments/:commentId/report', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    res.json({ success: true, message: 'Comment reported' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
