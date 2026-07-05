const express = require('express');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/conversations - Get user's conversations
router.get('/', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'username avatar isPremium')
      .populate('lastMessage.sender', 'username avatar')
      .sort({ updatedAt: -1 });

    const data = await Promise.all(conversations.map(async (conv) => {
      const unreadCount = await Message.countDocuments({
        conversationId: conv._id,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id },
      });
      return { ...conv.toObject(), unreadCount };
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/conversations - Create or get existing conversation
router.post('/', protect, async (req, res) => {
  try {
    const { participantId } = req.body;
    if (!participantId) {
      return res.status(400).json({ success: false, message: 'Participant ID required' });
    }
    if (participantId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot chat with yourself' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId], $size: 2 },
    }).populate('participants', 'username avatar isPremium')
      .populate('lastMessage.sender', 'username avatar');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, participantId],
      });
      conversation = await conversation.populate('participants', 'username avatar isPremium');
    }

    res.json({ success: true, data: conversation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/conversations/:conversationId/messages - Get messages
router.get('/:conversationId/messages', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }
    if (!conversation.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not a participant' });
    }

    const cursor = req.query.cursor;
    const limit = Math.min(50, parseInt(req.query.limit) || 20);

    const query = { conversationId: req.params.conversationId };
    if (cursor) {
      query.sentAt = { $lt: new Date(cursor) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'username avatar')
      .sort({ sentAt: -1 })
      .limit(limit + 1);

    const hasMore = messages.length > limit;
    if (hasMore) messages.pop();

    const nextCursor = messages.length ? messages[messages.length - 1].sentAt.toISOString() : null;

    res.json({ success: true, data: messages.reverse(), nextCursor, hasMore });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/conversations/:conversationId/messages - Send message
router.post('/:conversationId/messages', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }
    if (!conversation.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not a participant' });
    }

    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: 'Message text required' });
    }

    const message = await Message.create({
      conversationId: req.params.conversationId,
      sender: req.user._id,
      text,
      readBy: [req.user._id],
      sentAt: new Date(),
      deliveredAt: new Date(),
    });

    conversation.lastMessage = {
      sender: req.user._id,
      text: text.substring(0, 100),
      sentAt: new Date(),
    };
    conversation.updatedAt = new Date();
    await conversation.save();

    const populated = await message.populate('sender', 'username avatar');

    const recipient = conversation.participants.find(p => p.toString() !== req.user._id.toString());

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${recipient}`).emit('send-message', { message: populated, conversationId: req.params.conversationId });
    }

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/conversations/messages/:messageId/read - Mark message as read
router.put('/messages/:messageId/read', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (!message.readBy.includes(req.user._id)) {
      message.readBy.push(req.user._id);
      message.readAt = new Date();
      await message.save();
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${message.sender}`).emit('message-read', {
        messageId: message._id,
        conversationId: message.conversationId,
        readBy: req.user._id,
      });
    }

    res.json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/conversations/unread-count
router.get('/unread/total', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id }).select('_id');
    const conversationIds = conversations.map(c => c._id);

    const count = await Message.countDocuments({
      conversationId: { $in: conversationIds },
      sender: { $ne: req.user._id },
      readBy: { $ne: req.user._id },
    });

    res.json({ success: true, data: { count } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
