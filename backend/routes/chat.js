const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const ChatMessage = require('../models/ChatMessage');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const messages = await ChatMessage.find()
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: messages.reverse() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      systemInstruction: `You are JOE, an AI tutor and copilot for the JOEAILABS platform — Africa's #1 AI education platform.

You help students learn about:
- AI image generation (Midjourney, DALL-E, Stable Diffusion)
- AI music creation (Suno, Udio)
- AI video generation
- Voice cloning and AI avatars
- Prompt engineering and prompt crafting
- AI logo and graphic design
- AI coding assistants (Cursor, Lovable)
- AI automation (Make, n8n)
- General AI tools and productivity

Guidelines:
- Be friendly, enthusiastic, and encouraging — use a casual tone with occasional emojis
- Give detailed, practical answers with examples when possible
- When asked about platform features, explain what JOEAILABS offers
- You do NOT have access to the user's personal data or progress — ask them if they need help with specific topics
- If you don't know something, be honest and suggest where they might find the answer
- Keep responses concise but informative`,
    });

    const contents = [];
    if (Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role === 'user') {
          contents.push({ role: 'user', parts: [{ text: msg.text }] });
        } else if (msg.role === 'assistant') {
          contents.push({ role: 'model', parts: [{ text: msg.text }] });
        }
      }
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    const result = await model.generateContentStream({ contents });

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error('Gemini API error:', err);
    const errorMsg = err.message || 'AI service error';

    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ success: false, message: errorMsg });
    }
  }
});

module.exports = router;
