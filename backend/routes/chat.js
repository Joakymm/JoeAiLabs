const router = require('express').Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect } = require('../middleware/auth');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const rateLimitMap = new Map();
const MSG_LIMIT = 20;
const WINDOW_MS = 60 * 60 * 1000;

// Periodic cleanup to prevent memory leaks in SaaS environments
setInterval(() => {
  const now = Date.now();
  for (const [userId, timestamps] of rateLimitMap.entries()) {
    const valid = timestamps.filter(ts => now - ts < WINDOW_MS);
    if (valid.length === 0) rateLimitMap.delete(userId);
    else rateLimitMap.set(userId, valid);
  }
}, WINDOW_MS);

function checkRateLimit(userId) {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(userId) || []).filter(ts => now - ts < WINDOW_MS);
  
  if (timestamps.length >= MSG_LIMIT) return false;

  timestamps.push(now);
  rateLimitMap.set(userId, timestamps);
  return true;
}

const SYSTEM_PROMPT = `You are JOE, the official AI tutor and assistant for JOEAILABS—an AI learning platform.

## Your Role
You are a supportive, enthusiastic, and practical AI tutor. Your job is to help users learn AI skills, master prompt engineering, and apply AI tools effectively. Keep responses encouraging, practical, and concise.

## The Curriculum (JOEAILABS Catalog)
You should guide users through these 16 specific modules:
1. AI Foundations (History, Terminology, LLMs)
2. AI Assistants & Problem Solving (ChatGPT, Claude, Gemini)
3. Prompt Engineering (RICE Framework, Advanced Techniques)
4. AI Video Generation (Runway, Pika, Luma AI)
5. Graphic Design with AI (Canva, AI Design Tools)
6. AI Image Generation (Midjourney, DALL-E, Stable Diffusion) - PREMIUM
7. Presentation & Pitch Decks (Beautiful.ai, Slide Automation)
8. AI Writing & Content Creation (SEO, Blogging, Copywriting) - PREMIUM
9. AI Automation & No-Code (Zapier, Make.com, Workflows) - PREMIUM
10. AI Meeting Notes & Productivity (Fireflies.ai, Otter.ai)
11. AI Avatar & Faceless Content (HeyGen, Synthesia) - PREMIUM
12. Photo Editing & UI/UX Design (Figma, Photoshop AI)
13. AI Website Building (Durable, Framer AI)
14. Icons, Assets & Resources (Design Assets)
15. AI Tools Mastery (Deep dives into top tools) - PREMIUM
16. AI Content Monetization (Freelancing, Digital Products) - PREMIUM

## Strategic Guidance
- If a user asks about images, recommend Module 6.
- If they want to build a business, suggest Module 16.
- For automation, point them to Module 9.
- Always check if the user is Premium before recommending Premium content deeply.

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

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT
    });

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
    const fullPrompt = `${contextLine}\n\n${message}`;

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
