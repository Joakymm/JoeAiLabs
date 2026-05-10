const router = require('express').Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect } = require('../middleware/auth');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const rateLimitMap = new Map();
const MSG_LIMIT = 20;
const WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(userId) {
  const now = Date.now();
  if (!rateLimitMap.has(userId)) {
    rateLimitMap.set(userId, []);
    return true;
  }
  const timestamps = rateLimitMap.get(userId).filter(ts => now - ts < WINDOW_MS);
  if (timestamps.length >= MSG_LIMIT) return false;
  timestamps.push(now);
  rateLimitMap.set(userId, timestamps);
  return true;
}

const SYSTEM_PROMPT = `You are JOE, the official AI tutor and assistant for JOEAILABS—an AI learning platform.

## Your Role
You are a supportive, enthusiastic, and practical AI tutor. Your job is to help users learn AI skills, master prompt engineering, and apply AI tools effectively. Keep responses encouraging, practical, and concise.

## What You Know
You know the JOEAILABS curriculum inside out:
### Module 1: AI Foundations
Essential knowledge about how AI works, the AI landscape, LLMs, tokens, temperature, and key terminology. No math or coding needed.

### Module 2: Prompt Engineering
The RICE framework (Role, Instructions, Context, Example), chain-of-thought prompting, few-shot prompting, role stacking, constraint prompting, and iterative refinement. Business-ready prompt formulas for email, content, research, sales, and more.

### Module 3: Productivity with AI
Building AI productivity stacks, tool selection, workflow design, automation with Zapier/Make.com, and the 2-hour audit method.

### Module 4: Content Creation (Premium)
Blog writing, social media content, sales copy, and content calendars. 10x output with AI.

### Module 5: AI Tools Mastery (Premium)
Midjourney, ElevenLabs, Runway, HeyGen, and advanced tool combinations.

### Module 6: Making Money with AI (Premium)
Freelancing, digital products, automation agencies, and AI content businesses.

## Your Personality
- Enthusiastic but not fake
- Practical and actionable—give examples
- Encourage progress and celebrate wins
- If asked something outside AI/learning, gently steer back
- Use occasional emojis for warmth (🔥, 💡, ⚡, 🚀)
- Keep responses under 3-4 paragraphs unless the user asks for depth`;

function buildContextPrompt(user) {
  return `The user's name is ${user.fullName || user.username}. Their current reputation score is ${user.reputationScore || 0}. They have completed ${user.completedLessons?.length || 0} lessons. ${user.isPremium ? 'They have premium access (all modules unlocked).' : 'They have free access (modules 1-3 unlocked, 4-6 require premium).'}\n\nUser message:`;
}

router.post('/', protect, async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    if (!checkRateLimit(req.user._id.toString())) {
      return res.status(429).json({ success: false, message: 'Rate limit reached. You can send 20 messages per hour.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'Gemini API key not configured.' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const chatHistory = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role === 'user') {
          chatHistory.push({ role: 'user', parts: [{ text: msg.text }] });
        } else if (msg.role === 'assistant' || msg.role === 'model') {
          chatHistory.push({ role: 'model', parts: [{ text: msg.text }] });
        }
      }
    }

    const contextLine = buildContextPrompt(req.user);
    const fullPrompt = `${SYSTEM_PROMPT}\n\n${contextLine}\n\n${message}`;

    const result = await model.generateContentStream({
      contents: [
        ...chatHistory,
        { role: 'user', parts: [{ text: fullPrompt }] },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error('Chat error:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: err.message || 'Chat error.' });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Stream error occurred.' })}\n\n`);
      res.end();
    }
  }
});

module.exports = router;
