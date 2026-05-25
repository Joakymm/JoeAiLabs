require('dotenv').config();
const mongoose = require('mongoose');
const Module  = require('../models/Module');
const Lesson  = require('../models/Lesson');
const Prompt  = require('../models/Prompt');
const User    = require('../models/User');
const Payment = require('../models/Payment');
const Waitlist = require('../models/Waitlist');
const SystemSetting = require('../models/SystemSetting');
const { Quiz, QuizAttempt } = require('../models/Quiz');

const SYSTEM_SETTINGS = [
  { key: 'maintenanceMode', value: false },
  { key: 'announcement', value: 'Welcome to JOEAILABS — Learn AI skills, build projects, and unlock premium content.' },
  { key: 'paymentMethods', value: ['Binance Pay', 'Mpesa', 'Airtel Money'] },
  { key: 'communityLinks', value: { telegram: 'https://t.me/joeailabs', whatsapp: 'https://chat.whatsapp.com/joinjoeailabs' } },
  { key: 'premiumPricing', value: { monthly: 9.99, lifetime: 29.00 } },
];

const WAITLIST_DATA = [
  { email: 'waitlist1@joeailabs.com', source: 'mpesa' },
  { email: 'waitlist2@joeailabs.com', source: 'discord' },
];

const QUIZ_TEMPLATES = [
  {
    moduleOrder: 1,
    title: 'AI Foundations Quiz',
    description: 'Check your understanding of AI foundations.',
    passingScore: 70,
    questions: [
      { questionText: 'What is artificial intelligence?', type: 'short-answer', correctAnswer: 'A field of computer science focused on creating systems that can perform tasks typically requiring human intelligence.', points: 2 },
      { questionText: 'True or false: AI always thinks like humans.', type: 'true-false', options: ['True', 'False'], correctAnswer: 'False', points: 1 },
      { questionText: 'Which term describes AI generating new content?', type: 'multiple-choice', options: ['Classification', 'Regression', 'Generative AI', 'Optimization'], correctAnswer: 'Generative AI', points: 1 },
    ],
  },
  {
    moduleOrder: 3,
    title: 'Prompt Engineering Basics',
    description: 'Test your prompt crafting skills.',
    passingScore: 70,
    questions: [
      { questionText: 'A good prompt should include which of the following?', type: 'multiple-choice', options: ['Vague description', 'Clear role + context', 'Random keywords', 'None of the above'], correctAnswer: 'Clear role + context', points: 1 },
      { questionText: 'True or false: higher detail in a prompt usually improves output quality.', type: 'true-false', options: ['True', 'False'], correctAnswer: 'True', points: 1 },
      { questionText: 'What is a placeholder in prompt templates?', type: 'short-answer', correctAnswer: 'A variable field that users replace with specific values.', points: 2 },
    ],
  },
];

const PAYMENT_SEED = [
  {
    email: 'admin@joeailabs.com',
    orderId: 'JEL-ADMIN-001',
    amount: 29.00,
    currency: 'USDT',
    status: 'paid',
    planType: 'lifetime',
    binanceTransactionId: 'TXN-ADMIN-001',
    prepayId: 'PREPAY-ADMIN-001',
  },
  {
    email: 'demo@joeailabs.com',
    orderId: 'JEL-DEMO-001',
    amount: 9.99,
    currency: 'USDT',
    status: 'pending',
    planType: 'monthly',
    binanceTransactionId: 'TXN-DEMO-001',
    prepayId: 'PREPAY-DEMO-001',
  },
];

const MODULES = [
  {
    order: 1, isPremium: false, color: 'green', emoji: '🧠',
    title: 'AI FOUNDATIONS',
    subtitle: 'Essential Knowledge',
    description: 'Understand how artificial intelligence works at a conceptual level — no math, no coding required. Learn the history, terminology, and real-world applications shaping our world.',
    estimatedHours: 2,
    tags: ['fundamentals', 'beginner', 'concepts'],
  },
  {
    order: 2, isPremium: false, color: 'green', emoji: '🤖',
    title: 'AI ASSISTANTS & PROBLEM SOLVING',
    subtitle: 'ChatGPT, Claude, Gemini & Copilot',
    description: 'Learn how to use AI assistants for coding, research, business, automation, and productivity. Master prompt engineering, AI workflows, and AI agents.',
    estimatedHours: 3,
    tags: ['assistants', 'chatgpt', 'claude', 'gemini', 'beginner'],
  },
  {
    order: 3, isPremium: false, color: 'green', emoji: '⚡',
    title: 'PROMPT ENGINEERING',
    subtitle: 'Master-Level Prompting',
    description: 'Learn to communicate with AI effectively. Discover frameworks, techniques, and structures that transform vague requests into powerful, precise outputs.',
    estimatedHours: 3,
    tags: ['prompts', 'chatgpt', 'beginner'],
  },
  {
    order: 4, isPremium: false, color: 'blue', emoji: '🎬',
    title: 'AI VIDEO GENERATION',
    subtitle: 'Text-to-Video & AI Filmmaking',
    description: 'Create cinematic AI videos from text prompts using Runway, RecCloud, Pika, and Luma AI. Master storyboarding, AI animation, shorts, reels, and viral content systems.',
    estimatedHours: 4,
    tags: ['video', 'runway', 'pika', 'animation', 'content'],
  },
  {
    order: 5, isPremium: false, color: 'yellow', emoji: '🎨',
    title: 'GRAPHIC DESIGN WITH AI',
    subtitle: 'Social Media, Branding & Ads',
    description: 'Design social media posts, brands, posters, and ads using AI. Master Canva, Microsoft Designer, and Adobe Express for brand identity and marketing creatives.',
    estimatedHours: 3,
    tags: ['design', 'canva', 'branding', 'social-media'],
  },
  {
    order: 6, isPremium: true, color: 'blue', emoji: '🖼️',
    title: 'AI IMAGE GENERATION',
    subtitle: 'Midjourney, DALL·E & Stable Diffusion',
    description: 'Generate realistic and artistic AI images. Master Midjourney, DALL·E, Stable Diffusion, and Leonardo AI for prompt art, product mockups, concept art, and branding assets.',
    estimatedHours: 4,
    tags: ['images', 'midjourney', 'dalle', 'stable-diffusion', 'premium'],
  },
  {
    order: 7, isPremium: false, color: 'green', emoji: '📊',
    title: 'PRESENTATION & PITCH DECKS',
    subtitle: 'Professional Business Presentations',
    description: 'Build professional business presentations using AI. Master PowerPoint, Google Slides, and Beautiful.ai for startup pitch decks, investor presentations, and storytelling design.',
    estimatedHours: 2,
    tags: ['presentations', 'powerpoint', 'slides', 'pitch-deck'],
  },
  {
    order: 8, isPremium: true, color: 'yellow', emoji: '✍️',
    title: 'AI WRITING & CONTENT CREATION',
    subtitle: 'Blogs, Scripts & Copywriting',
    description: 'Use AI for blogs, scripts, copywriting, and SEO. Master Grammarly, QuillBot, and Jasper for copywriting, SEO blogging, email marketing, and content scaling.',
    estimatedHours: 4,
    tags: ['writing', 'copywriting', 'seo', 'content', 'premium'],
  },
  {
    order: 9, isPremium: true, color: 'green', emoji: '⚡',
    title: 'AI AUTOMATION & NO-CODE',
    subtitle: 'Automate Workflows with AI',
    description: 'Automate businesses and workflows with AI. Master Zapier, Bardeen, and Make for workflow automation, AI agents, CRM automation, and lead generation systems.',
    estimatedHours: 5,
    tags: ['automation', 'zapier', 'make', 'no-code', 'premium'],
  },
  {
    order: 10, isPremium: false, color: 'blue', emoji: '📝',
    title: 'AI MEETING NOTES & PRODUCTIVITY',
    subtitle: 'Turn Meetings Into Knowledge',
    description: 'Turn meetings into searchable knowledge. Master Fireflies.ai, Laxis, and Otter.ai for meeting transcription, AI summaries, and team productivity.',
    estimatedHours: 2,
    tags: ['productivity', 'meetings', 'transcription', 'notes'],
  },
  {
    order: 11, isPremium: true, color: 'yellow', emoji: '👤',
    title: 'AI AVATAR & FACELESS CONTENT',
    subtitle: 'Digital Humans & AI Presenters',
    description: 'Create AI avatars and digital humans. Master Synthesia, HeyGen, and D-ID for AI influencers, faceless YouTube channels, AI presenters, and avatar marketing.',
    estimatedHours: 3,
    tags: ['avatar', 'heygen', 'synthesia', 'faceless', 'premium'],
  },
  {
    order: 12, isPremium: false, color: 'blue', emoji: '🖌️',
    title: 'PHOTO EDITING & UI/UX DESIGN',
    subtitle: 'AI-Powered Design Tools',
    description: 'Learn AI-powered photo editing and interface design. Master Adobe Photoshop, Photopea, and Figma for photo manipulation, UI design, and mobile app interfaces.',
    estimatedHours: 4,
    tags: ['design', 'photoshop', 'figma', 'ui-ux'],
  },
  {
    order: 13, isPremium: false, color: 'green', emoji: '🌐',
    title: 'AI WEBSITE BUILDING',
    subtitle: 'No-Code AI Websites',
    description: 'Build websites using AI and no-code tools. Master Durable, 10Web, and Framer for landing pages, AI-generated websites, and portfolio systems.',
    estimatedHours: 3,
    tags: ['websites', 'framer', 'no-code', 'landing-pages'],
  },
  {
    order: 14, isPremium: false, color: 'yellow', emoji: '📦',
    title: 'ICONS, ASSETS & RESOURCES',
    subtitle: 'Design Assets for Any Project',
    description: 'Use professional design assets for products and brands. Master Iconfinder, Icons8, and Flaticon for UI asset creation, brand systems, and iconography.',
    estimatedHours: 2,
    tags: ['assets', 'icons', 'design-resources'],
  },
  {
    order: 15, isPremium: true, color: 'green', emoji: '🛠️',
    title: 'AI TOOLS MASTERY',
    subtitle: 'Best Tools Today',
    description: 'Deep-dive into the most powerful AI tools — Midjourney, ElevenLabs, Runway, HeyGen, Zapier, and more. Learn when and how to use each for maximum ROI.',
    estimatedHours: 5,
    tags: ['tools', 'midjourney', 'automation', 'premium'],
  },
  {
    order: 16, isPremium: true, color: 'yellow', emoji: '💰',
    title: 'AI CONTENT MONETIZATION',
    subtitle: 'Turn Skills Into Income',
    description: 'Build income streams using your AI skills. Freelancing, digital products, automation agencies, AI content businesses — discover what works and how to start.',
    estimatedHours: 5,
    tags: ['monetization', 'freelance', 'business', 'premium'],
  },
];

const LESSONS_DATA = [
  // Module 1 — AI Foundations
  {
    moduleOrder: 1, order: 1,
    title: 'What Is Artificial Intelligence?',
    duration: 12,
    summary: 'A clear, jargon-free introduction to AI.',
    content: `# What Is Artificial Intelligence?

Artificial Intelligence (AI) refers to computer systems that can perform tasks that normally require human intelligence — things like recognising speech, making decisions, translating languages, or generating images.

## A Simple Mental Model

Think of AI as a very sophisticated pattern-recognition machine. It learns from millions of examples and uses what it learned to make predictions about new inputs.

**Key distinction:** AI doesn't "think" like humans. It processes statistical patterns at extraordinary speed.

## Types of AI You'll Encounter

| Type | What It Does | Example |
|------|-------------|---------|
| Narrow AI | One specific task | Chess engines, spam filters |
| Generative AI | Creates new content | ChatGPT, Midjourney |
| Agentic AI | Takes autonomous actions | AutoGPT, Claude agents |

## Why This Matters Now

The cost of AI has dropped 99.7% in 18 months. What cost $20 to run in 2022 now costs $0.06. This democratisation means anyone — not just tech companies — can build AI-powered workflows.`,
    tips: ['You don\'t need to understand how it works technically — just what it can do for you.', 'Focus on use cases, not the science.'],
    keyTakeaways: ['AI learns from patterns, not rules', 'Generative AI creates content from prompts', 'AI costs have collapsed — now is the time to learn'],
  },
  {
    moduleOrder: 1, order: 2,
    title: 'The AI Landscape: Key Tools & Players',
    duration: 15,
    summary: 'Map the AI ecosystem — who builds what and why it matters.',
    content: `# The AI Landscape

Understanding who the major players are helps you make smarter tool choices.

## Foundation Model Providers

These companies build the core AI "brains" everything else runs on:

- **OpenAI** — GPT-4o, DALL-E, Sora
- **Anthropic** — Claude (known for safety and long context)
- **Google** — Gemini, Imagen
- **Meta** — Llama (open-source)
- **Mistral** — European open-source leader

## Application Layer (What You'll Use Daily)

Built on top of foundation models:

- **ChatGPT** (OpenAI) — Best for general tasks
- **Midjourney** — Image generation leader
- **ElevenLabs** — Voice synthesis
- **Runway / Kling** — AI video
- **Zapier / Make** — AI automation

## The Golden Rule of Tool Selection

> Use the **right tool for the job**, not the most famous one.

ChatGPT is excellent for writing. It is mediocre for image generation. Midjourney is excellent for images but cannot write.`,
    tips: ['Bookmark airtable.com/universe for updated AI tool directories', 'Each tool has a free tier — try before paying'],
    keyTakeaways: ['Foundation models power everything', 'Pick tools by use case', 'Free tiers exist for most major tools'],
  },
  {
    moduleOrder: 1, order: 3,
    title: 'How Large Language Models Actually Work',
    duration: 18,
    summary: 'Demystify LLMs without getting lost in math.',
    content: `# How LLMs Work (Without the PhD)

## Tokens: The Building Blocks

LLMs don't read words — they read **tokens**. A token is roughly 3–4 characters. "Hello" is 1 token. "Unbelievable" is 3 tokens.

Why does this matter? Token limits determine how much you can send in one conversation. GPT-4o handles ~128,000 tokens (~100,000 words).

## Training: Learning From the Internet

LLMs were trained on trillions of words from books, websites, code repositories, and more. During training they learned:

1. Grammar and language structure
2. Facts and relationships
3. Reasoning patterns
4. Conversational styles

## Inference: Prediction in Action

When you type a prompt, the model does one thing: **predicts the next most likely token**, repeatedly, until the response is complete.

This is why LLMs can "hallucinate" — they predict the most probable continuation, not necessarily the factual one.

## Temperature: Controlling Creativity

Temperature (0–2) controls randomness:
- **0.0** = Deterministic, consistent, factual
- **0.7** = Balanced (default for most tools)
- **2.0** = Wild, creative, unpredictable

## Practical Implication

You don't need to understand backpropagation. You need to understand: **garbage in, garbage out**. Better prompts = better outputs.`,
    tips: ['Temperature is why the same prompt gives different answers each time', 'Most hallucinations happen when the model lacks training data on a topic'],
    keyTakeaways: ['LLMs predict tokens, not "think"', 'Quality of output depends on quality of input', 'Temperature controls creativity vs consistency'],
  },
  // Module 2 — AI Assistants & Problem Solving
  {
    moduleOrder: 2, order: 1,
    title: 'Your First AI Assistant: Setup & Mindset',
    duration: 15,
    summary: 'Get started with ChatGPT, Claude, and Gemini the right way.',
    content: `# Your First AI Assistant

## Which Assistant Should You Use?

| Assistant | Best For | Free Tier |
|-----------|----------|-----------|
| ChatGPT | General tasks, coding, analysis | GPT-3.5 free |
| Claude | Long documents, reasoning, safety | 5 messages / 3h |
| Gemini | Google ecosystem, research | Full free tier |
| Copilot | Code completion in IDEs | Free with GitHub |

## The Right Mindset

AI assistants are not search engines. They are **reasoning engines**. Instead of typing keywords, you have conversations.

**Rule #1:** Treat the AI like a brilliant intern — eager but needing clear instructions.

**Rule #2:** Context is everything. The AI has no memory of your life. Tell it what it needs to know.

**Rule #3:** Verify everything. AI can hallucinate confidently. Treat outputs as first drafts.

## Setting Up Your Account

1. Go to chat.openai.com, claude.ai, or gemini.google.com
2. Sign up with Google or email
3. Start with a simple conversation: "Explain [topic] like I'm 10"
4. Explore the interface — settings, history, export options

## First Conversation Template

> "I want to learn about [topic]. I'm a complete beginner. Please explain it in simple terms with real-world examples. Start with why it matters, then break it down into 3 key concepts."`,
    tips: ['Start with one assistant and master it before trying others', 'Use the free tiers — they are powerful enough for most tasks'],
    keyTakeaways: ['AI assistants are reasoning engines, not search engines', 'Treat AI like a brilliant intern who needs clear instructions', 'Always verify AI outputs before using them'],
  },
  {
    moduleOrder: 2, order: 2,
    title: 'Getting Better Answers: Context Is King',
    duration: 18,
    summary: 'Learn how to provide context that transforms weak answers into expert-level responses.',
    content: `# Context Is King

## Why Context Matters

Without context, the AI guesses. With context, the AI **knows**. The difference is the difference between "write an email" and "write a follow-up email to a SaaS trial user who hasn't logged in for 7 days, offering a 30-minute onboarding call."

## The Context Template

Include as many of these as possible in every request:

### 1. Your Role
> "I'm a freelance graphic designer..."

### 2. The Audience
> "My client is a vegan bakery targeting health-conscious millennials..."

### 3. The Goal
> "I need to increase their Instagram engagement by 40%..."

### 4. Constraints
> "Budget is $200/month. No video production. Must use existing photos."

### 5. Format
> "Give me 5 options in a table with estimated effort and impact."

## Before & After

**Without context:**
"Write a email about our new feature."

**With context:**
"I'm a product manager at a project management tool. Write an announcement email about our new AI-powered task prioritisation feature. Our users are freelancers aged 25–40 who struggle with time management. The email should be friendly and highlight one specific use case. Max 200 words. Include a PS with a link to book a demo."

## The 5-Second Rule

If you can paste it in under 5 seconds, paste it. Links, background info, examples — more context almost never hurts.`,
    tips: ['When in doubt, over-explain. You can always trim the output.', 'Copy-paste relevant background into every new chat — the AI has no memory of previous conversations'],
    keyTakeaways: ['Context transforms generic answers into expert-level responses', 'Include role, audience, goal, constraints, and format', 'The 5-second rule: if you can paste it fast, paste it'],
  },
  {
    moduleOrder: 2, order: 3,
    title: 'AI for Research & Analysis',
    duration: 20,
    summary: 'Use AI assistants to research topics, analyse data, and synthesise information.',
    content: `# AI for Research & Analysis

## Research Workflow

### Step 1: Gather
Paste articles, PDF excerpts, or links into the assistant. Ask it to extract key points.

### Step 2: Synthesise
> "Read all of the above and give me a 3-paragraph executive summary covering: the main argument, supporting evidence, and counterarguments."

### Step 3: Question
> "What are the weaknesses in this argument?"  
> "What am I missing?"  
> "If you were a sceptic, what would you challenge?"

### Step 4: Apply
> "Based on this research, what are 3 actionable recommendations for a small business owner?"

## Analysing Data

Paste CSV data or tables and ask:
- "What are the top 3 trends in this data?"
- "Flag any anomalies or outliers"
- "Create a visual description of the key patterns"
- "What decisions does this data support?"

## Competitive Research Template
> "Analyse [competitor name] based on: their target audience, pricing model, key features, marketing channels, and biggest weakness. Then suggest 3 ways we can differentiate."

## The Socratic Method

Ask the AI to challenge your assumptions:
> "I believe [position]. Argue against me. Use data and logic. Then give me your verdict on who is more correct."`,
    tips: ['Always ask AI to cite specific sources when doing research', 'Use the Socratic method to stress-test your assumptions'],
    keyTakeaways: ['AI excels at synthesis — feeding it multiple sources saves hours', 'Ask the AI to challenge your conclusions', 'Use AI for "what am I missing?" questions'],
  },
  {
    moduleOrder: 2, order: 4,
    title: 'AI for Writing & Content Creation',
    duration: 22,
    summary: 'Generate high-quality written content with AI assistants — blogs, emails, social posts, and more.',
    content: `# AI for Writing & Content

## The Writing Workflow

### Phase 1: Brainstorm
> "Give me 20 blog post ideas for [niche]. For each: the target keyword, search intent, and a hook."

### Phase 2: Outline
> "Create a detailed outline for 'The Beginner's Guide to [Topic]'. Include H2s, H3s, key points per section, and suggested internal links."

### Phase 3: Draft
> "Write the first 500 words of section 2 following the outline. Use examples and short paragraphs. Target reading level: grade 8."

### Phase 4: Polish
> "Rewrite this to be more persuasive."  
> "Cut 30% without losing meaning."  
> "Make the opening more hook-driven."

## Email Templates

### Cold Email
> "Write a cold email to [recipient role] at [company type]. Value prop: [describe]. Goal: book a 15-min call. Max 100 words. Personalised reference to something relevant to them."

### Follow-Up
> "Write a friendly 3-email follow-up sequence for someone who downloaded our lead magnet but hasn't booked a call. Each email max 80 words. Include a PS tip in each."

## Tone Control

Tell the AI the exact tone you want:
- "Write this like a kindly professor"
- "Make it sound like a confident peer"
- "Tone: urgent but not pushy"
- "Tone: humble expert sharing hard-won wisdom"`,
    tips: ['Never use AI output verbatim — always add your voice and perspective', 'Use AI to overcome blank page syndrome, then edit heavily'],
    keyTakeaways: ['Use AI for each phase: brainstorm, outline, draft, polish', 'Specify tone explicitly', 'Editing is where the magic happens — AI drafts are raw material'],
  },
  {
    moduleOrder: 2, order: 5,
    title: 'AI Coding Assistants: GitHub Copilot & Beyond',
    duration: 25,
    summary: 'Use AI to write, debug, and understand code — even if you are not a developer.',
    content: `# AI Coding Assistants

## For Non-Developers

You don't need to know how to code to use AI for coding. Describe what you want in plain English:

> "Create a simple HTML page that shows a countdown timer. Style it with a dark theme. Make it responsive. Add a start and reset button."

The AI will generate the code. Copy, paste, run.

## For Developers: GitHub Copilot

Copilot integrates directly into VS Code, JetBrains, and other IDEs:

### Installation
1. Install the Copilot extension in your IDE
2. Authenticate with GitHub
3. Start typing — Copilot suggests completions in grey text
4. Press Tab to accept

### Copilot Best Practices
- Write clear function names and comments — Copilot reads them
- Write the function signature, then let Copilot fill the body
- Use descriptive variable names
- Break complex functions into smaller ones

## Debugging With AI

When stuck on an error:
1. Copy the full error message
2. Paste it to ChatGPT or Claude
3. Add context: "I'm building a [type] app using [framework]. This error happens when [action]. Here's the relevant code: [paste]"

## Code Review With AI
> "Review this code for: bugs, performance issues, security vulnerabilities, and style improvements. Be thorough. [paste code]"`,
    tips: ['Describe what you want in plain English first, then refine with technical terms', 'For debugging, always include the full error message and surrounding code'],
    keyTakeaways: ['AI lets non-coders build working software', 'Copilot speeds up developers by 30-50%', 'AI is excellent at debugging — always paste the full error'],
  },
  // Module 3 — Prompt Engineering
  {
    moduleOrder: 3, order: 1,
    title: 'The Anatomy of a Perfect Prompt',
    duration: 20,
    summary: 'Dissect what makes prompts powerful.',
    content: `# The Anatomy of a Perfect Prompt

A great prompt has five components. Master these and your output quality will improve 10×.

## The RICE Framework

### R — Role
Tell the AI who to be.
> "You are an expert copywriter with 15 years of experience writing for SaaS companies."

### I — Instructions
Tell it exactly what to do.
> "Write a 150-word product description for a project management tool targeting freelancers."

### C — Context
Give it the background it needs.
> "Our tool is called TaskFlow. It integrates with Notion, Slack, and Gmail. Our customers are solo developers and designers."

### E — Example (optional but powerful)
Show it the format you want.
> "Here's an example of the tone I want: [paste example]"

## Output Format Specification

Always specify:
- **Length**: "in 3 bullet points" or "under 100 words"
- **Format**: "as a table", "as a JSON object", "as a bulleted list"
- **Tone**: "professional", "casual", "urgent"

## Before/After Example

**❌ Weak:** "Write me a LinkedIn post about AI"

**✅ Strong:** "You are a thought leader in AI education. Write a LinkedIn post (150 words max) about how non-technical professionals can use AI to double their productivity. Use a hook first sentence, 3 specific tips, and end with a question to drive comments. Tone: confident but approachable."`,
    tips: ['Always specify output format', 'The more specific you are, the less back-and-forth you need'],
    keyTakeaways: ['RICE: Role, Instructions, Context, Example', 'Specify length, format, and tone', 'Specificity eliminates guesswork'],
  },
  {
    moduleOrder: 3, order: 2,
    title: 'Advanced Prompting Techniques',
    duration: 25,
    summary: 'Chain-of-thought, few-shot, and role prompting.',
    content: `# Advanced Prompting Techniques

## 1. Chain-of-Thought (CoT) Prompting

Force the AI to reason step by step before answering:

> "Think through this step by step before giving your final answer..."

This dramatically improves accuracy on complex problems. The model "shows its work" before concluding.

## 2. Few-Shot Prompting

Give 2–3 examples of the pattern you want:

\`\`\`
Input: "Our product is slow"
Output: "We're constantly optimising performance — here's what we're improving..."

Input: "Your pricing is too high"  
Output: "We understand value matters — let us show you the ROI..."

Input: "I can't find the export button"
Output: [The AI continues the pattern]
\`\`\`

## 3. Role Stacking

Layer multiple expert roles:

> "You are simultaneously a Harvard-trained psychologist AND a direct-response copywriter. From the psychologist's lens, identify the emotional trigger. From the copywriter's lens, write the headline."

## 4. Constraint Prompting

Artificially limit the AI to force creativity:

> "Explain quantum computing in exactly 5 words."
> "Write a pitch using only questions."
> "Describe our product without using adjectives."

## 5. Iterative Refinement

Never settle for the first output. Use follow-up prompts:
- "Make it 30% shorter"
- "Increase the urgency"
- "Add a real-world statistic"
- "Rewrite the opening line to be more provocative"`,
    tips: ['Chain-of-thought works best for math, logic, and multi-step analysis', 'Few-shot is your secret weapon for brand-consistent output'],
    keyTakeaways: ['CoT forces step-by-step reasoning', 'Few-shot examples set the pattern', 'Always iterate — first output is draft one'],
  },
  {
    moduleOrder: 3, order: 3,
    title: 'Prompts for Business Use Cases',
    duration: 22,
    summary: '12 ready-to-use prompt formulas for real work.',
    content: `# Business Prompt Formulas

## Email Writing
> "Write a [type] email to [recipient] about [topic]. Length: [X words]. Tone: [tone]. Include: [specific elements]. Do not include: [things to avoid]."

## Content Briefs
> "Create a detailed content brief for a blog post titled '[title]'. Include: target keyword, search intent, outline with H2s and H3s, key points for each section, competitor angle to differentiate. Audience: [describe]."

## Market Research
> "Analyse the market for [product/service] in [region/industry]. Cover: market size estimate, top 3 competitors with weaknesses, 3 underserved niches, pricing benchmarks, key buyer motivations."

## Sales Copy
> "Write a landing page headline and subheadline for [product]. Target customer: [describe]. Primary pain point: [describe]. Unique mechanism: [describe]. Tone: [tone]. Use the Problem-Agitate-Solve framework."

## Data Analysis Instructions
> "I will paste a dataset. Your job: identify the top 3 trends, flag any anomalies, suggest 2 actionable insights, and format your response as an executive summary (under 200 words)."

## Customer Persona
> "Build a detailed buyer persona for [product]. Include: demographics, psychographics, top 3 goals, top 3 frustrations, preferred content formats, buying triggers, and objections. Make it read like a real person."

## SOPs (Standard Operating Procedures)
> "Create a step-by-step SOP for [process]. Format: numbered steps, each with a 'why this matters' note. Include: inputs needed, outputs expected, common mistakes, and a quality checklist at the end."`,
    tips: ['Save your best prompts in a personal library — you\'ll reuse them constantly', 'Test each formula, then customise it for your business context'],
    keyTakeaways: ['Templated prompts save hours every week', 'Always test on real use cases', 'Your prompt library is a competitive advantage'],
  },
  // Module 4 — AI Video Generation
  {
    moduleOrder: 4, order: 1,
    title: 'Introduction to AI Video Generation',
    duration: 15,
    summary: 'Understand the landscape of AI video tools and what they can create.',
    content: `# Introduction to AI Video Generation

AI video generation lets you create professional-looking videos from text prompts. No camera, no studio, no actors needed.

## What AI Video Can Create

| Type | Description | Best Tool |
|------|-------------|-----------|
| Text-to-Video | Generate video from text | Runway, Pika |
| Image-to-Video | Animate a still image | Luma AI, Kling |
| AI Avatars | Digital presenters | Synthesia, HeyGen |
| Video Editing | AI-assisted cuts, effects | Runway, CapCut |

## The Quality Ladder

**2022:** Abstract, blurry, 4-second clips
**2024:** Cinematic, coherent, 60-second clips  
**2025+:** Near-professional quality for short-form content

## When to Use AI Video (vs Traditional)

Use AI video when:
- You need rapid prototyping (test 20 concepts in an hour)
- Budget is limited (AI video costs pennies per clip)
- You lack filming equipment or actors

Use traditional video when:
- You need真人 footage with real emotions
- Brand guidelines demand precise control
- You are filming physical products`,
    tips: ['AI video is best for short-form content — reels, ads, social clips', 'Always review AI video for strange artifacts before publishing'],
    keyTakeaways: ['AI video has improved dramatically and is production-ready for short-form', 'Text-to-video, image-to-video, and avatars are the three main categories', 'AI video costs pennies — use it for rapid prototyping'],
  },
  {
    moduleOrder: 4, order: 2,
    title: 'Runway Gen-3 & Pika: Text-to-Video Mastery',
    duration: 25,
    summary: 'Create stunning text-to-video clips with the two leading tools.',
    content: `# Runway & Pika — Text-to-Video

## Runway Gen-3

Runway is the industry leader for text-to-video. Its Gen-3 model produces the most realistic results.

### Getting Started
1. Go to runwayml.com and sign up
2. Start a new project
3. Select "Text to Video"
4. Write your prompt

### Prompting for Runway
Structure your prompts like this:

> "[Subject] [action] in [environment]. [Camera movement]. [Lighting/mood]. [Style reference]."

**Example:**
> "A wolf walks through a misty forest at dawn, slow cinematic pan, golden hour lighting, photorealistic style, 4K."

### Key Parameters
- **Duration:** 5–10 seconds (sweet spot for quality)
- **Motion Strength:** Higher = more movement, lower = more stable
- **Seed:** Same seed = same output (useful for iterations)

## Pika Labs

Pika excels at stylised and animated content.

### Pika's Unique Features
- **Image-to-Video** — Upload a still, add motion
- **Video-to-Video** — Apply a new style to existing footage
- **Modify Mode** — Select an area and change it

### When to Use Which
| Scenario | Tool |
|----------|------|
| Photorealistic scenes | Runway |
| Animated/cartoon style | Pika |
| Modifying existing video | Pika |
| Highest quality | Runway |`,
    tips: ['Keep prompts under 100 words — longer prompts confuse the model', 'Use cinematic terms: "slow pan", "close-up", "golden hour"', 'Generate 5+ variations and pick the best'],
    keyTakeaways: ['Runway is best for realistic video; Pika excels at stylised content', 'Structure prompts with subject, action, environment, and camera', 'Generate multiple variations and curate the best'],
  },
  {
    moduleOrder: 4, order: 3,
    title: 'Luma AI, Kling & RecCloud: Advanced Tools',
    duration: 20,
    summary: 'Explore alternative AI video tools and their unique strengths.',
    content: `# Luma AI, Kling & RecCloud

## Luma AI (lumalabs.ai)

Luma specialises in **3D video** and realistic camera movement.

### Key Features
- **Dream Machine** — Text-to-video with cinematic camera motion
- **3D Capture** — Turn real-world objects into 3D models
- **Camera Control** — Specify exact camera paths

**Best for:** Product showcases, architectural visualisation, cinematic B-roll.

## Kling (kling.kuaishou.com)

Kling is a Chinese AI video tool that rivals Runway.

### Strengths
- **Physics accuracy** — Better at realistic motion and object interaction
- **Longer clips** — Up to 2 minutes
- **Cost** — Often cheaper than Western alternatives

**Best for:** Longer-form content, action sequences, physics-heavy scenes.

## RecCloud (recloud.com)

RecCloud focuses on **screen recording + AI enhancement**.

### Features
- Screen recording with AI editing
- Auto-caption generation
- AI summarisation of recorded content
- Background removal

**Best for:** Tutorials, walkthroughs, software demos.

## Tool Selection Matrix

| Need | Tool |
|------|------|
| Cinematic short clips | Runway |
| Stylised animation | Pika |
| 3D camera movement | Luma AI |
| Physics / action scenes | Kling |
| Tutorials & screen recordings | RecCloud |`,
    tips: ['Use Luma AI when you need dramatic camera movement', 'Kling handles physics better than any competitor — use it for action scenes'],
    keyTakeaways: ['Each AI video tool has unique strengths', 'Luma AI excels at 3D and camera movement', 'Kling is best for physics-heavy scenes', 'RecCloud is ideal for tutorials'],
  },
  {
    moduleOrder: 4, order: 4,
    title: 'Storyboarding & AI Filmmaking Workflow',
    duration: 22,
    summary: 'Plan and produce AI videos like a professional filmmaker.',
    content: `# AI Filmmaking Workflow

## Pre-Production: Planning

### Step 1: Concept
Define your video's goal in one sentence:
> "A 30-second Instagram Reel promoting our new eco-friendly water bottle."

### Step 2: Script
Write a short script. 30 seconds = ~70 words.
> "Every year, 1 million plastic bottles end up in our oceans. But what if your water bottle could be part of the solution? Meet EcoSip — the bottle that gives back. Every purchase plants 10 trees."

### Step 3: Storyboard
Break the script into shots:

| Shot | Visual | Duration |
|------|--------|----------|
| 1 | Ocean with plastic floating | 5s |
| 2 | Cut to EcoSip bottle in forest | 5s |
| 3 | Close-up of bottle features | 8s |
| 4 | Trees being planted montage | 7s |
| 5 | Logo + CTA | 5s |

### Step 4: Generate Each Shot
Generate each shot separately in your chosen tool. Consistency is key — use the same style reference and similar prompts.

## Production: Generating

### Maintaining Consistency
- Use the same seed number for related shots
- Include consistent style keywords in every prompt
- Generate extra footage for transitions

## Post-Production: Editing

### Tools for Assembly
- **CapCut** (free) — Best for quick edits and social media
- **Premiere Pro** — Professional editing
- **DaVinci Resolve** — Free professional option

### Polish Checklist
- [ ] Consistent colour grade across all clips
- [ ] Background music (try Suno or Udio for AI music)
- [ ] Captions or subtitles
- [ ] Smooth transitions between shots
- [ ] End card with CTA`,
    tips: ['Plan your video shot by shot — generating one long video rarely works well', 'Generate 2-3 options per shot so you have choices in editing'],
    keyTakeaways: ['Pre-production (script + storyboard) is the most important phase', 'Generate each shot separately for better quality', 'Use consistent style keywords across all prompts', 'Post-production polish makes AI video look professional'],
  },
  {
    moduleOrder: 4, order: 5,
    title: 'AI Shorts, Reels & Viral Content Systems',
    duration: 18,
    summary: 'Build a repeatable system for creating viral short-form AI video content.',
    content: `# AI Viral Content System

## The Algorithm-Friendly Format

Short-form platforms (TikTok, Reels, Shorts) favour:

1. **Hook in first 2 seconds** — Text overlay + strong visual
2. **Fast pacing** — Change scene every 3–5 seconds
3. **Text captions** — 80% of viewers watch without sound
4. **Trending audio** — Use platform sounds when possible
5. **Engagement CTA** — "Comment X if Y" or "Save for later"

## Content Pillar Framework

Create content in 4 buckets:

| Pillar | Purpose | Frequency |
|--------|---------|-----------|
| Educational | Teach something useful | 40% |
| Entertaining | Make them laugh or smile | 30% |
| Inspirational | Share a transformation | 20% |
| Promotional | Sell your product/service | 10% |

## Batch Production Workflow

### Monday: Concept (30 min)
- Generate 10 video ideas using ChatGPT
- Pick the 5 strongest

### Tuesday: Script (30 min)
- Write 30-second scripts for all 5
- Paste into a storyboard template

### Wednesday: Generate (1 hour)
- Run all prompts in Runway/Pika
- Download best output for each shot

### Thursday: Edit (1 hour)
- Assemble in CapCut
- Add music, captions, effects

### Friday: Schedule (15 min)
- Upload to all platforms
- Write descriptions and hashtags

## Metrics That Matter

- **Hook Rate** — % of viewers who watch past 3 seconds
- **Retention** — Average watch time
- **Engagement Rate** — Likes + comments + shares / views
- **Conversion** — CTA clicks (if applicable)`,
    tips: ['Hook rate is the single most important metric — spend 50% of your effort on the first 3 seconds', 'Batch production makes AI video creation efficient and sustainable'],
    keyTakeaways: ['Short-form content needs a hook in 2 seconds', 'Use a batch production workflow to create consistently', 'Track hook rate, retention, engagement, and conversion', 'AI video is perfect for the 4 content pillars'],
  },
  // Module 5 — Graphic Design with AI
  {
    moduleOrder: 5, order: 1,
    title: 'AI Design Tools Landscape',
    duration: 12,
    summary: 'Overview of the best AI design tools and when to use each.',
    content: `# AI Design Tools Landscape

## The Big Three Design Tools

| Tool | Best For | Pricing |
|------|----------|---------|
| Canva | Social media, presentations, quick designs | Free / Pro $13/mo |
| Microsoft Designer | Business graphics, brand collateral | Free with Microsoft |
| Adobe Express | Professional templates, branding | Free / Premium |

## AI-First Design Tools

| Tool | Speciality | Pricing |
|------|------------|---------|
| Midjourney | Artistic image generation | $10/mo |
| Leonardo AI | Game assets, concept art | Free daily credits |
| DALL-E 3 | Photorealistic images | Included with ChatGPT Plus |
| Clipdrop | Background removal, relighting | Free / Pro |

## When to Use Each

**Canva** — 80% of your daily design needs. Social posts, flyers, presentations, thumbnails. It has the best template library and easiest AI features.

**Microsoft Designer** — Best if you are already in the Microsoft ecosystem. Tight integration with Office 365.

**Adobe Express** — When you need brand-consistent output. It pulls from your brand kit (logos, colours, fonts) automatically.

**Midjourney / DALL-E** — When you need original imagery, not templates. Generate unique visuals, then edit in Canva.

## The Golden Rule

Design should take **10 minutes**, not 2 hours. AI tools make this possible. Use templates, AI generation, and batch editing to move fast.`,
    tips: ['Canva handles 80% of daily design needs — master it first', 'Use a combination: AI image generation + template editing'],
    keyTakeaways: ['Canva is the primary tool for most creators', 'Microsoft Designer integrates with Office 365', 'Adobe Express excels at brand consistency', 'Use Midjourney/DALL-E for original imagery, then edit in Canva'],
  },
  {
    moduleOrder: 5, order: 2,
    title: 'Canva AI: Social Media Design Mastery',
    duration: 22,
    summary: 'Design scroll-stopping social media graphics using Canva AI features.',
    content: `# Canva AI for Social Media

## Magic Studio — Canva's AI Suite

Canva's AI features are grouped under "Magic Studio":

### Magic Design
Describe what you want and Canva generates complete designs:
> "Modern LinkedIn banner for a health coach, green and white, with space for headshot and tagline"

### Magic Eraser
Remove unwanted objects from images. Select the object and it disappears.

### Magic Expand
Extend an image beyond its borders. Canva fills in the new area intelligently.

### Magic Write
Generate copy directly in Canva. Write posts, captions, and headlines without switching tabs.

## Social Media Template Strategy

### Instagram Posts
- **Square (1080×1080)** — Feed posts
- **Vertical (1080×1920)** — Stories and Reels
- **Aspect ratio:** Keep text in the centre 80% (safe zone)

### LinkedIn Banners
- **Size:** 1584×396 px
- **Key elements:** Headshot on left, tagline in centre, CTA button on right
- **Keep it clean** — LinkedIn users scan quickly

### YouTube Thumbnails
- **Size:** 1280×720 px
- **Key elements:** Close-up face expressing emotion, bold text (3-4 words max), contrasting colours, curiosity gap

## Batch Creation Workflow

1. Create one master template per platform
2. Use Canva's "Create blank" → apply brand kit
3. Design the template once
4. Duplicate and swap text/images for each post
5. Schedule directly using Canva's scheduler`,
    tips: ['Create brand kits in Canva (Pro feature) to maintain consistency', 'Design once as a template, then batch duplicate for efficiency'],
    keyTakeaways: ['Canva Magic Studio provides powerful AI design tools', 'Each platform requires different dimensions and design approaches', 'Batch create by designing one template and duplicating it'],
  },
  {
    moduleOrder: 5, order: 3,
    title: 'Brand Identity & Logo Design with AI',
    duration: 20,
    summary: 'Create complete brand identities — logos, palettes, and style guides using AI.',
    content: `# AI Brand Identity Design

## Logo Design with AI

### Option 1: Canva AI Logo Maker
1. Go to Canva → "Logo" → "AI Logo Generator"
2. Describe your brand: "Minimalist coffee shop logo with a mountain motif"
3. Canva generates 20+ variations
4. Customise colours, fonts, and layout

### Option 2: Midjourney
Prompt structure for logos:
> "Minimalist logo for [brand name], [industry], flat vector style, clean lines, geometric, white background, symmetrical, professional —ar 1:1"

### Option 3: Looka (looka.com)
Dedicated AI logo maker. Answer questions about your brand style and it generates hundreds of options.

## Colour Palette Generation

Use AI to generate harmonious colour schemes:
> "Generate a 5-colour brand palette for a sustainable fashion brand aimed at Gen Z. Include hex codes. Should feel earthy but modern."

## Brand Style Guide Template

Create a one-page brand guide with:

1. **Logo** — Full colour, white, and monochrome versions
2. **Colour Palette** — Primary, secondary, accent with hex codes
3. **Typography** — Headline font, body font, sizes
4. **Imagery Style** — Photo filters, illustration style
5. **Tone of Voice** — "Friendly expert" / "Bold innovator" / etc.
6. **Examples** — 3 mockups showing correct application

## AI Branding Workflow

1. Define brand personality (use ChatGPT: "Describe 3 brand personalities for [business type]")
2. Generate logo options (Canva AI or Midjourney)
3. Generate colour palette (ChatGPT)
4. Choose typography pairings (use fontjoy.com or ask ChatGPT)
5. Compile into a style guide
6. Generate 5 brand mockups (business card, Instagram, website, email, packaging)`,
    tips: ['Your brand kit belongs in Canva so every team member can use it', 'A one-page brand guide is better than a 50-page one that nobody reads'],
    keyTakeaways: ['Use Canva AI or Midjourney for logo generation', 'Ask AI to generate colour palettes with hex codes', 'Create a one-page brand style guide', 'Generate mockups to test your brand identity'],
  },
  {
    moduleOrder: 5, order: 4,
    title: 'AI Ad Creatives & Marketing Graphics',
    duration: 18,
    summary: 'Design high-converting ad creatives using AI tools.',
    content: `# AI Ad Creatives

## The Anatomy of a High-Converting Ad

1. **Stopping Power** — The visual must stop the scroll (3 colours max, bold contrast)
2. **Clear Offer** — Viewer must understand the offer in 2 seconds
3. **Social Proof** — Numbers, testimonials, or badges
4. **CTA** — One clear action button

## AI Ad Creative Workflow

### Step 1: Generate Concepts
Use ChatGPT to brainstorm ad angles:
> "Generate 5 Facebook ad concepts for [product]. Each concept should have: headline, visual description, and reason it would work."

### Step 2: Design Primary Visual
Generate the main image:
> **Midjourney:** "Lifestyle photo of [target audience] using [product], warm lighting, shallow depth of field, candid moment --ar 4:5"
> **DALL-E:** Same prompt in ChatGPT with DALL-E enabled

### Step 3: Add Copy in Canva
1. Open Canva → Custom size (1080×1350 for Facebook)
2. Upload your generated image
3. Add headline (bold, 3-8 words)
4. Add supporting text (smaller, below headline)
5. Add CTA button (contrasting colour)
6. Add logo (bottom corner)

### Step 4: Generate Variations
Use Canva's "Magic Switch" to create multiple sizes:
- Instagram Story (1080×1920)
- LinkedIn Post (1200×627)
- Twitter/X Post (1200×675)
- Banner Ad (728×90)

## A/B Testing Framework

Test these variables:
| Variable | Test A | Test B |
|----------|--------|--------|
| Visual | Product photo | Lifestyle image |
| Headline | Benefit-driven | Curiosity-driven |
| CTA | "Shop Now" | "Learn More" |
| Colour | Blue theme | Red theme |

Create 4-8 variations and test them against each other.`,
    tips: ['The visual is 80% of the ad performance — invest time here', 'Create 4+ variations per campaign and A/B test them'],
    keyTakeaways: ['High-converting ads need stopping power, clear offer, social proof, and CTA', 'Use Midjourney/DALL-E for visuals, Canva for copy layout', 'Generate multiple sizes from one design using Magic Switch', 'Always A/B test visual, headline, CTA, and colour'],
  },
  // Module 6 — AI Image Generation
  {
    moduleOrder: 6, order: 1,
    title: 'Midjourney: From Beginner to Pro',
    duration: 30,
    summary: 'Master Midjourney for professional AI image generation.',
    content: `# Midjourney Mastery

## Getting Started

Midjourney operates inside Discord. Join at midjourney.com and go to any #newbies channel.

### Basic Commands
- \`/imagine [prompt]\` — Generate an image
- \`/settings\` — Set your default parameters
- \`/blend\` — Combine two images
- \`/describe\` — Generate prompts from an image

## The Anatomy of a Midjourney Prompt

Structure your prompts for best results:

> **[Subject] + [Detail] + [Environment] + [Lighting] + [Style] + [Parameters]**

**Example:**
> "A serene Japanese garden in autumn, maple leaves falling, koi pond reflecting golden hour light, soft mist rising, Ghibli animation style, cinematic composition —ar 16:9 —v 6"

## Key Parameters

| Parameter | Syntax | Effect |
|-----------|--------|--------|
| Aspect Ratio | \`--ar 16:9\` | Width:Height |
| Version | \`--v 6\` | Model version |
| Stylize | \`--s 250\` | 0-1000, higher = more artistic |
| Chaos | \`--c 50\` | 0-100, higher = more varied |
| Image Weight | \`--iw 2\` | How much to follow reference image |

## Advanced Techniques

### Image Prompting
Use an image as inspiration:
> \`/imagine [image URL] [text prompt] --iw 1.5\`

### Remix Mode
Enable in /settings. Change your prompt after generating to create variations while keeping composition.

### Multi-Prompts
Separate concepts with :: to weight them differently:
> "vibrant meadow ::2 misty mountains ::1 — chaotic sky ::0.5"`,
    tips: ['Lower stylize values (--s 50-100) for realistic results, higher for artistic', 'Use --ar for aspect ratio — 16:9 for landscapes, 1:1 for social media'],
    keyTakeaways: ['Structure prompts: Subject + Details + Environment + Lighting + Style', 'Use parameters to control aspect ratio, stylization, and variation', 'Image prompting and remix mode enable precise iteration'],
  },
  {
    moduleOrder: 6, order: 2,
    title: 'DALL-E 3 & ChatGPT Vision',
    duration: 20,
    summary: 'Generate photorealistic and conceptual images with OpenAI\'s DALL-E 3.',
    content: `# DALL-E 3 & ChatGPT Vision

## DALL-E 3 Overview

DALL-E 3 is built into ChatGPT Plus. Unlike Midjourney (Discord), you use it through a chat interface — perfect for conversational workflows.

### Key Strengths
- **Text rendering** — Actually writes readable text in images
- **Prompt adherence** — Follows complex prompts better than any competitor
- **Realism** — Best-in-class for photorealistic images
- **Integration** — Works within ChatGPT alongside text, analysis, and coding

## Prompting for DALL-E 3

DALL-E 3 works best with natural language descriptions:

> "A photorealistic image of a minimalist home office with a large wooden desk, a monitor displaying analytics, a cup of coffee, soft natural light from a window, plants in the corner, modern aesthetic, 4K detail"

### Key Differences From Midjourney
| Aspect | DALL-E 3 | Midjourney |
|--------|----------|------------|
| Platform | ChatGPT | Discord |
| Text in images | Excellent | Poor |
| Realism | Best in class | Very good |
| Artistic styles | Good | Excellent |
| Parameter control | Limited | Extensive |

## ChatGPT Vision

Upload an image and ask ChatGPT to:
- Analyse it ("What's in this image?")
- Edit it ("Remove the background")
- Generate a variation ("Create a similar image in a different colour")
- Write a prompt for it ("Write a prompt that would generate this image")

## Practical Workflow

1. **Ideation** — Describe your concept to ChatGPT
2. **Generation** — Ask DALL-E to create the image
3. **Analysis** — Upload the result and ask for improvements
4. **Iteration** — Refine with follow-up prompts
5. **Export** — Download at original resolution`,
    tips: ['DALL-E 3 is best when you need text in images or photorealistic results', 'Use ChatGPT Vision to iterate — upload, critique, regenerate'],
    keyTakeaways: ['DALL-E 3 excels at text rendering and photorealism', 'ChatGPT Vision enables iterative image improvement', 'Use conversational prompting rather than parameter tweaking'],
  },
  {
    moduleOrder: 6, order: 3,
    title: 'Stable Diffusion & Leonardo AI',
    duration: 25,
    summary: 'Explore open-source and freemium AI image generation tools.',
    content: `# Stable Diffusion & Leonardo AI

## Stable Diffusion

Stable Diffusion is open-source, meaning it runs locally on your computer. No subscription, no censorship, full control.

### Options to Use It
| Method | Cost | Skill Level |
|--------|------|-------------|
| Automatic1111 Web UI | Free | Intermediate |
| ComfyUI | Free | Advanced |
| StabilityAI Platform | Free credits | Beginner |
| Hugging Face Spaces | Free | Beginner |

### Why Use Stable Diffusion?
- **Privacy** — Everything runs locally
- **Control** — Fine-tune models, train your own
- **No censorship** — Generate anything
- **Custom models** — Download community-trained styles

### Popular Models
- **SDXL** — Latest base model, highest quality
- **Realistic Vision** — Best for photorealism
- **DreamShaper** — Great all-around model

## Leonardo AI

Leonardo is a freemium web platform built on Stable Diffusion.

### Key Features
- **Daily free credits** — 150 credits/day
- **Canvas editor** — Inpainting, outpainting, background removal
- **Model training** — Train a model on your art style
- **Game asset generation** — Specialised for game development

### When to Use Leonardo
- You want Stable Diffusion power without local setup
- You need game assets or consistent character designs
- You want a canvas editor (vs pure text-to-image)

## Workflow Comparison

| Need | Best Tool |
|------|-----------|
| Quick, high-quality images | DALL-E 3 |
| Artistic control | Midjourney |
| Privacy / custom models | Stable Diffusion |
| Freemium with editing | Leonardo AI |
| Text in images | DALL-E 3 |
| Batch generation | Stable Diffusion (local) |`,
    tips: ['Leonardo AI is the easiest entry point to Stable Diffusion power', 'Stable Diffusion locally gives you the most control but requires setup'],
    keyTakeaways: ['Stable Diffusion is open-source and can run locally for free', 'Leonardo AI offers SD power in a web interface with free daily credits', 'Each tool has different strengths — choose based on your specific needs'],
  },
  // Module 7 — Presentation & Pitch Decks
  {
    moduleOrder: 7, order: 1,
    title: 'AI-Powered Presentation Design',
    duration: 18,
    summary: 'Create stunning presentations in minutes using AI tools.',
    content: `# AI-Powered Presentations

## The Problem with Traditional Presentations

The average person spends 4+ hours designing a 10-slide deck. AI cuts this to 15 minutes.

## AI Presentation Tools

| Tool | Best For | Pricing |
|------|----------|---------|
| Beautiful.ai | Auto-layout, smart templates | Free / Pro $12/mo |
| Gamma.app | AI-generated full decks | Free / Pro $8/mo |
| Tome.app | AI storytelling presentations | Free / Pro |
| Canva Presentations | Templates + AI design | Free / Pro $13/mo |
| PowerPoint Designer | Built-in AI suggestions | Included in Office 365 |

## Beautiful.ai Deep Dive

### How It Works
1. Choose a template
2. Add content (text, images, data)
3. Beautiful.ai auto-arranges everything
4. Change the theme — all slides update instantly

### Key Features
- **Smart Slides** — Add a bullet list and it formats perfectly
- **Auto-Layout** — Move something, everything else adjusts
- **Brand Kit** — Upload your logo, colours, fonts
- **Team Collaboration** — Multiple people can edit

## The 10/20/30 Rule (Guy Kawasaki)

- **10 slides** — Maximum for any presentation
- **20 minutes** — Maximum time
- **30 point font** — Minimum font size

## Slide Structure for Impact

1. **Title** — Your big idea (1 sentence)
2. **Problem** — What you solve (1 slide)
3. **Solution** — How you solve it (1-2 slides)
4. **Market** — Who needs this (1 slide)
5. **Traction** — Proof it works (1 slide)
6. **Team** — Why you (1 slide)
7. **Financials** — Numbers (1 slide)
8. **Ask** — What you need (1 slide)
9. **Closing** — Memorable statement (1 slide)`,
    tips: ['Beautiful.ai saves the most time — try it first', 'Follow the 10/20/30 rule for investor presentations'],
    keyTakeaways: ['AI cuts presentation design from 4 hours to 15 minutes', 'Beautiful.ai auto-formats content into professional slides', 'The 10/20/30 rule: 10 slides, 20 minutes, 30pt font'],
  },
  {
    moduleOrder: 7, order: 2,
    title: 'Startup Pitch Decks with AI',
    duration: 22,
    summary: 'Build investor-ready pitch decks using AI storytelling.',
    content: `# AI Pitch Decks

## What Investors Look For

1. **Clear problem** — Is this a real, painful problem?
2. **Unique solution** — Why is this better than existing options?
3. **Market size** — Can this be a billion-dollar business?
4. **Traction** — Have you proven demand?
5. **Team** — Are you the right people?
6. **Ask** — What do you need and what will you do with it?

## AI Pitch Deck Workflow

### Step 1: Define Your Narrative
Use ChatGPT to refine your story:
> "I'm building [product] for [audience]. Help me craft a 3-sentence narrative for my pitch deck: what problem we solve, how we solve it uniquely, and why now is the right time."

### Step 2: Generate Slide Content
For each slide, use a targeted prompt:
> "Write the content for a 'Problem' slide in a pitch deck for [product]. Include: a relatable statistic, a short story about the pain point, and the cost of NOT solving this problem. Keep it to 4 bullet points."

### Step 3: Design in Beautiful.ai
1. Choose the "Pitch Deck" template
2. Paste your AI-generated content into each slide
3. Add charts for market size and traction
4. Apply your brand kit

### Step 4: Generate Visuals
Use DALL-E 3 for slide imagery:
> "A professional illustration showing [concept], clean design, suitable for a business presentation, blue and white colour scheme, minimalist"

## Pitch Deck Template (10 Slides)

| Slide | Content |
|-------|---------|
| 1 | Logo + tagline |
| 2 | Problem (1 statistic + 1 story) |
| 3 | Solution (product screenshot) |
| 4 | Why Now (market timing) |
| 5 | Market Size (TAM/SAM/SOM) |
| 6 | Competition (2x2 matrix) |
| 7 | Traction (growth chart) |
| 8 | Team (photos + credentials) |
| 9 | Financials (revenue projection) |
| 10 | Ask + Use of Funds |`,
    tips: ['Investors spend 2-3 minutes per deck — every word must earn its place', 'Let ChatGPT refine your narrative before you design a single slide'],
    keyTakeaways: ['Investors want: problem, solution, market, traction, team, ask', 'Use ChatGPT to craft narrative and slide content', 'Beautiful.ai auto-formats into a professional deck', 'Include a competition 2x2 matrix slide'],
  },
  {
    moduleOrder: 7, order: 3,
    title: 'Data Storytelling & Visualisation with AI',
    duration: 18,
    summary: 'Turn raw data into compelling visual stories for presentations.',
    content: `# Data Storytelling with AI

## Why Data Stories Work

Facts are forgettable. Stories are memorable. Data storytelling combines both — numbers presented within a narrative framework.

## The Three-Part Data Story

### 1. Context
Before showing numbers, set the scene:
> "Last quarter, we launched our new pricing model. Here's what happened."

### 2. The Data
Show the numbers with clear visuals:
> [Chart showing revenue growth after the change]

### 3. The Insight
Explain what it means:
> "The 40% revenue increase proves that value-based pricing outperforms cost-plus."

## AI Tools for Data Visualisation

| Tool | Use Case | AI Feature |
|------|----------|------------|
| ChatGPT Advanced Data Analysis | Analyse CSVs, generate charts | Natural language queries |
| Lumen Five | Auto-generated insights | AI finds patterns |
| Tableau + Ask Data | Enterprise BI | AI-powered Q&A |
| Canva Charts | Simple, beautiful charts | Auto-colour, smart labels |

## Creating Charts with ChatGPT

1. Upload your CSV or paste data
2. Ask: "Create a bar chart showing [metric] by [category]"
3. ChatGPT writes code and displays the chart
4. Download and insert into your presentation

## Chart Selection Guide

| Data Type | Chart Type |
|-----------|------------|
| Comparison over time | Line chart |
| Parts of a whole | Pie / donut chart |
| Ranking | Bar chart |
| Relationship | Scatter plot |
| Distribution | Histogram |
| Progress toward goal | Gauge chart |

## The One-Slide Summary

End every data-heavy presentation with a summary slide:
> **"The headline:** [one sentence]. **The data:** [key number]. **The action:** [what to do next]."`,
    tips: ['Never show a chart without explaining what it means — the insight is the value', 'Use ChatGPT to analyse data and suggest the best chart type'],
    keyTakeaways: ['Data storytelling = context + data + insight', 'ChatGPT can analyse CSVs and generate charts', 'Each data type needs a specific chart type', 'End data slides with a clear headline and action item'],
  },
  // Module 8 — AI Writing & Content Creation
  {
    moduleOrder: 8, order: 1,
    title: 'AI Blog Writing & SEO Content',
    duration: 25,
    summary: 'Create SEO-optimised blog content at scale using AI.',
    content: `# AI Blog Writing & SEO

## The AI Blogging Workflow

### Phase 1: Keyword & Topic Research
> "Give me 15 blog topic ideas for [niche]. For each: target keyword, search intent (informational/commercial/transactional), estimated competition level, and a hook title."

### Phase 2: Outline Generation
> "Create a detailed outline for 'Ultimate Guide to [Topic]'. Include H2s, H3s, bullet points per section, FAQ ideas, and internal linking opportunities."

### Phase 3: Draft with AI
Write section by section for quality:
> "Write the introduction for [topic]. Hook the reader with a surprising statistic, state the problem, and preview the solution. 150 words max."

### Phase 4: SEO Optimisation
> "Optimise this blog post for the keyword '[keyword]'. Suggestions for: title tag, meta description, URL slug, heading structure, image alt text, and internal links."

## Tools for AI Blogging

| Tool | Purpose |
|------|---------|
| ChatGPT / Claude | Drafting, outlines, research |
| Jasper | Dedicated AI writing with templates |
| Grammarly | Polish, grammar, tone adjustment |
| QuillBot | Paraphrasing, rewriting |
| Surfer SEO | SEO optimisation scoring |

## The E-E-A-T Framework

Google rewards content that demonstrates:
- **Experience** — First-hand knowledge
- **Expertise** — Deep subject knowledge
- **Authoritativeness** — Recognised as a trusted source
- **Trustworthiness** — Accurate, cited information

### How to Inject E-E-A-T
- Include personal anecdotes and case studies
- Cite sources and link to authority sites
- Share specific results and numbers
- Add author bios with credibility markers

## Content Repurposing

One piece of content → many formats:
1. Write a 2000-word blog post
2. Extract 5 LinkedIn posts
3. Create a Twitter/X thread
4. Turn into a YouTube script
5. Generate an email newsletter
6. Create an infographic

> "Repurpose this blog post into: a 10-tweet thread, a LinkedIn post, and a 3-minute video script. Keep each format's best practices in mind."`,
    tips: ['Write section by section rather than generating entire posts at once', 'Always add personal experience and examples — this is what makes AI content rank'],
    keyTakeaways: ['The AI blogging workflow: topics → outline → draft → optimise', 'E-E-A-T (Experience, Expertise, Authority, Trust) is critical for SEO', 'Repurpose each piece of content into 4+ formats'],
  },
  {
    moduleOrder: 8, order: 2,
    title: 'Copywriting with AI: Emails, Landing Pages & Sales Copy',
    duration: 25,
    summary: 'Write persuasive copy that converts readers into customers.',
    content: `# AI Copywriting

## The AIDA Framework

Every piece of sales copy follows AIDA:
- **Attention** — Hook the reader
- **Interest** — Build curiosity
- **Desire** — Make them want it
- **Action** — Tell them what to do

## Email Copywriting

### Cold Email Template
> "Write a cold email to [prospect role] at [company]. Value prop: [describe]. Goal: book a 15-min call. Personalise with: [reference]. Max 100 words. Use the AIDA structure."

### Welcome Sequence
> "Write a 3-email welcome sequence for new subscribers. Email 1: deliver value. Email 2: share your story. Email 3: make an offer. Each email max 150 words. Brand voice: [describe]."

### Sales Follow-Up
> "Write a follow-up email for someone who started a free trial but hasn't upgraded. Remind them of value, address common objections, offer help. Max 120 words. Friendly but confident tone."

## Landing Page Copy

### Hero Section
> "Write the hero section for a landing page about [product]. Include: headline (8 words max), subheadline (15 words max), and CTA button text (3 words max). The headline should state the single biggest benefit."

### Feature Section
> "Describe [product feature] in a way that focuses on benefits, not features. Format: benefit headline (5 words), benefit explanation (2 sentences), social proof snippet."

### FAQ Section
> "Generate 8 FAQs for [product/service] landing page. Cover: pricing, setup time, results timeline, support, and cancellation policy. Answer each in 2 sentences."

## Social Proof & Testimonials
> "Write 3 customer testimonial templates for [product/service]. Each should: state the problem, describe the result, include numbers if possible. Tone: [tone]."
Format:
> "Before [product], I struggled with [problem]. After using it for [timeframe], I [specific result]."`,
    tips: ['Always write for one specific person — "the reader" is not a target', 'Every email should have exactly one goal and one CTA'],
    keyTakeaways: ['Use AIDA: Attention, Interest, Desire, Action', 'Cold emails, welcome sequences, and follow-ups each need a different approach', 'Focus on benefits, not features', 'Social proof with specific numbers is the most persuasive element'],
  },
  {
    moduleOrder: 8, order: 3,
    title: 'AI Scriptwriting for Video & Podcasts',
    duration: 20,
    summary: 'Write engaging scripts for YouTube, TikTok, and podcasts using AI.',
    content: `# AI Scriptwriting

## YouTube Script Structure

### The Hook (0-30 seconds)
The first 30 seconds determines if someone watches or clicks away.
> "Write 5 hook options for a YouTube video titled '[title]'. Options should include: a surprising statistic, a provocative question, a bold promise, a story opener, and a curiosity gap."

### The Body (30 sec - 8 min)
Structure the main content:
> "Write the body of a [length] minute YouTube video about [topic]. Include: 3 main points, each with an example. Use short sentences. Insert [visual cue] where B-roll should go. End each section with a mini-summary."

### The CTA (last 30 seconds)
> "Write a 30-second outro for my video that includes: a recap of the main takeaway, a CTA to subscribe with the reason why, and a teaser for the next video."

## TikTok / Short-Form Scripts

### The 3-Act Short
1. **Act 1 (0-3 sec)** — Hook + topic
2. **Act 2 (3-20 sec)** — Value delivery
3. **Act 3 (20-30 sec)** — CTA

> "Write a 30-second TikTok script about [topic]. Act 1: hook (2 sec). Act 2: 3 tips delivered fast (20 sec). Act 3: CTA (8 sec). Use [PAUSE] and [CUT] for pacing. Platform: [TikTok/Reels/Shorts]."

## Podcast Scripts

### Interview Questions
> "Generate 10 interview questions for [guest name/expertise]. Questions should: start broad, get specific, uncover stories, and end with a forward-looking question."

### Solo Episode Script
> "Write a 15-minute solo podcast script about [topic]. Structure: personal story (3 min), key insight with data (7 min), actionable advice (3 min), outro with episode recap (2 min). Write for spoken word — conversational, short sentences."

### Podcast Intro/Outro
> "Write a 30-second podcast intro for my show about [topic]. Include: who I am, what the show covers, what value listeners get. Tone: [tone]. Also write a 20-second outro with subscribe CTA."`,
    tips: ['Read AI scripts aloud before recording — written English and spoken English are different', 'Short-form scripts need to be twice as tight as you think'],
    keyTakeaways: ['YouTube scripts need: hook, body with 3 points, CTA', 'TikTok scripts follow 3-act structure in 30 seconds', 'Podcast scripts should be conversational, not read aloud', 'Always read scripts aloud before recording'],
  },
  // Module 9 — AI Automation & No-Code
  {
    moduleOrder: 9, order: 1,
    title: 'Introduction to AI Automation',
    duration: 18,
    summary: 'Understand how automation saves time and which tools to use.',
    content: `# Introduction to AI Automation

## What Is Automation?

Automation connects apps and services so they work together without manual effort. When one thing happens, another thing happens automatically.

**Example:** When someone fills out a contact form on your website → they're automatically added to your email list → receive a welcome email → you get a Slack notification.

## The Automation Mindset

Look for tasks you do repeatedly that involve:
1. Moving data between apps
2. Sending the same type of message
3. Formatting or transforming information
4. Monitoring and alerting

If you do it more than twice a week, automate it.

## The Big Three Automation Tools

| Tool | Best For | Pricing |
|------|----------|---------|
| Zapier | 6000+ app integrations, beginner-friendly | Free (5 zaps) / Pro $30/mo |
| Make (Integromat) | Complex workflows, visual builder | Free / Pro $9/mo |
| Bardeen | AI-powered, desktop automation | Free / Pro |

## AI vs Traditional Automation

Traditional automation follows fixed rules:
> "If [condition] → then [action]"

AI automation adds intelligence:
> "Analyse this email → if it's a support request → categorise it → draft a response → assign to the right team member"

## The 80/20 Rule of Automation

Automate 20% of your tasks to save 80% of your time. Focus on:

1. **Lead capture** — Form → CRM → email sequence
2. **Content distribution** — Blog post → social media → newsletter
3. **Meeting follow-ups** — Calendar event → thank-you email → notes
4. **Invoice management** — Payment received → receipt → accounting update
5. **Customer support** — Ticket → AI triage → response → follow-up`,
    tips: ['Start with one automation and get it working perfectly before adding more', 'Zapier is the easiest starting point — Master it before trying Make or Bardeen'],
    keyTakeaways: ['Automation connects apps so they work together automatically', 'Focus on repetitive tasks you do more than twice a week', 'AI automation adds intelligence to rule-based triggers', 'Zapier is the best starting point'],
  },
  {
    moduleOrder: 9, order: 2,
    title: 'Zapier: Automate Your Workflows',
    duration: 25,
    summary: 'Build powerful automations with Zapier — no coding required.',
    content: `# Zapier Automation

## Core Concepts

### Trigger
The event that starts the automation. Examples:
- "New Gmail email matching a search"
- "New Typeform submission"
- "New row in Google Sheets"

### Action
What happens after the trigger. Examples:
- "Create a Slack message"
- "Add contact to Mailchimp"
- "Create a Trello card"

### Zap
A complete automation: one trigger + one or more actions.

## Building Your First Zap

### Step 1: Choose a Trigger
Search for your app and select the trigger event.

### Step 2: Connect Your Account
Authorise Zapier to access the app.

### Step 3: Set Up the Trigger
Configure the conditions (e.g., "When a specific column in Sheets is updated").

### Step 4: Test the Trigger
Zapier pulls sample data so you can verify it's working.

### Step 5: Choose an Action
Select the app and action event.

### Step 6: Map Fields
Tell Zapier which data goes where (drag and drop).

### Step 7: Test & Turn On
Zapier runs a test, shows you the result, and you turn it on.

## Zapier Power Features

### Filters
Add conditions: "Only run when [field] equals [value]"

### Formatter
Transform data: format dates, numbers, text case, etc.

### Paths
Create branches: "If A → do X; If B → do Y"

### Multi-Step Zaps
Chain multiple actions: trigger → action 1 → action 2 → action 3

## 5 Must-Have Automations

1. **Lead Capture** — Typeform → Google Sheets → Mailchimp → Slack
2. **Content Repurposing** — New blog post → social posts → newsletter
3. **Invoice Alert** — Stripe payment → Slack notification → accounting sheet
4. **Support Ticket** — Email → Trello card → Slack assignment
5. **Meeting Notes** — Calendar → Otter.ai → Notion database`,
    tips: ['Test each step of a multi-step Zap individually before turning it on', 'Use filters liberally — most automation issues come from triggers firing too often'],
    keyTakeaways: ['Zapier uses triggers and actions connected by Zaps', 'Filters, Formatter, Paths, and Multi-Step are the power features', 'Start with 5 essential automations that save you the most time'],
  },
  {
    moduleOrder: 9, order: 3,
    title: 'Make.com & Bardeen: Advanced Automation',
    duration: 22,
    summary: 'Level up your automation with visual workflows and AI-powered desktop automation.',
    content: `# Make.com & Bardeen

## Make.com (Formerly Integromat)

Make is Zapier's more powerful sibling. It uses a visual canvas where you connect modules.

### Key Differences from Zapier

| Feature | Zapier | Make |
|---------|--------|------|
| Interface | Form-based | Visual canvas |
| Complexity | Beginner | Intermediate |
| Data transformations | Limited | Powerful |
| Error handling | Basic | Advanced |
| Price | Higher | Lower |

### Make's Visual Canvas

Instead of filling forms, you drag modules onto a canvas and connect them with lines. Each module represents one action. This makes it easy to see the entire flow at once.

### Aggregators
Make can collect data and process it in bulk — something Zapier cannot easily do:
> "Collect all new Typeform submissions for an hour, then send one summary email with all data."

### Routers
Create complex branching logic:
> "If email contains 'urgent' → Slack message + SMS alert. If 'question' → send FAQ response. If 'feedback' → add to feedback database."

## Bardeen

Bardeen is different — it automates your **desktop**, not just web apps.

### What Bardeen Does
- Clicks buttons, fills forms, scrapes data from any website
- Runs automations from keyboard shortcuts
- Uses AI to understand page content

### Example Automations
- Scrape LinkedIn profiles → Google Sheets
- Auto-generate meeting notes → Notion
- Fill web forms with AI-generated content
- Extract emails from any webpage

### When to Use Bardeen
- When you need to automate things without API access
- When you want quick, keyboard-driven automations
- For web scraping and data extraction

## Choosing Your Automation Tool

| Scenario | Tool |
|----------|------|
| Simple, one-step automations | Zapier |
| Complex, multi-branch workflows | Make |
| Desktop/web scraping automation | Bardeen |
| AI-powered data extraction | Bardeen |`,
    tips: ['Make handles complex workflows better than Zapier — worth learning if you automate heavily', 'Bardeen is best for tasks that involve interacting with web pages directly'],
    keyTakeaways: ['Make uses a visual canvas for complex workflows', 'Bardeen automates desktop tasks and web scraping', 'Zapier for simple, Make for complex, Bardeen for desktop automation', 'Aggregators and Routers in Make enable sophisticated logic'],
  },
  {
    moduleOrder: 10, order: 1,
    title: 'Building Your AI Productivity Stack',
    duration: 20,
    summary: 'Choose and configure tools for your workflow.',
    content: `# Your AI Productivity Stack

## The Core Stack (Free to Start)

| Tool | Use Case | Tier |
|------|----------|------|
| ChatGPT | General AI assistant | Free/Plus |
| Notion AI | Notes, docs, knowledge base | Plus |
| Grammarly | Writing polish | Free |
| Otter.ai | Meeting transcription | Free |
| Zapier | Automation | Free (5 zaps) |

## The Power Stack (When You're Ready to Invest)

| Tool | Use Case | Cost |
|------|----------|------|
| Claude | Long documents, analysis | $20/mo |
| Midjourney | Image creation | $10/mo |
| ElevenLabs | Voice/audio | $5/mo |
| Make.com | Advanced automation | $9/mo |
| Perplexity | AI research | $20/mo |

## System Design Principle

Don't collect tools — build **workflows**. A workflow connects tools into a pipeline:

\`\`\`
Raw Idea
  → ChatGPT (draft content)
    → Grammarly (polish)
      → Canva (design)
        → Buffer (schedule)
\`\`\`

## The 2-Hour Audit

Spend 2 hours listing every repeated task you do weekly. Circle anything that involves:
- Writing (emails, reports, posts)
- Research (competitor, market, topic)
- Scheduling or organising
- Data formatting or summarisation

These are your AI automation targets.`,
    tips: ['Start with one tool mastered over five tools dabbled', 'Your stack evolves — revisit it quarterly'],
    keyTakeaways: ['Build workflows, not tool collections', 'Audit repetitive tasks first', 'Free tiers are sufficient to start'],
  },
  // Module 11 — AI Avatar & Faceless Content
  {
    moduleOrder: 11, order: 1,
    title: 'AI Avatars & Digital Humans',
    duration: 20,
    summary: 'Create AI presenters and digital humans for your content.',
    content: `# AI Avatars & Digital Humans

## What Are AI Avatars?

AI avatars are digital video presenters that look and sound like real humans. You type a script, choose an avatar, and the AI generates a video of that person speaking your words.

## The Leading Tools

| Tool | Best For | Pricing |
|------|----------|---------|
| Synthesia | Professional avatars, 140+ languages | $30/mo |
| HeyGen | Realistic avatars, quick creation | Free / Pro $24/mo |
| D-ID | Talking photos, animated portraits | Free / Pro |
| Colossyan | Enterprise training videos | Custom |

## Use Cases

- **Training videos** — No need to film employees
- **Marketing videos** — Consistent brand presenter
- **Faceless YouTube channels** — Avatar narrates your content
- **Product demos** — Avatar walks through features
- **Personalised outreach** — Record at scale

## Creating Your First Avatar in HeyGen

1. Go to heygen.com and sign up
2. Choose "Instant Avatar" or "Studio Avatar"
3. **Instant Avatar** — Upload a 2-minute video of yourself; AI creates your digital twin
4. **Studio Avatar** — Select from pre-made avatars
5. Type or paste your script
6. Adjust pacing, tone, and gestures
7. Generate and download

## Best Practices

- Use a well-lit, plain background for custom avatars
- Scripts should be conversational — written English sounds robotic
- Add pauses and emphasis using SSML tags
- Use hand gestures sparingly — too many looks unnatural`,
    tips: ['Start with pre-made avatars before investing in a custom one', 'Keep scripts conversational — formal writing sounds robotic when spoken'],
    keyTakeaways: ['AI avatars create video presenters from text scripts', 'Synthesia and HeyGen are the leading tools', 'Use cases: training, marketing, faceless channels, demos', 'Conversational scripts produce the best results'],
  },
  {
    moduleOrder: 11, order: 2,
    title: 'Faceless YouTube Channels & AI Influencers',
    duration: 25,
    summary: 'Build and grow faceless content channels using AI avatars and automation.',
    content: `# Faceless Content Channels

## What Is Faceless Content?

Content where the creator never appears on camera. The channel uses AI avatars, stock footage, text-to-speech, and animations instead.

## Why Faceless?

1. **Privacy** — You never show your face or share personal details
2. **Scalability** — Produce videos 10x faster than traditional filming
3. **Low barrier** — No camera, lighting, or recording skills needed
4. **Multiple channels** — Run several channels in different niches

## Faceless Channel Types (That Actually Work)

| Niche | Format | Example Channel Size |
|-------|--------|---------------------|
| Educational | AI avatar explains topic | 100K-1M |
| Storytime | Narrated stories with visuals | 500K-5M |
| Motivational | Quotes + background footage | 100K-2M |
| Tech reviews | Avatar reviews products | 50K-500K |
| News commentary | Avatar discusses trends | 100K-1M |

## Production Workflow

### Step 1: Script (ChatGPT)
> "Write a 5-minute script about [topic] for a faceless YouTube channel. Use a conversational tone. Include 3 key points. Start with a hook that creates curiosity."

### Step 2: Visuals
Gather or generate visuals to accompany the narration:
- **Stock footage** — Pexels, Pixabay (free)
- **AI-generated images** — Midjourney, DALL-E
- **Animations** — Canva, CapCut
- **Screen recordings** — For software topics

### Step 3: Voice (ElevenLabs)
Generate professional voiceover with ElevenLabs instead of using the avatar's built-in voice.

### Step 4: Assemble (CapCut)
1. Import voiceover
2. Add visuals on separate tracks
3. Add captions (auto-generate in CapCut)
4. Add background music
5. Transitions and effects

## AI Influencers

AI influencers are completely fictional characters with their own Instagram/TikTok presence. Created with Midjourney (character design) + HeyGen (video) + ChatGPT (captions).`,
    tips: ['Consistency matters more than production quality for faceless channels', 'Pick a niche you can produce 50+ videos in without running out of ideas'],
    keyTakeaways: ['Faceless channels let you create content without showing your face', 'Profitable niches: educational, storytime, motivational, commentary', 'Workflow: script → visuals → voiceover → assemble', 'AI influencers are fictional characters with real social media presence'],
  },
  {
    moduleOrder: 11, order: 3,
    title: 'AI Voice Cloning & ElevenLabs Mastery',
    duration: 22,
    summary: 'Create professional AI voiceovers and voice clones for your content.',
    content: `# ElevenLabs & AI Voice

## ElevenLabs Overview

ElevenLabs is the industry leader for AI voice generation. It produces voices that are indistinguishable from real humans.

### Key Features
- **Text-to-Speech** — Type text, get natural voiceover
- **Voice Cloning** — Clone any voice (with permission)
- **Voice Design** — Generate completely new voices
- **Sound Effects** — AI-generated sound effects (new)
- **Dubbing** — Dub content into 29 languages

## Getting Started

1. Go to elevenlabs.io and sign up
2. Choose a pre-made voice from the Voice Library
3. Type or paste your script
4. Click Generate
5. Adjust Stability and Similarity sliders

## Voice Settings Explained

| Setting | Range | Effect |
|---------|-------|--------|
| Stability | 0-100% | Lower = more emotional, higher = more consistent |
| Similarity | 0-100% | How closely it matches the original voice |
| Style Exaggeration | 0-100% | How much to amplify vocal style |

**Rule of thumb:** Start at 70% stability, 80% similarity, and adjust based on the content type.

## Professional Voiceover Workflow

1. **Write script** in ChatGPT
2. **Add SSML tags** for pacing:
   - \`<break time="500ms"/>\` — Pause
   - \`<emphasis>\` — Stress a word
   - \`<prosody rate="slow">\` — Change speed
3. **Generate** in ElevenLabs with a professional voice
4. **Download** WAV or MP3 (high quality)
5. **Import** into your video editor

## Voice Cloning (Professional)

Clone your own voice:
1. Record 30+ minutes of clean audio (no background noise)
2. Upload to ElevenLabs Voice Lab
3. AI analyses and creates your vocal model
4. Generate any script in your voice

## Ethical Guidelines

- Never clone someone's voice without explicit permission
- Always disclose AI-generated voiceover when required by platform policies
- Use voice cloning for legitimate content creation, not impersonation`,
    tips: ['ElevenLabs generates the highest quality voices — use it for all professional voiceover work', 'Record voice clones in a quiet room with a good microphone for best results'],
    keyTakeaways: ['ElevenLabs is the industry standard for AI voice generation', 'Stability controls emotional range, Similarity controls voice match', 'SSML tags add pacing and emphasis to AI voiceover', 'Voice cloning requires explicit permission from the voice owner'],
  },
  // Module 12 — Photo Editing & UI/UX Design
  {
    moduleOrder: 12, order: 1,
    title: 'AI Photo Editing: Photoshop & Photopea',
    duration: 22,
    summary: 'Use AI-powered tools to edit photos like a professional.',
    content: `# AI Photo Editing

## Photoshop AI (Adobe Firefly)

Photoshop's AI features are powered by Adobe Firefly.

### Generative Fill
Select an area, describe what should be there, and Photoshop generates it:
> "Select the sky → Generative Fill → 'sunset with clouds'"

### Generative Expand
Extend your canvas beyond its borders — Photoshop fills in the new area intelligently.

### Remove Tool
AI-powered object removal. Paint over an object and it disappears without a trace.

### Neural Filters
AI filters that edit photos in one click:
- **Skin Smoothing** — Portrait retouching
- **Smart Portrait** — Change expression, age, head direction
- **Colorize** — Add colour to black & white photos
- **Super Zoom** — Upscale low-resolution images

## Photopea (Free Alternative)

Photopea (photopea.com) is a free browser-based Photoshop alternative.

### Why Use Photopea?
- 100% free, no subscription
- Runs in any browser
- Supports PSD, AI, XD, Sketch files
- Has AI features via plugins
- Same interface as Photoshop

### Photopea AI Features
- Magic Wand and Object Selection
- Content-Aware Fill
- Healing Brush Tool
- Clone Stamp for detailed retouching

## AI Photo Editing Workflow

1. **Crop & Straighten** — Auto-crop with AI composition detection
2. **Remove Distractions** — Generative Fill or Remove Tool
3. **Adjust Lighting** — Auto-tone or AI lighting adjustment
4. **Retouch** — Skin smoothing, blemish removal
5. **Enhance** — Super Resolution, colour grading
6. **Export** — Optimise for web or print`,
    tips: ['Generative Fill is Photoshop\'s most powerful AI feature — master it first', 'Photopea is a great free alternative that handles most editing needs'],
    keyTakeaways: ['Photoshop AI includes Generative Fill, Expand, Remove Tool, and Neural Filters', 'Photopea is a free browser-based alternative to Photoshop', 'AI photo editing workflow: crop, remove, light, retouch, enhance, export'],
  },
  {
    moduleOrder: 12, order: 2,
    title: 'Figma AI for UI/UX Design',
    duration: 25,
    summary: 'Design user interfaces with Figma\'s AI-powered features.',
    content: `# Figma AI for UI/UX Design

## Why Figma?

Figma is the industry standard for UI/UX design. It's browser-based, collaborative, and increasingly AI-powered.

## Figma AI Features

### AI-Powered Design
Describe what you need and Figma generates design suggestions:
> "Design a mobile checkout screen with 3 steps: cart, shipping, payment."

### AI Asset Generation
Generate icons, illustrations, and images directly in Figma:
> "Generate a shopping cart icon in line style, 24x24px"

### AI Layout Suggestions
Figma suggests layout improvements based on design best practices — spacing, alignment, hierarchy.

### Auto-Layout
Figma's intelligent layout system automatically adjusts spacing and alignment when content changes.

## UI Design Principles

### The 4 Laws of UI Design

1. **Proximity** — Related elements should be grouped together
2. **Alignment** — Everything should visually align with something else
3. **Contrast** — Important elements should stand out
4. **Consistency** — Similar elements should look similar

## Mobile App Design Workflow

1. **Wireframe** — Low-fidelity layout (30 min)
   - Use FigJam (Figma's whiteboard) for brainstorming
   - Define user flow: screen → screen → screen
2. **Mockup** — High-fidelity design (2 hours)
   - Apply colours, typography, spacing
   - Use components for reusable elements
   - Add real content (use AI-generated placeholder text)
3. **Prototype** — Clickable interactions (1 hour)
   - Link screens with transitions
   - Add micro-interactions (buttons, swipes)
   - Share for feedback

## AI Design Handoff

When ready to hand off to developers:
1. Mark elements with code-ready specs
2. Export assets at correct resolutions
3. Generate CSS/React code snippets
4. Document component variants`,
    tips: ['Use Figma\'s Auto-Layout for everything — it makes responsive design effortless', 'Create a component library early — it saves hours of repetitive work'],
    keyTakeaways: ['Figma is the industry standard for UI/UX design', 'AI features in Figma include design generation, asset creation, and layout suggestions', 'Follow the 4 laws: Proximity, Alignment, Contrast, Consistency', 'Workflow: wireframe → mockup → prototype'],
  },
  {
    moduleOrder: 12, order: 3,
    title: 'Brand Asset Creation & Photo Manipulation',
    duration: 18,
    summary: 'Create brand assets and manipulate photos with AI precision.',
    content: `# Brand Assets & Photo Manipulation

## What Are Brand Assets?

Brand assets are the visual elements that represent your brand:
- Logos (primary, secondary, icon-only)
- Colour palette swatches
- Typography samples
- Pattern and texture files
- Photo and illustration style guides
- Icon sets

## AI Asset Generation

### Logo Variations
> "Generate 5 variations of my logo: stacked version, icon only, white version for dark backgrounds, horizontal version, and social media avatar. Use Photoshop AI or Midjourney."

### Patterns & Textures
> "Create a seamless repeating pattern using [brand colours], geometric style, suitable for wrapping paper or website backgrounds."

### Icons
> "Design a set of 10 UI icons for [industry]: [list icons]. Line style, 24x24px, consistent stroke weight, [brand colour]."

## Photo Manipulation Techniques

### Background Replacement
1. Use Photoshop's Remove Background
2. Place subject on new background
3. Adjust lighting so shadows match
4. Use Generative Fill to blend edges

### Object Removal
1. Select object with Lasso or Object Selection Tool
2. Right-click → Generative Fill (leave prompt empty)
3. Photoshop fills the area naturally

### Colour Grading
1. Add a Gradient Map adjustment layer
2. Choose brand colours for shadows and highlights
3. Reduce opacity to 30-50% for a subtle look

## AI Upscaling

Use AI upscalers for low-resolution images:
- **Photoshop Super Resolution** — Built-in, 4x upscale
- **Topaz Gigapixel** — Professional, up to 6x
- **Clipdrop Image Upscaler** — Free, 2x upscale

## Asset Export Guide

| Use Case | Format | Resolution |
|----------|--------|------------|
| Web | PNG / WebP | 72 DPI |
| Print | PDF / TIFF | 300 DPI |
| Social media | PNG / JPG | 1080×1080px |
| App icon | PNG | 1024×1024px |
| Email signature | PNG | 300×100px |`,
    tips: ['Create all brand assets at 2x resolution and scale down — future-proof your assets', 'Use Photoshop Generative Fill to quickly create multiple variations of any asset'],
    keyTakeaways: ['Brand assets include logos, palettes, typography, patterns, and icons', 'AI tools excel at background replacement, object removal, and colour grading', 'Export at multiple resolutions for different use cases', 'AI upscaling recovers detail in low-resolution images'],
  },
  // Module 13 — AI Website Building
  {
    moduleOrder: 13, order: 1,
    title: 'No-Code AI Websites: Durable & 10Web',
    duration: 20,
    summary: 'Build complete websites in minutes using AI website builders.',
    content: `# AI Website Builders

## Why AI Websites?

Traditional website building takes days or weeks. AI website builders generate a complete, functional website from a single description in under 5 minutes.

## The Leading AI Website Builders

| Tool | Best For | Pricing |
|------|----------|---------|
| Durable | Small business sites, landing pages | Free / Pro $12/mo |
| 10Web | WordPress sites with AI | Free / Pro |
| Framer | Design-focused portfolios | Free / Pro |
| Wix ADI | Full business websites | Free / Pro |
| Hostinger AI | E-commerce, blogs | Free / Pro |

## Durable Deep Dive

Durable generates a complete website from a business description.

### Getting Started
1. Go to durable.co
2. Enter your business type: "Coffee shop in Austin, Texas"
3. Choose a style preference
4. AI generates a 5-page website in 30 seconds

### What You Get
- Home, About, Services, Contact pages
- AI-written content for each page
- Stock images relevant to your business
- Contact form, map, social links
- Responsive design (mobile + desktop)

## 10Web Deep Dive

10Web works with WordPress, giving you more control.

### Key Features
- AI WordPress site generation
- AI content writing for each page
- AI image generation and selection
- SEO optimisation built-in
- Hosting included

### When to Use 10Web
- You need WordPress (plugins, full CMS)
- You plan to scale beyond a landing page
- You want full control over design after AI generation

## AI Website Workflow

1. **Define** — Write a clear business description
2. **Generate** — Let AI create the initial site
3. **Customise** — Adjust design, content, and images
4. **Add pages** — About, Services, Blog, Contact
5. **Configure** — SEO, analytics, contact forms
6. **Launch** — Connect domain, go live`,
    tips: ['Write a detailed business description before generating — quality in = quality out', 'AI-generated sites are a great starting point, but always customise the content'],
    keyTakeaways: ['AI website builders generate complete sites in under 5 minutes', 'Durable is best for simple business sites and landing pages', '10Web is best for WordPress-based sites needing full CMS control', 'Workflow: define → generate → customise → launch'],
  },
  {
    moduleOrder: 13, order: 2,
    title: 'Framer: AI-Powered Portfolio & Marketing Sites',
    duration: 22,
    summary: 'Design stunning, custom websites with Framer\'s AI features.',
    content: `# Framer AI Websites

## Why Framer?

Framer is a design-first website builder used by professional designers. Its AI features make it accessible to non-designers too.

## Framer AI Features

### AI Site Generation
Describe your site and Framer generates a complete design:
> "A minimalist portfolio for a UX designer, dark theme, with project grid, about section, and contact form."

### AI Copywriting
Generate website copy directly in Framer:
> "Write a hero section headline and subheadline for my freelance design services. Tone: confident and approachable."

### AI Image Generation
Generate images without leaving Framer:
> "Abstract geometric background in blue and purple, suitable for a tech portfolio hero section."

### Smart Components
Framer's pre-built components adapt to your content automatically.

## Framer vs Other Builders

| Feature | Framer | Durable | Webflow |
|---------|--------|---------|---------|
| Design control | Excellent | Limited | Excellent |
| AI generation | Good | Excellent | Limited |
| Learning curve | Medium | Low | High |
| CMS | Basic | Basic | Advanced |
| Pricing | $10-30/mo | $12/mo | $15-35/mo |

## Building a Portfolio Site

### Structure
1. **Hero** — Name, title, headline, CTA
2. **Work** — Grid of projects with hover effects
3. **About** — Bio, skills, experience
4. **Services** — What you offer with pricing
5. **Contact** — Form, social links, availability

### Design Tips
- Use negative space generously
- Limit to 1-2 font families
- Use 3-5 brand colours maximum
- Keep the hero section simple — one clear message
- Use smooth scroll animations (Framer does this well)

### SEO Setup
- Add page titles and descriptions
- Set up Open Graph for social sharing
- Add a blog or case studies for content
- Submit sitemap to Google Search Console`,
    tips: ['Framer is best when you care deeply about design quality', 'Start with a template and use AI to customise — don\'t design from scratch'],
    keyTakeaways: ['Framer is a design-first website builder with strong AI features', 'It offers greater design control than Durable but has a learning curve', 'Portfolio sites need: hero, work, about, services, contact', 'Framer excels at design animations and micro-interactions'],
  },
  {
    moduleOrder: 13, order: 3,
    title: 'Landing Pages That Convert: AI Workflow',
    duration: 18,
    summary: 'Create high-converting landing pages using AI from concept to launch.',
    content: `# AI Landing Pages

## The Anatomy of a Converting Landing Page

1. **Hero** — Headline + subheadline + CTA + supporting image
2. **Social Proof** — Logos, testimonials, numbers
3. **Problem/Agitation** — The pain you solve
4. **Solution** — How your product works (3 steps)
5. **Benefits** — Features → benefits (3 columns)
6. **Scarcity/Urgency** — Limited time or availability
7. **FAQ** — Overcome objections
8. **Final CTA** — One clear action

## AI Landing Page Workflow

### Step 1: Strategy (ChatGPT)
> "Create a landing page strategy for [product]. Target audience: [describe]. Goal: [conversion goal]. Include: hook angle, 3 key benefits, objections to address, and a CTA strategy."

### Step 2: Copy (ChatGPT)
> "Write landing page copy for [product]. Use the structure: hero, problem, solution, benefits, social proof, FAQ, CTA. Each section max 50 words. Tone: [tone]. Include specific numbers where possible."

### Step 3: Visuals (Midjourney/DALL-E)
> "Hero image for a landing page: [describe scene], professional lighting, clean composition, space for text overlay, wide aspect ratio."

### Step 4: Build (Durable/Framer)
1. Paste AI-generated copy into your chosen builder
2. Add generated visuals
3. Set up form/email integration
4. Add analytics tracking

## Conversion Rate Optimisation

### Elements to Test
| Element | Test Ideas |
|---------|------------|
| Headline | Benefit vs curiosity vs question |
| CTA text | "Get Started" vs "Claim My Spot" |
| CTA colour | Red vs green vs blue |
| Social proof | Numbers vs logos vs testimonials |
| Form length | 3 fields vs 6 fields |
| Images | Product shot vs lifestyle vs illustration |

### The One-Second Test
Show your landing page to someone for 1 second. Ask: "What does this company do?" If they can't answer, redesign.

## Mobile-First Design

- 70%+ of landing page traffic is mobile
- Single column layout
- CTA button full width and thumb-friendly
- Text large enough to read without zooming
- Forms auto-fill enabled`,
    tips: ['A/B test the hero section first — it has the biggest impact on conversion', 'The 1-second test reveals if your value proposition is clear enough'],
    keyTakeaways: ['High-converting landing pages follow a proven structure: hero through final CTA', 'Use AI for every phase: strategy, copy, visuals, build', 'Test one element at a time for meaningful A/B test results', 'Design mobile-first — 70%+ of traffic is mobile'],
  },
  // Module 14 — Icons, Assets & Resources
  {
    moduleOrder: 14, order: 1,
    title: 'UI Icons & Asset Libraries',
    duration: 15,
    summary: 'Find, customise, and create professional UI icons and design assets.',
    content: `# UI Icons & Asset Libraries

## Why Professional Assets Matter

Users judge a product's quality in 50 milliseconds. Professional icons and assets signal quality, trustworthiness, and attention to detail.

## Top Icon Resources

| Resource | Type | Pricing |
|----------|------|---------|
| Iconfinder | 5M+ icons, icon sets | Free / Pro |
| Icons8 | Icons, illustrations, photos | Free / Pro |
| Flaticon | Vector icons, stickers | Free / Pro |
| Lucide | Open-source icons | Free |
| Heroicons | MIT-licensed, by Tailwind | Free |

## Icon Best Practices

### Consistency Rules
- Same stroke weight across all icons
- Same corner radius (rounded or sharp)
- Same perspective (filled, outline, or duotone)
- Same size grid (24×24px is standard)

### When to Use Each Style
| Style | Use Case | Example |
|-------|----------|---------|
| Outline | UI navigation, toolbar icons | Settings, Profile |
| Filled | Active states, CTAs | Selected tab |
| Duotone | Highlighted features | Featured on homepage |
| Custom brand | Unique identity | Company mascot |

## AI Icon Generation

Generate custom icons with AI:
> "Design an icon for [concept], line style, 24x24px, consistent 2px stroke, rounded corners, suitable for a mobile app navigation bar."

## Asset Management

### Organise Your Assets
- **Colour code** folders by category
- **Name consistently** — "icon-{name}-{style}-{size}"
- **Version control** — Keep original and exported versions
- **Cloud sync** — Google Drive, Dropbox, or Notion

## Asset Export Guide

| Use | Format | Size |
|-----|--------|------|
| Web | SVG | Vector |
| Mobile (iOS) | PNG | @1x, @2x, @3x |
| Mobile (Android) | PNG | mdpi, hdpi, xhdpi |
| Desktop | PNG | 16, 24, 32, 48, 64px |
| Print | PDF/PNG | 300 DPI |`,
    tips: ['Use SVG format for web icons — they are resolution-independent and smaller than PNGs', 'Keep a master icon library file so all your icons stay consistent'],
    keyTakeaways: ['Professional assets signal quality and build trust', 'Icon consistency: same stroke weight, radius, perspective, and grid size', 'Use AI to generate custom icons in your brand style', 'Export icons in the correct formats for each platform'],
  },
  {
    moduleOrder: 14, order: 2,
    title: 'Stock Photos, Videos & Design Resources',
    duration: 15,
    summary: 'Find high-quality free and premium design resources for any project.',
    content: `# Design Resources

## Free Stock Photo Resources

| Resource | Quality | Licence |
|----------|---------|---------|
| Unsplash | Excellent | Free for commercial use |
| Pexels | Very good | Free for commercial use |
| Pixabay | Good | Free for commercial use |
| Burst (Shopify) | Good | Free for commercial use |

## Premium Stock Resources

| Resource | Best For | Pricing |
|----------|----------|---------|
| Shutterstock | Largest library | Subscription |
| Getty Images | Editorial, premium | Per image |
| Envato Elements | Unlimited downloads | $16/mo |
| Adobe Stock | Creative Cloud integration | Subscription |

## AI-Generated Visuals vs Stock

| Factor | Stock Photos | AI-Generated |
|--------|-------------|--------------|
| Cost | Free to expensive | Pennies per image |
| Uniqueness | Used by others | 100% unique |
| Variety | Limited by library | Unlimited |
| Realism | Real people/places | Can look artificial |
| Licensing | Varies | You own the rights |

## Mockup Resources

Present your designs in realistic contexts:
- **Mockup World** — Free PSD mockups
- **Smartmockups** — Browser-based mockups
- **Placeit** — Easy mockup generator
- **Artboard Studio** — Professional mockups

## Colour & Typography Resources

### Colour
- **Coolors.co** — AI colour palette generator
- **Adobe Colour** — Colour wheel and themes
- **Colormind** — AI-powered colour schemes

### Typography
- **Google Fonts** — 1500+ free fonts
- **Fontpair** — Font pairing suggestions
- **Fontjoy** — AI font pairing generator
- **Typewolf** — Typography inspiration

## Design Inspiration

- **Dribbble** — UI/UX design shots
- **Behance** — Full design projects
- **Awwwards** — Award-winning websites
- **Land-book** — Landing page inspiration
- **Refero** — Design references organised by pattern`,
    tips: ['Bookmark your favourite resources — a good collection saves hours of searching', 'Use AI-generated images when you need unique visuals, stock photos when you need real people'],
    keyTakeaways: ['Unsplash, Pexels, and Pixabay offer excellent free stock photos', 'AI-generated images are 100% unique and cost pennies', 'Use mockup resources to present designs in realistic contexts', 'Coolors, Google Fonts, and Fontpair are essential colour and typography tools'],
  },
  {
    moduleOrder: 14, order: 3,
    title: 'Building Your Personal Design Asset Library',
    duration: 12,
    summary: 'Organise and maintain a reusable library of design assets.',
    content: `# Your Design Asset Library

## Why You Need One

Every time you search for an icon, font, or image you've used before, you waste 10-15 minutes. A personal asset library eliminates this friction entirely.

## What to Include

### Core Assets
- Brand logos (all formats and colour variations)
- Colour palette files (.ase, .json, screenshots)
- Font files (with licence documents)
- Icon sets you use frequently
- Templates (social media, presentations, documents)

### Reference Assets
- Mood board screenshots
- Competitor design examples
- Colour palette inspiration
- Typography pairings you like
- Animation examples

## Organisation Structure

\`\`\`
/Assets
  /Brands
    /ClientName
      /Logos
      /Fonts
      /Colours
      /Templates
  /Icons
    /Outline
    /Filled
    /Custom
  /Photos
    /Backgrounds
    /People
    /Textures
  /Templates
    /Social-Media
    /Presentations
    /Email
    /Documents
  /Fonts
    /Sans-Serif
    /Serif
    /Display
    /Script
\`\`\`

## Tools for Asset Management

| Tool | Purpose |
|------|---------|
| Eagle App | Visual asset manager |
| Notion | Asset database with previews |
| Google Drive | Cloud storage, sharing |
| Dropbox | File sync, team access |
| Canva Brand Kit | Brand assets in Canva |

## Maintenance Routine

Weekly (15 min):
- File new assets you downloaded
- Delete duplicates and unused files
- Rename inconsistent files

Monthly (30 min):
- Review what you actually use
- Archive outdated assets
- Update brand assets for active clients

Quarterly (1 hour):
- Full audit of all assets
- Backup to cloud storage
- Purge anything unused for 6+ months`,
    tips: ['Eagle App is worth the investment if you manage lots of visual assets', 'Keep your library organised from day one — retroactive organisation is painful'],
    keyTakeaways: ['A personal asset library saves 10-15 minutes per search', 'Organise by type: brands, icons, photos, templates, fonts', 'Use Eagle, Notion, or cloud storage for asset management', 'Maintain with weekly, monthly, and quarterly routines'],
  },
  // Module 15 — AI Tools Mastery
  {
    moduleOrder: 15, order: 1,
    title: 'The AI Tools Landscape: Deep Dive',
    duration: 25,
    summary: 'Comprehensive overview of the most powerful AI tools and how they fit together.',
    content: `# The AI Tools Landscape

## Tier 1: Essential Tools (Every Creator Needs)

| Tool | Purpose | Cost |
|------|---------|------|
| ChatGPT | General AI assistant | Free / $20/mo |
| Canva | Design, presentations, video | Free / $13/mo |
| ElevenLabs | Voiceover, audio | Free / $5/mo |
| Zapier | Automation | Free / $30/mo |

These four tools cover 80% of what most creators need.

## Tier 2: Specialised Tools (Level Up Specific Areas)

| Category | Tool | Best For |
|----------|------|----------|
| Video | Runway | Text-to-video |
| Images | Midjourney | Artistic generation |
| Presentations | Beautiful.ai | Auto-layout decks |
| Writing | Jasper | Long-form content |
| Research | Perplexity | AI-powered search |
| Websites | Framer | Design-first sites |

## Tier 3: Premium Tools (Professional Edge)

| Tool | Cost | Value |
|------|------|-------|
| Synthesia | $30/mo | AI avatars for video |
| Descript | $24/mo | AI video/audio editing |
| Surfer SEO | $59/mo | SEO optimisation |
| Make.com | $9/mo | Advanced automation |

## Tool Stack Recommendations

### The $0 Stack
ChatGPT (free) + Canva (free) + ElevenLabs (free) + Zapier (free, 5 zaps)

### The Power User Stack ($50/mo)
ChatGPT Plus ($20) + Canva Pro ($13) + ElevenLabs ($5) + Zapier Starter ($30)

### The Professional Stack ($100/mo)
All of the above + Midjourney ($10) + Runway ($15) + Framer ($10) + Make ($9)

## The 30-Day Tool Audit

Try one new tool per week for a month. Keep the ones that save you time. Drop the ones that don't. Most people overestimate what they need and underestimate what their current tools can do.`,
    tips: ['Master your Tier 1 tools before adding Tier 2 — depth beats breadth', 'The $0 stack is surprisingly powerful for beginners'],
    keyTakeaways: ['Tier 1: ChatGPT, Canva, ElevenLabs, Zapier cover 80% of needs', 'Add specialised and premium tools as you grow', 'Match your stack to your budget and use cases', 'Audit your tools regularly — drop what you are not using'],
  },
  {
    moduleOrder: 15, order: 2,
    title: 'Tool Integration & Workflow Design',
    duration: 22,
    summary: 'Connect multiple AI tools into seamless, automated workflows.',
    content: `# Tool Integration & Workflow Design

## Why Integrated Workflows Matter

Using tools in isolation is like owning kitchen appliances but never combining them to cook a meal. The real power comes from connecting tools into workflows.

## The Integration Stack

### Native Integrations
Most tools connect directly via built-in integrations:
- Canva connects to: ChatGPT, Google Drive, Dropbox, social media
- Zapier connects to: 6000+ apps
- Make.com connects to: 2000+ apps

### API Connections (No-Code)
Tools like Zapier let you connect apps that don't have native integrations.

## High-Impact Workflows

### Content Creation Pipeline
\`\`\`
ChatGPT (draft blog post)
  → Canva (create featured image)
    → WordPress (auto-publish)
      → Zapier (post to social media)
        → Mailchimp (send to newsletter)
\`\`\`

### Client Onboarding Flow
\`\`\`
Calendly (client books call)
  → ChatGPT (draft welcome email)
    → Gmail (send email)
      → Notion (create project page)
        → Trello (create task list)
\`\`\`

### Social Media Content System
\`\`\`
ChatGPT (generate 10 post ideas)
  → Canva (batch create graphics)
    → Buffer (schedule posts)
      → Zapier (track engagement)
        → Google Sheets (log metrics)
\`\`\`

## Workflow Design Principles

1. **Input → Process → Output** — Every workflow has these three stages
2. **One trigger, many actions** — One event can start multiple sequences
3. **Error handling** — What happens if a step fails?
4. **Logging** — Track what happened and when
5. **Review monthly** — Automations drift over time as tools change

## Avoiding Tool Bloat

Ask these questions before adding a tool:
1. Can my current stack do this?
2. Will I use this weekly?
3. Does it integrate with my existing tools?
4. Is there a free alternative?`,
    tips: ['Design workflows as pipelines — each tool feeds the next', 'Review your automations monthly — tools change APIs and break connections'],
    keyTakeaways: ['Integrated workflows are more powerful than isolated tools', 'Use Zapier or Make to connect tools without native integrations', 'Design workflows as input → process → output pipelines', 'Review tool stack and automations monthly'],
  },
  {
    moduleOrder: 15, order: 3,
    title: 'Choosing the Right Tool for the Job',
    duration: 18,
    summary: 'A decision framework for selecting AI tools based on your specific needs.',
    content: `# Choosing the Right AI Tool

## The Decision Framework

Ask these 5 questions before choosing any tool:

### 1. What am I trying to create?
Be specific: "A 30-second Instagram Reel" not "video content"

### 2. What quality level do I need?
- **Good enough** — Free tools, fast output
- **Professional** — Paid tools, higher quality
- **Exceptional** — Premium tools, best results

### 3. What's my budget?
- **$0** — Free tiers (surprisingly capable)
- **$30-50/mo** — Core professional tools
- **$100+/mo** — Full professional stack

### 4. How much time do I have?
- **5 minutes** — AI-generated, no customisation
- **1 hour** — AI-generated with some editing
- **4+ hours** — Custom creation, maximum quality

### 5. Will I use this more than once?
- One-off → Use the simplest free tool
- Weekly → Invest in the best tool
- Daily → Premium tools are worth it

## Tool Selection Matrix

| Task | $0 Option | Professional | Premium |
|------|-----------|-------------|---------|
| Text generation | ChatGPT Free | ChatGPT Plus | Claude Pro |
| Image generation | DALL-E (ChatGPT) | Midjourney | Adobe Firefly |
| Video generation | CapCut AI | Runway | Custom production |
| Design | Canva Free | Canva Pro | Adobe Creative Cloud |
| Voiceover | ElevenLabs Free | ElevenLabs Pro | Professional studio |
| Automation | Zapier Free | Zapier Pro | Make.com |
| Websites | Durable Free | Durable Pro | Framer + CMS |

## The Mastery Path

Don't try to learn everything at once:

**Month 1:** ChatGPT + Canva (create content)
**Month 2:** + Zapier (automate workflows)
**Month 3:** + Runway + ElevenLabs (add video + audio)
**Month 4:** + Midjourney + Framer (design + websites)
**Month 5:** + Make.com + Synthesia (advanced automation + avatars)

Each month builds on the previous. By month 6, you have a complete AI toolkit without feeling overwhelmed.`,
    tips: ['Don\'t try to learn all tools at once — add one per month', 'The $0 stack is genuinely useful — start there before spending money'],
    keyTakeaways: ['Choose tools based on: task, quality, budget, time, and frequency', 'Start with free tiers and upgrade as your needs grow', 'Follow the mastery path: one new tool per month', 'A complete AI toolkit takes 6 months to build — be patient'],
  },
  // Module 16 — AI Content Monetization
  {
    moduleOrder: 16, order: 1,
    title: 'Freelancing with AI Skills',
    duration: 25,
    summary: 'Start a freelance business offering AI-powered services.',
    content: `# Freelancing with AI

## Why AI Skills Are Valuable

Businesses want AI results but don't have AI skills. You bridge that gap. AI lets you deliver work 10x faster than traditional freelancers, so you can charge competitive rates while earning more per hour.

## High-Demand AI Freelance Services

| Service | Rate Range | AI Tools Used |
|---------|------------|---------------|
| AI content writing | $50-200/post | ChatGPT, Jasper |
| AI video creation | $100-500/video | Runway, HeyGen |
| AI design & branding | $200-1000/project | Canva AI, Midjourney |
| AI automation setup | $500-3000/project | Zapier, Make |
| AI consulting/training | $100-300/hour | Various |
| SEO content with AI | $100-400/post | ChatGPT, Surfer SEO |

## Getting Your First Clients

### Platform Strategy
1. **Upwork** — Create a profile highlighting AI skills
2. **Fiverr** — Offer "AI-powered [service]" gigs
3. **LinkedIn** — Post AI content to attract inbound leads
4. **Cold outreach** — Identify businesses, offer a free audit

### Portfolio Building

Create sample work using AI:
- "Before/After" comparisons
- Case studies with specific results
- Free audits for potential clients
- Content showing your process

### Pricing Strategy

| Level | Rate | Target Clients |
|-------|------|----------------|
| Beginner | $25-50/hr | Small businesses |
| Intermediate | $75-150/hr | Growing companies |
| Expert | $200+/hr | Enterprise clients |

## The Client Workflow

1. **Discovery call** — Understand their needs
2. **Proposal** — Scope, timeline, price
3. **AI production** — Do the work
4. **Client review** — Get feedback
5. **Revisions** — Polish (limit to 2 rounds)
6. **Delivery** — Final files + documentation
7. **Follow-up** — Ask for testimonial, referral`,
    tips: ['Specialise in one AI service and become the best at it — generalists earn less', 'Show results, not tools — clients care about outcomes, not which AI you used'],
    keyTakeaways: ['AI freelancers charge premium rates because they deliver 10x faster', 'High-demand services: content, video, design, automation, consulting', 'Start on Upwork/Fiverr, build portfolio, raise rates as you grow', 'Specialise in one service area for maximum income'],
  },
  {
    moduleOrder: 16, order: 2,
    title: 'Digital Products with AI',
    duration: 22,
    summary: 'Create and sell digital products using AI — from templates to courses.',
    content: `# Digital Products with AI

## Why Digital Products

Digital products are the best way to earn passive income with AI. Create once, sell forever. AI makes creation 10x faster.

## Profitable Digital Product Ideas

| Product Type | Example | AI Tools |
|-------------|---------|----------|
| Templates | Social media templates | Canva AI |
| Prompt packs | "100 ChatGPT prompts for marketers" | ChatGPT |
| E-books | "AI for Small Business" | ChatGPT |
| Online courses | "AI Video Masterclass" | ChatGPT + HeyGen |
| AI avatars/voices | Custom avatar packages | HeyGen, ElevenLabs |
| Print-on-demand | AI-designed merch | Midjourney |
| Stock assets | AI-generated photos, icons | Midjourney, DALL-E |
| Notion templates | AI workflow templates | ChatGPT + Notion |

## Product Creation Workflow

### Step 1: Validate the Idea
> "Is there demand for [product idea]? Search on Gumroad, Etsy, Udemy. Look at competitor reviews — what do customers wish existed?"

### Step 2: Create with AI
Use AI for 80% of the work, then add your expertise for the final 20%.

### Step 3: Package & Brand
Create professional packaging:
- **Cover image** — Canva AI or Midjourney
- **Product name** — ChatGPT brainstorming
- **Description** — AI copywriting
- **Preview** — Free sample chapter or template

### Step 4: Set Up Sales
| Platform | Best For | Fees |
|----------|----------|------|
| Gumroad | Digital downloads | 10% |
| Etsy | Templates, printables | 6.5% |
| Udemy | Online courses | 3-37% |
| Sellfy | Full storefront | Subscription |

## Pricing Digital Products

| Type | Price Range |
|------|------------|
| Templates | $5-50 |
| Prompt packs | $10-30 |
| E-books | $10-40 |
| Courses | $50-500 |
| Bundles | $50-200 |

## Marketing Your Products

- **Free sample** — Give away a small version to build email list
- **Bundle deals** — Package 3 products at a discount
- **Affiliate programme** — Let others sell for commission
- **Content marketing** — Create free content that leads to products`,
    tips: ['Create one great product before trying to create five mediocre ones', 'Price based on value delivered, not time spent — AI makes creation fast, but value is still value'],
    keyTakeaways: ['Digital products provide passive income: create once, sell forever', 'Use AI for 80% of product creation, add your expertise for the final 20%', 'Validate demand before creating — check competitors and customer reviews', 'Sell on Gumroad, Etsy, or Udemy depending on product type'],
  },
  {
    moduleOrder: 16, order: 3,
    title: 'Building an AI-Powered Agency',
    duration: 28,
    summary: 'Scale your AI services into a full agency business.',
    content: `# AI-Powered Agency

## The Agency Model

An AI agency uses AI tools to deliver services at scale. Instead of trading time for money as a freelancer, an agency systematises and scales.

## Agency Service Models

### Retainer Model ($1000-5000/mo)
Monthly recurring services:
- X blog posts per month
- X social media posts
- X AI videos
- Ongoing automation management

### Project Model ($2000-20000/project)
One-time deliverables:
- Website build
- Brand identity
- Automation setup
- Content library creation

### Hybrid Model
Retainer base + project upsells.

## Building Your Agency

### Phase 1: Solo (Months 1-3)
- Offer 2-3 services
- Do all work yourself
- Build processes and templates
- Client minimum: $1000/mo

### Phase 2: Leverage (Months 4-6)
- Hire first VA or freelancer
- Create SOPs for every service
- Batch production workflows
- Raise rates 30%

### Phase 3: Scale (Months 7-12)
- Hire specialised team members
- Build a sales process
- Add 2-3 more service lines
- Target $10k+ monthly revenue

## Operations & Systems

### Client Onboarding
1. Sales call → proposal → contract → payment
2. Kickoff meeting (set expectations)
3. Asset collection (brand, content, access)
4. Production begins
5. Weekly check-ins
6. Monthly reporting

### Production System
Create SOPs for every deliverable:
> "Social media post SOP: ChatGPT generates 5 captions → client picks 2 → Canva batch creates graphics → Buffer schedules → Zapier logs to spreadsheet"

## Finding Agency Clients

- **Referrals** — Best source, zero acquisition cost
- **LinkedIn outreach** — Target decision-makers
- **Partnerships** — Web designers, marketing agencies needing overflow
- **Content marketing** — Case studies, how-to guides, results

## Tools to Run Your Agency

| Function | Tool |
|----------|------|
| CRM | HubSpot (free) |
| Project management | Notion or Asana |
| Invoicing | FreshBooks or Stripe |
| Communication | Slack or Discord |
| SOPs | Notion or Process.st |
| Time tracking | Toggl |`,
    tips: ['Start as a freelancer, systematise as you grow, then hire — in that order', 'Create SOPs for everything before you hire anyone — it makes onboarding 10x faster'],
    keyTakeaways: ['An AI agency systematises and scales AI-powered services', 'Three phases: solo → leverage → scale', 'Create SOPs for every deliverable before hiring', 'Retainer model provides predictable monthly revenue', 'Referrals and partnerships are the best client sources'],
  },
  {
    moduleOrder: 16, order: 4,
    title: 'Scaling & Long-Term Income Strategy',
    duration: 20,
    summary: 'Build multiple income streams and scale your AI skills over time.',
    content: `# Scaling & Long-Term Income

## The Income Ladder

| Level | Monthly Income | Strategy |
|-------|---------------|----------|
| 1 | $0-1000 | Freelance, entry-level gigs |
| 2 | $1000-3000 | Specialised freelance, first retainer clients |
| 3 | $3000-8000 | Multiple retainers, digital products |
| 4 | $8000-20000 | Agency, course sales, product bundles |
| 5 | $20000+ | Multiple revenue streams, team, passive income |

## Multiple Income Streams

Don't rely on one source of income. Build multiple:

### Active Income
- Freelance client work
- Agency retainers
- Consulting calls

### Passive Income
- Digital product sales
- Online course revenue
- Template/asset sales
- Affiliate marketing

### Leveraged Income
- Agency (you oversee, team delivers)
- Licensing (sell your system to other agencies)
- Speaking/training (charge for expertise)

## The AI Skills Flywheel

### How It Works
1. Learn a skill → create content about it
2. Content attracts clients → paid client work
3. Client work creates case studies → more content
4. Convert content into digital products
5. Products fund learning new skills → repeat

## Long-Term Positioning

### Stay Ahead of the Curve
- The AI landscape changes monthly
- Follow: blogs, newsletters, YouTube channels
- Experiment with new tools immediately
- Specialise in emerging areas before they get crowded

### Build Your Brand
- Publish consistently (weekly minimum)
- Share results, not just knowledge
- Build a following on 1-2 platforms
- Network with other AI professionals

## The 5-Year Vision

**Year 1:** Learn tools, get first clients, earn $2k/mo
**Year 2:** Specialise, raise rates, add products, earn $5k/mo
**Year 3:** Build agency, hire team, earn $10k/mo
**Year 4:** Scale operations, multiple streams, earn $20k/mo
**Year 5:** Authority position, lead gen is inbound, earn $40k+/mo

The AI revolution is early. Those who build skills and systems now will be the leaders of the next decade.`,
    tips: ['Your personal brand is your most valuable asset — invest in it consistently', 'The AI flywheel: learn → create → serve → productise → repeat'],
    keyTakeaways: ['Build multiple income streams: active, passive, and leveraged', 'Use the AI skills flywheel to compound growth', 'Stay ahead by experimenting with new tools immediately', 'The 5-year path: learn → specialise → agency → scale → authority'],
  },
];
const PROMPTS_DATA = [
  // Marketing & Social Media
  {
    promptId: 'MKT_001', category: 'Marketing & Social Media', subcategory: 'Instagram Reel',
    title: 'Instagram Reel Creation with ChatGPT, Leonardo AI & Canva',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['instagram', 'reel', 'canva', 'video', 'social-media'],
    description: 'Generate a complete Instagram Reel strategy including hook, script, visuals, and CTA.',
    promptText: `Hello ChatGPT,
I need guidance on creating an Instagram reel using ChatGPT for the script, Leonardo AI for visuals, and Canva for editing.

● Topic/Theme of the Reel: [Insert topic/theme]
● Target Audience: [Insert target audience]
● Key Message: [Insert key message or CTA]
● Reel Duration: [15 / 30 / 60 seconds]
● Brand Tone: [e.g., professional, playful, inspirational]

Please provide:
1. A punchy opening hook (first 3 seconds)
2. A step-by-step reel script with timestamps
3. Visual direction for each scene (for Leonardo AI prompts)
4. On-screen text suggestions
5. Closing CTA
6. 5 relevant hashtags`,
    placeholders: ['[Insert topic/theme]', '[Insert target audience]', '[Insert key message or CTA]', '[15 / 30 / 60 seconds]', '[e.g., professional, playful, inspirational]'],
  },
  {
    promptId: 'MKT_002', category: 'Marketing & Social Media', subcategory: 'TikTok',
    title: 'TikTok Short-Form Video Script Generator',
    difficulty: 'beginner', estimatedTime: '8 min',
    tags: ['tiktok', 'short-form', 'video', 'viral'],
    description: 'Create a viral TikTok script optimised for engagement and shares.',
    promptText: `Hello ChatGPT,
Create a TikTok script designed to go viral in my niche.

● Niche/Industry: [Insert niche]
● Video Length: [15 / 30 / 60 seconds]
● Hook Style: [Shocking fact / Question / Controversial take / Story]
● Main Value Delivered: [What does the viewer learn or feel?]
● CTA at End: [Follow / Comment / Share / Visit link]

Provide:
1. Hook line (must stop the scroll in 2 seconds)
2. Full script with [PAUSE] and [CUT] stage directions
3. Suggested trending audio description
4. On-screen text overlays
5. Engagement-bait question for comments`,
    placeholders: ['[Insert niche]', '[15 / 30 / 60 seconds]', '[Shocking fact / Question / Controversial take / Story]', '[What does the viewer learn or feel?]', '[Follow / Comment / Share / Visit link]'],
  },
  {
    promptId: 'MKT_003', category: 'Marketing & Social Media', subcategory: 'Facebook Ads',
    title: 'Facebook Ad Copy — Complete Campaign Creator',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['facebook', 'ads', 'paid-media', 'conversion'],
    description: 'Generate full Facebook ad campaign copy including primary text, headlines, and descriptions.',
    promptText: `Hello ChatGPT,
Create a complete Facebook ad campaign for my product/service.

● Product/Service: [Insert product or service]
● Target Audience: [Age, interests, pain points]
● Campaign Objective: [Awareness / Traffic / Conversions / Lead Gen]
● Budget Level: [Low <$50/day / Medium $50–200/day / High >$200/day]
● Unique Selling Proposition: [What makes you different?]
● Offer: [Discount / Free trial / Lead magnet / Demo]

Generate:
1. 3 primary text variations (short, medium, long)
2. 5 headline options
3. 3 description copy options
4. Audience targeting suggestions
5. Ad creative direction (image/video concept)
6. A/B test recommendation`,
    placeholders: ['[Insert product or service]', '[Age, interests, pain points]', '[Awareness / Traffic / Conversions / Lead Gen]', '[Low / Medium / High]', '[What makes you different?]', '[Discount / Free trial / Lead magnet / Demo]'],
  },
  {
    promptId: 'MKT_004', category: 'Marketing & Social Media', subcategory: 'LinkedIn',
    title: 'LinkedIn Thought Leadership Post Generator',
    difficulty: 'beginner', estimatedTime: '7 min',
    tags: ['linkedin', 'thought-leadership', 'b2b', 'personal-brand'],
    description: 'Create high-performing LinkedIn posts that build authority and generate engagement.',
    promptText: `Hello ChatGPT,
Write a LinkedIn post that positions me as a thought leader in my industry.

● My Industry/Niche: [Insert industry]
● My Unique Insight or Experience: [Insert the story or insight]
● Target Reader: [Job title or professional type]
● Post Goal: [Build followers / Generate leads / Drive traffic / Spark discussion]
● Tone: [Professional / Conversational / Vulnerable / Bold]

Structure the post with:
1. A scroll-stopping first line (no generic openers)
2. Story or data-backed insight (3–5 short paragraphs)
3. Practical takeaway readers can apply today
4. Engagement question at the end
5. 3 strategic hashtags

Word count: 150–250 words`,
    placeholders: ['[Insert industry]', '[Insert the story or insight]', '[Job title or professional type]', '[Build followers / Generate leads / Drive traffic / Spark discussion]', '[Professional / Conversational / Vulnerable / Bold]'],
  },
  {
    promptId: 'MKT_005', category: 'Marketing & Social Media', subcategory: 'Email Marketing',
    title: '7-Email Nurture Sequence Builder',
    difficulty: 'intermediate', estimatedTime: '20 min',
    tags: ['email', 'nurture', 'automation', 'leads'],
    description: 'Build a complete 7-email welcome and nurture sequence for new subscribers.',
    promptText: `Hello ChatGPT,
Create a 7-email nurture sequence for new subscribers to my list.

● Business Type: [Insert business type]
● Lead Magnet They Downloaded: [Insert lead magnet name/description]
● Ultimate Goal of Sequence: [Purchase product / Book call / Join community / Upgrade]
● Brand Voice: [Insert 3 adjectives describing your tone]
● Primary Pain Point of Audience: [Insert main problem you solve]

For each of the 7 emails, provide:
- Email number and send timing (Day 1, Day 3, etc.)
- Subject line (with 2 alternatives)
- Preview text
- Full email body
- Primary CTA

Ensure progression: Welcome → Value → Story → Objection handling → Offer → Urgency → Final`,
    placeholders: ['[Insert business type]', '[Insert lead magnet name/description]', '[Purchase product / Book call / Join community / Upgrade]', '[Insert 3 adjectives]', '[Insert main problem you solve]'],
  },

  // SEO
  {
    promptId: 'SEO_001', category: 'SEO Optimization', subcategory: 'Keyword Research',
    title: 'Keyword Cluster Builder for a Niche Topic',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['seo', 'keywords', 'content-strategy', 'clustering'],
    description: 'Generate a comprehensive keyword cluster with search intent mapping.',
    promptText: `Hello ChatGPT,
Build a keyword cluster for my target topic to guide my content strategy.

● Main Topic/Seed Keyword: [Insert main keyword]
● Industry/Niche: [Insert niche]
● Target Location: [Global / Country / City]
● Content Goal: [Rank on Google / Drive traffic / Build authority]
● Competitor I Want to Beat: [Insert competitor URL or name]

Generate:
1. 5 pillar keywords (high-volume, broad intent)
2. 20 cluster keywords grouped by search intent:
   - Informational (seeking knowledge)
   - Commercial (comparing options)
   - Transactional (ready to buy)
   - Navigational (looking for specific brand)
3. 5 featured snippet opportunities
4. 3 "People Also Ask" question angles
5. Content calendar recommendation (which to target first and why)`,
    placeholders: ['[Insert main keyword]', '[Insert niche]', '[Global / Country / City]', '[Rank on Google / Drive traffic / Build authority]', '[Insert competitor URL or name]'],
  },
  {
    promptId: 'SEO_002', category: 'SEO Optimization', subcategory: 'On-Page SEO',
    title: 'SEO-Optimized Blog Post Outline Creator',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['seo', 'blog', 'content', 'on-page'],
    description: 'Create a fully optimized blog post outline designed to rank on page 1.',
    promptText: `Hello ChatGPT,
Create an SEO-optimized blog post outline designed to rank for my target keyword.

● Target Keyword: [Insert keyword]
● Secondary Keywords: [Insert 3–5 related keywords]
● Search Intent: [Informational / Commercial / Transactional]
● Target Word Count: [1000 / 1500 / 2000 / 3000 words]
● Competitor Articles to Beat: [Paste URLs or describe what's ranking]

Provide:
1. SEO-optimized H1 title (include keyword naturally)
2. Meta description (155 characters, include keyword, has CTA)
3. Full outline with H2s and H3s
4. Recommended internal link anchors
5. External authority sources to cite
6. FAQ section with 5 questions (targets featured snippets)
7. Image alt text suggestions`,
    placeholders: ['[Insert keyword]', '[Insert 3–5 related keywords]', '[Informational / Commercial / Transactional]', '[1000 / 1500 / 2000 / 3000 words]', '[Paste URLs or describe what\'s ranking]'],
  },
  {
    promptId: 'SEO_003', category: 'SEO Optimization', subcategory: 'Backlink Outreach',
    title: 'Guest Post Outreach Email Sequence',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['seo', 'backlinks', 'outreach', 'email'],
    description: 'Generate personalised guest post outreach emails that get responses.',
    promptText: `Hello ChatGPT,
Write a guest post outreach email sequence that will get accepted.

● My Website/Brand: [Insert your website and niche]
● Target Blog/Publication: [Insert target website and why it fits]
● My Expertise: [Insert your credentials or content track record]
● Proposed Topic Ideas: [List 2–3 topic pitches with brief rationale]
● What I Offer in Return: [Social share, link back, exclusive content, etc.]

Create:
1. Initial outreach email (short, personalised, low-ask)
2. Follow-up email if no response after 5 days
3. Final follow-up (create urgency without being pushy)

Each email: Subject line + full body. Tone should feel human and researched, not templated.`,
    placeholders: ['[Insert your website and niche]', '[Insert target website and why it fits]', '[Insert your credentials]', '[List 2–3 topic pitches]', '[Social share / link back / exclusive content]'],
  },

  // Content Creation
  {
    promptId: 'CNT_001', category: 'Content Creation & Copywriting', subcategory: 'Blog Writing',
    title: 'Full Blog Post Writer (Any Length)',
    difficulty: 'beginner', estimatedTime: '12 min',
    tags: ['blog', 'content', 'writing', 'copywriting'],
    description: 'Generate a complete, well-structured blog post on any topic.',
    promptText: `Hello ChatGPT,
Write a complete, engaging blog post on my specified topic.

● Blog Post Title: [Insert title]
● Target Keyword: [Insert keyword]
● Target Word Count: [Insert number]
● Audience Level: [Beginner / Intermediate / Expert]
● Blog Tone: [Educational / Entertaining / Inspirational / Contrarian]
● Must Include: [Statistics, quotes, examples, case studies — specify]
● Internal Link Anchors: [Topics to link to internally]

Write the full post including:
- Hook introduction that earns the click
- Clearly structured body with H2/H3 headers
- Real-world examples or analogies
- Actionable takeaways in each section
- Conclusion with clear CTA
- SEO-friendly throughout (keyword used naturally 4–6 times)`,
    placeholders: ['[Insert title]', '[Insert keyword]', '[Insert number]', '[Beginner / Intermediate / Expert]', '[Educational / Entertaining / Inspirational / Contrarian]'],
  },
  {
    promptId: 'CNT_002', category: 'Content Creation & Copywriting', subcategory: 'Copywriting',
    title: 'Sales Page Copy — Full Structure',
    difficulty: 'advanced', estimatedTime: '25 min',
    tags: ['sales', 'landing-page', 'conversion', 'copywriting'],
    description: 'Create a complete high-converting sales page using proven direct-response frameworks.',
    promptText: `Hello ChatGPT,
Write a complete sales page for my product/service using direct-response copywriting principles.

● Product/Service Name: [Insert name]
● Price Point: [Insert price]
● Target Customer: [Describe in detail — demographics + psychographics]
● Core Problem Solved: [Insert the #1 problem your product solves]
● Unique Mechanism: [What makes your solution different from alternatives?]
● Key Benefits (not features): [List 5–7 transformation outcomes]
● Social Proof Available: [Testimonials, case studies, reviews, media mentions]
● Offer Details: [What's included, bonuses, guarantee]
● Scarcity/Urgency (if any): [Limited spots, deadline, exclusive bonus]

Write in order:
1. Headline + subheadline (problem-focused)
2. Opening hook (agitate the pain)
3. Story/identification section
4. Solution introduction
5. Feature → Benefit breakdown (with bullet list)
6. Social proof section
7. Offer stack breakdown
8. Price anchoring + reveal
9. Guarantee section
10. Final CTA with urgency`,
    placeholders: ['[Insert name]', '[Insert price]', '[Describe in detail]', '[Insert the #1 problem]', '[What makes your solution different?]', '[List 5–7 transformation outcomes]'],
    pluginsNeeded: [],
  },
  {
    promptId: 'CNT_003', category: 'Content Creation & Copywriting', subcategory: 'Social Media',
    title: '30-Day Social Media Content Calendar',
    difficulty: 'intermediate', estimatedTime: '20 min',
    tags: ['content-calendar', 'social-media', 'planning', 'batch-content'],
    description: 'Generate a full month of social media content ideas across platforms.',
    promptText: `Hello ChatGPT,
Create a 30-day social media content calendar for my brand.

● Brand/Business Name: [Insert name]
● Industry/Niche: [Insert industry]
● Platforms: [Instagram / LinkedIn / TikTok / Twitter / Facebook — specify which]
● Content Pillars: [List 4–5 themes e.g., Education, Behind-the-scenes, Promotion, Inspiration]
● Posting Frequency: [X posts per day/week per platform]
● Current Business Goal: [Brand awareness / Lead generation / Sales / Community building]

For each of 30 days provide:
- Day number and date slot
- Platform(s)
- Content type (Reel / Carousel / Static / Story / Text post)
- Topic and angle
- Caption hook (first line)
- CTA
- Hashtag strategy note`,
    placeholders: ['[Insert name]', '[Insert industry]', '[Specify platforms]', '[List 4–5 themes]', '[X posts per day/week]', '[Brand awareness / Lead generation / Sales / Community building]'],
  },

  // Coding
  {
    promptId: 'CODE_001', category: 'Coding & Development', subcategory: 'Code Generation',
    title: 'Full-Stack Feature Builder',
    difficulty: 'advanced', estimatedTime: '20 min',
    tags: ['code', 'fullstack', 'feature', 'development'],
    description: 'Generate complete frontend and backend code for any feature with documentation.',
    promptText: `Hello ChatGPT,
Build a complete full-stack feature for my application.

● Feature Name: [Insert feature name]
● Tech Stack Frontend: [React / Vue / Next.js / Vanilla JS]
● Tech Stack Backend: [Node.js / Python / Laravel / Django]
● Database: [MongoDB / PostgreSQL / MySQL / SQLite]
● Feature Description: [Detailed description of what it should do]
● User Flow: [Step-by-step how a user interacts with this feature]
● API Endpoints Needed: [List them if known]

Provide:
1. Database schema/model
2. All API routes with request/response examples
3. Frontend component(s) with full code
4. State management approach
5. Error handling
6. Code comments throughout
7. Testing approach (unit test examples)`,
    placeholders: ['[Insert feature name]', '[React / Vue / Next.js / Vanilla JS]', '[Node.js / Python / Laravel / Django]', '[MongoDB / PostgreSQL / MySQL / SQLite]', '[Detailed description]', '[Step-by-step user flow]'],
  },
  {
    promptId: 'CODE_002', category: 'Coding & Development', subcategory: 'Code Review',
    title: 'Code Review & Refactoring Expert',
    difficulty: 'intermediate', estimatedTime: '10 min',
    tags: ['code-review', 'refactoring', 'best-practices', 'debugging'],
    description: 'Get an expert code review with specific improvement recommendations.',
    promptText: `Hello ChatGPT,
Review my code and provide expert-level feedback and refactored version.

● Programming Language: [Insert language]
● Code Purpose: [What does this code do?]
● Main Concerns: [Performance / Security / Readability / Scalability — specify]
● Experience Level: [Junior / Mid / Senior — helps calibrate feedback depth]

[PASTE YOUR CODE HERE]

Review for:
1. Bugs and logical errors
2. Security vulnerabilities
3. Performance bottlenecks
4. Code readability and naming conventions
5. SOLID principles adherence (if OOP)
6. Missing error handling
7. Test coverage gaps

Then provide:
- Refactored version with inline comments explaining each change
- Priority list: Critical fixes → Recommended improvements → Nice-to-haves`,
    placeholders: ['[Insert language]', '[What does this code do?]', '[Performance / Security / Readability / Scalability]', '[Junior / Mid / Senior]', '[PASTE YOUR CODE HERE]'],
  },

  // Data Analysis
  {
    promptId: 'DATA_001', category: 'Data Analysis', subcategory: 'Business Intelligence',
    title: 'Business Data Analysis & Executive Summary',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['data', 'analysis', 'reporting', 'business-intelligence'],
    description: 'Analyse business data and generate actionable executive-level insights.',
    promptText: `Hello ChatGPT,
Analyse the following business data and produce an executive summary with actionable recommendations.

● Data Type: [Sales / Marketing / Operations / Financial / Customer — specify]
● Time Period: [Insert date range]
● Business Context: [What decisions are being made based on this data?]
● Metrics That Matter Most: [List 3–5 KPIs]
● Known Issues or Hypotheses: [Any context you already have]

[PASTE YOUR DATA HERE — table, CSV, or description]

Analyse and provide:
1. Key findings (top 5 insights)
2. Anomalies or red flags
3. Trend identification (positive + negative)
4. Root cause hypotheses for any notable changes
5. 3 specific recommended actions (with expected impact)
6. Suggested follow-up data to gather
7. Executive summary (under 150 words — board-ready)`,
    placeholders: ['[Sales / Marketing / Operations / Financial / Customer]', '[Insert date range]', '[What decisions are being made?]', '[List 3–5 KPIs]', '[PASTE YOUR DATA HERE]'],
  },

  // Online Course Creation
  {
    promptId: 'CRSE_001', category: 'Online Course Creation', subcategory: 'Course Design',
    title: 'Full Online Course Curriculum Designer',
    difficulty: 'intermediate', estimatedTime: '20 min',
    tags: ['course', 'curriculum', 'online-education', 'udemy'],
    description: 'Design a complete online course structure from concept to launch plan.',
    promptText: `Hello ChatGPT,
Design a complete online course curriculum for my expertise topic.

● Course Topic: [Insert topic]
● Target Student: [Who is this for? Their starting point and goal]
● Course Outcome: [What can students DO after completing this course?]
● Ideal Course Length: [X hours of video content]
● Platform: [Udemy / Teachable / Kajabi / Podia / Own site]
● Your Unique Angle: [What makes YOUR course different from others on this topic?]
● Price Point: [Insert target price]

Create:
1. Course title (with keyword research note)
2. Course description (marketing copy)
3. Full module list (8–12 modules)
4. For each module: learning objective + 4–6 lesson titles
5. Capstone project idea
6. Bonus content suggestions
7. Launch strategy (3 phases: pre-launch, launch, post-launch)`,
    placeholders: ['[Insert topic]', '[Who is this for?]', '[What can students DO?]', '[X hours]', '[Platform]', '[What makes YOUR course different?]', '[Insert target price]'],
  },

  // Sales
  {
    promptId: 'SALES_001', category: 'Sales & Persuasion', subcategory: 'Cold Outreach',
    title: 'Cold Email Sequence — B2B Outreach',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['sales', 'cold-email', 'b2b', 'outreach', 'lead-generation'],
    description: 'Create a personalized B2B cold email sequence that books meetings.',
    promptText: `Hello ChatGPT,
Write a B2B cold email sequence designed to book discovery calls.

● My Company/Role: [Insert your company and your role]
● Target Prospect: [Job title, company size, industry]
● Pain Point I Solve: [Insert the specific problem you solve]
● Social Proof: [Clients, results, case study — be specific]
● Ask (CTA): [15-minute call / Demo / Free audit / Proposal]
● Prospect's Likely Objection: [Time / Budget / Already have solution / Not a priority]

Write a 4-email sequence:
1. Day 0: Initial email — ultra short, personalization line + 1 pain + soft CTA
2. Day 3: Follow-up — add value (insight, relevant stat, or resource)
3. Day 7: Follow-up — social proof + reframe the ask
4. Day 14: Breakup email — creates FOMO, keeps door open

Each email: Subject line + full body (under 150 words each)`,
    placeholders: ['[Insert your company and role]', '[Job title, company size, industry]', '[Insert the specific problem you solve]', '[Clients, results, case study]', '[15-minute call / Demo / Free audit]', '[Time / Budget / Already have solution / Not a priority]'],
  },

  // HR & Recruitment
  {
    promptId: 'HR_001', category: 'HR & Recruitment', subcategory: 'Job Descriptions',
    title: 'Magnetic Job Description Writer',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['hr', 'recruitment', 'hiring', 'job-description'],
    description: 'Write compelling job descriptions that attract top talent.',
    promptText: `Hello ChatGPT,
Write a compelling job description that attracts top-tier candidates.

● Job Title: [Insert exact title]
● Company: [Insert company name and brief description]
● Team/Department: [Insert team context]
● Key Responsibilities: [List 5–8 core duties]
● Required Skills: [Must-have technical and soft skills]
● Preferred Skills: [Nice-to-have additions]
● Salary Range: [Insert range or "competitive"]
● Remote/Hybrid/On-site: [Specify]
● Unique Company Perks: [What makes working here special?]

Write a JD that:
1. Opens with an exciting vision, not boilerplate
2. Sells the role before listing requirements
3. Uses inclusive language (remove gendered terms)
4. Lists responsibilities with impact context
5. Structures requirements as "Required" vs "Bonus"
6. Ends with a compelling application CTA`,
    placeholders: ['[Insert exact title]', '[Insert company name]', '[Insert team context]', '[List 5–8 core duties]', '[Must-have skills]', '[Nice-to-have skills]', '[Insert salary range]'],
  },

  // Project Management
  {
    promptId: 'PM_001', category: 'Project Management', subcategory: 'Planning',
    title: 'Complete Project Plan Generator',
    difficulty: 'intermediate', estimatedTime: '18 min',
    tags: ['project-management', 'planning', 'agile', 'sprints'],
    description: 'Generate a detailed project plan with milestones, risks, and resource allocation.',
    promptText: `Hello ChatGPT,
Create a comprehensive project plan for my upcoming project.

● Project Name: [Insert name]
● Project Goal: [1-sentence outcome statement]
● Timeline: [Start date → End date]
● Budget: [Insert budget or "TBD"]
● Team Size & Roles: [List team members and their roles]
● Key Stakeholders: [Who has decision-making authority?]
● Known Constraints: [Budget caps, regulatory, technical limitations]
● Methodology Preference: [Agile / Waterfall / Hybrid]

Generate:
1. Project charter (one-pager)
2. Phase breakdown with milestones and deliverables
3. Sprint plan (if Agile) or Gantt summary (if Waterfall)
4. Risk register: 5 risks with probability, impact, and mitigation
5. RACI matrix for key decisions
6. Definition of Done for each major deliverable
7. Communication plan (who gets what update, how often)`,
    placeholders: ['[Insert name]', '[1-sentence outcome statement]', '[Start date → End date]', '[Insert budget]', '[List team members and roles]', '[Who has decision-making authority?]', '[Agile / Waterfall / Hybrid]'],
  },

  // Health & Fitness
  {
    promptId: 'HLT_001', category: 'Health & Fitness', subcategory: 'Training Plans',
    title: 'Personalised 12-Week Fitness Program',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['fitness', 'health', 'workout', 'training'],
    description: 'Create a customised 12-week fitness program with progressive overload.',
    promptText: `Hello ChatGPT,
Create a personalised 12-week fitness program for my specific goals.

● Current Fitness Level: [Beginner / Intermediate / Advanced]
● Primary Goal: [Fat loss / Muscle gain / Strength / Endurance / Athletic performance]
● Available Equipment: [Gym / Home gym / Resistance bands / No equipment / Full gym]
● Days Available Per Week: [Insert number of training days]
● Session Duration: [30 / 45 / 60 / 90 minutes]
● Any Injuries or Limitations: [Insert or "None"]
● Age & Gender: [Insert]
● Current Stats (optional): [Weight, height, any relevant baselines]

Create:
1. Programme overview and philosophy
2. Weekly schedule (which muscle groups / types on which days)
3. Weeks 1–4 workout plan (full exercises, sets, reps, rest)
4. Weeks 5–8 progression (increased intensity)
5. Weeks 9–12 peak phase
6. Nutrition principles (macros guide)
7. Progress tracking metrics`,
    placeholders: ['[Beginner / Intermediate / Advanced]', '[Fat loss / Muscle gain / Strength / Endurance]', '[Gym / Home gym / No equipment]', '[Number of training days]', '[30 / 45 / 60 / 90 minutes]', '[Insert or "None"]'],
  },

  // Prompt Engineering itself
  {
    promptId: 'PE_001', category: 'Prompt Engineering', subcategory: 'Meta-Prompting',
    title: 'Prompt Optimizer — Improve Any Prompt',
    difficulty: 'intermediate', estimatedTime: '8 min',
    tags: ['meta-prompt', 'optimization', 'prompt-engineering'],
    description: 'Analyse and improve any existing prompt for better AI output quality.',
    promptText: `Hello ChatGPT,
You are a world-class prompt engineer. Analyse and dramatically improve the prompt I provide.

My original prompt: [PASTE YOUR PROMPT HERE]

My use case: [Describe what you're trying to accomplish]
My target AI tool: [ChatGPT / Claude / Gemini / Copilot]
Current issues with my output: [Too vague / Wrong format / Missing details / Inconsistent / Other]

For the improved prompt, provide:
1. Diagnosis: What's wrong with the original prompt?
2. The rewritten, improved prompt (ready to paste and use)
3. Explanation of what changed and why
4. 2 alternative versions (different angles/approaches)
5. Tips to further customise for edge cases`,
    placeholders: ['[PASTE YOUR PROMPT HERE]', '[Describe what you\'re trying to accomplish]', '[ChatGPT / Claude / Gemini / Copilot]', '[Too vague / Wrong format / Missing details / Inconsistent / Other]'],
  },
  {
    promptId: 'PE_002', category: 'Prompt Engineering', subcategory: 'System Prompts',
    title: 'Custom AI Assistant System Prompt Builder',
    difficulty: 'advanced', estimatedTime: '15 min',
    tags: ['system-prompt', 'custom-ai', 'assistant', 'configuration'],
    description: 'Build a powerful system prompt to configure ChatGPT as your personal expert assistant.',
    promptText: `Hello ChatGPT,
Build a detailed system prompt that transforms you into a specialised AI assistant.

● Assistant Role/Title: [e.g., "Senior Digital Marketing Strategist"]
● Primary Expertise Areas: [List 3–5 specific domains]
● My Business Context: [Describe your business, industry, goals]
● Communication Style Required: [Direct / Warm / Academic / Creative / Technical]
● Things This Assistant MUST Always Do: [List 4–5 mandatory behaviours]
● Things This Assistant Must NEVER Do: [List constraints]
● Output Format Preferences: [Bullet lists / Paragraphs / Tables / Code blocks]
● Response Length Default: [Concise <100 words / Medium / Detailed >500 words]

Create:
1. The complete system prompt (ready to paste into ChatGPT's custom instructions)
2. An "activation test" — 3 questions to verify the assistant is working correctly
3. Suggested follow-up customisations`,
    placeholders: ['[e.g., "Senior Digital Marketing Strategist"]', '[List 3–5 specific domains]', '[Describe your business]', '[Direct / Warm / Academic / Creative / Technical]', '[List mandatory behaviours]', '[List constraints]'],
  },

  // eCommerce
  {
    promptId: 'ECOM_001', category: 'eCommerce & Customer Support', subcategory: 'Product Listings',
    title: 'Shopify/Amazon Product Listing Optimizer',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['ecommerce', 'shopify', 'amazon', 'product-listing', 'conversion'],
    description: 'Create high-converting product titles, descriptions, and bullet points.',
    promptText: `Hello ChatGPT,
Optimise my product listing for maximum conversions and search visibility.

● Platform: [Shopify / Amazon / Etsy / WooCommerce / Other]
● Product Name: [Insert product name]
● Product Category: [Insert category]
● Key Features: [List 5–8 features of your product]
● Target Customer: [Describe who buys this]
● Main Competitor Listings: [Paste URLs or describe what they say]
● Price Point: [Insert price]
● Unique Selling Points: [What makes yours better?]

Generate:
1. SEO-optimised product title (with keyword placement)
2. 5 bullet points (benefit-first, feature second)
3. Full product description (storytelling format, 200–300 words)
4. Backend search terms / tags
5. FAQ section (5 Q&As for common objections)
6. Image caption suggestions`,
    placeholders: ['[Shopify / Amazon / Etsy / WooCommerce / Other]', '[Insert product name]', '[Insert category]', '[List 5–8 features]', '[Describe who buys this]', '[Paste URLs or describe competitors]', '[Insert price]'],
  },

  // Travel
  {
    promptId: 'TRV_001', category: 'Travel & Lifestyle', subcategory: 'Trip Planning',
    title: 'Complete Travel Itinerary Planner',
    difficulty: 'beginner', estimatedTime: '8 min',
    tags: ['travel', 'itinerary', 'trip-planning', 'lifestyle'],
    description: 'Generate a detailed day-by-day travel itinerary customised to your preferences.',
    promptText: `Hello ChatGPT,
Create a detailed travel itinerary for my upcoming trip.

● Destination: [City/Country]
● Trip Duration: [X days]
● Travel Dates: [Insert dates — for seasonal context]
● Traveller Type: [Solo / Couple / Family / Group]
● Budget Level: [Budget / Mid-range / Luxury]
● Interests: [History / Food / Adventure / Art / Nature / Nightlife — specify]
● Accommodation Area Preference: [Central / Neighbourhood / Flexible]
● Must-See/Do Items: [Any non-negotiables]
● Avoid: [Anything to exclude]

Create:
1. Pre-trip checklist (documents, bookings, packing essentials)
2. Day-by-day itinerary (morning / afternoon / evening)
3. Restaurant recommendations per day (with cuisine type and price range)
4. Local transport tips
5. Hidden gems and off-the-beaten-path suggestions
6. Budget breakdown estimate
7. Emergency/useful contacts for the destination`,
    placeholders: ['[City/Country]', '[X days]', '[Insert dates]', '[Solo / Couple / Family / Group]', '[Budget / Mid-range / Luxury]', '[Specify interests]', '[Central / Neighbourhood / Flexible]'],
  },

  // Web Design
  {
    promptId: 'WEB_001', category: 'Web Design & UX', subcategory: 'Landing Pages',
    title: 'High-Converting Landing Page Structure',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['web-design', 'landing-page', 'ux', 'conversion-rate'],
    description: 'Design a complete landing page wireframe and copy structure.',
    promptText: `Hello ChatGPT,
Design a complete high-converting landing page for my product/service.

● Product/Service: [Insert name and description]
● Target Visitor: [Who lands on this page and from where?]
● Primary CTA Goal: [Sign up / Purchase / Book call / Download]
● Current Conversion Rate (if known): [Insert % or "unknown"]
● Biggest Objection to Convert: [Price / Trust / Complexity / Urgency]
● Proof Available: [Testimonials / Case studies / Statistics / Press / Certifications]
● Colour Brand: [Insert hex codes or describe brand colours]

Provide:
1. Above-the-fold section (hero) — headline, subheadline, CTA button text
2. Social proof bar (logos, stats)
3. Problem statement section
4. Solution/features section with copy for 3–4 key features
5. Benefits list (6 bullet points)
6. Testimonial section layout and content
7. Pricing section copy
8. Final CTA section with urgency
9. Footer trust elements
10. Recommended A/B tests to run first`,
    placeholders: ['[Insert name and description]', '[Who lands on this page?]', '[Sign up / Purchase / Book call / Download]', '[Current conversion rate]', '[Price / Trust / Complexity / Urgency]', '[Testimonials / Case studies / Statistics]'],
  },

  // Language Learning
  {
    promptId: 'LANG_001', category: 'Language Learning', subcategory: 'Practice',
    title: 'AI Language Tutor — Immersive Practice Session',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['language', 'learning', 'tutor', 'practice'],
    description: 'Set up an immersive language learning practice session with feedback.',
    promptText: `Hello ChatGPT,
Act as my personal language tutor for an immersive practice session.

● Language I'm Learning: [Insert language]
● My Current Level: [A1 / A2 / B1 / B2 / C1 — or describe your level]
● Native Language: [Insert your native language]
● Practice Goal Today: [Conversation / Grammar / Vocabulary / Reading / Writing]
● Specific Scenario: [Restaurant ordering / Job interview / Travel / Business meeting / Casual chat]
● Weak Areas: [What do you find hardest?]

Structure our session:
1. Warm-up (5 vocabulary words with pronunciation notes and memory tips)
2. Grammar focus (explain 1 concept relevant to the scenario with examples)
3. Dialogue practice (you play the other role in the scenario, I respond)
4. Correction log (track my errors as we practice, correct gently)
5. Summary: mistakes I made + how to improve each
6. Homework (3 exercises to practise before next session)`,
    placeholders: ['[Insert language]', '[A1 / A2 / B1 / B2 / C1]', '[Insert your native language]', '[Conversation / Grammar / Vocabulary / Reading / Writing]', '[Restaurant ordering / Job interview / Travel / Business meeting]', '[What do you find hardest?]'],
  },

  // Logistics
  {
    promptId: 'LOG_001', category: 'Logistics & Supply Chain', subcategory: 'Optimization',
    title: 'Supply Chain Optimization Analysis',
    difficulty: 'advanced', estimatedTime: '20 min',
    tags: ['logistics', 'supply-chain', 'operations', 'optimization'],
    description: 'Analyse and optimise supply chain processes with AI-driven recommendations.',
    promptText: `Hello ChatGPT,
Analyse my supply chain and identify optimisation opportunities.

● Industry/Product Type: [Insert industry and product category]
● Current Supply Chain Overview: [Suppliers → Manufacturing → Warehousing → Distribution → Customer]
● Key Metrics (if known): [Lead times, inventory turnover, fill rate, freight costs]
● Biggest Current Problem: [Delays / Cost overruns / Stockouts / Supplier reliability / Returns]
● Scale: [SME / Mid-market / Enterprise]
● Technology Currently Used: [ERP system, WMS, TMS — or "manual/spreadsheets"]
● Budget for Improvement: [Low / Medium / High]

Analyse and provide:
1. Bottleneck identification in the described chain
2. Top 5 inefficiencies and their estimated cost impact
3. Quick wins (implementable within 30 days)
4. Strategic improvements (3–6 months)
5. Technology recommendations (tools, software)
6. KPI dashboard design (metrics to track improvement)
7. Implementation priority matrix`,
    placeholders: ['[Insert industry and product category]', '[Supply chain overview]', '[Lead times, inventory turnover, etc.]', '[Delays / Cost overruns / Stockouts]', '[SME / Mid-market / Enterprise]', '[ERP system, WMS, TMS — or manual]', '[Low / Medium / High]'],
  },

  // === Additional Marketing & Social Media Prompts ===
  {
    promptId: 'MKT_006', category: 'Marketing & Social Media', subcategory: 'Instagram',
    title: 'Instagram Carousel Content Creator',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['instagram', 'carousel', 'content', 'social-media'],
    description: 'Create an engaging Instagram carousel post with a compelling narrative arc.',
    promptText: `Hello ChatGPT,
Create a high-engagement Instagram carousel post.

● Topic/Theme: [Insert topic]
● Target Audience: [Insert target audience]
● Carousel Goal: [Educate / Entertain / Inspire / Sell]
● Brand Voice: [Insert 3 adjectives]
● Number of Slides: [5 / 7 / 10]

For each slide provide:
1. Slide headline (bold, max 8 words)
2. Key message (2-3 sentences)
3. Visual description
4. CTA for final slide`,
    placeholders: ['[Insert topic]', '[Insert target audience]', '[Educate / Entertain / Inspire / Sell]', '[Insert 3 adjectives]', '[5 / 7 / 10]'],
  },
  {
    promptId: 'MKT_007', category: 'Marketing & Social Media', subcategory: 'Pinterest',
    title: 'Pinterest Pin Design & SEO Strategy',
    difficulty: 'beginner', estimatedTime: '8 min',
    tags: ['pinterest', 'seo', 'pins', 'traffic'],
    description: 'Generate Pinterest pin ideas with SEO-optimized titles and descriptions.',
    promptText: `Hello ChatGPT,
Create a Pinterest pin strategy to drive traffic to my content.

● Blog/Product Title: [Insert title]
● Target Keyword: [Insert main keyword]
● Pin Type: [Infographic / Quote / Step-by-step / List / Video]
● Brand Aesthetic: [Describe visual style]

Provide:
1. 5 pin title variations with keywords
2. SEO-optimized descriptions for each
3. Hashtag recommendations
4. Text overlay ideas for each pin design`,
    placeholders: ['[Insert title]', '[Insert main keyword]', '[Infographic / Quote / Step-by-step / List / Video]', '[Describe visual style]'],
  },
  {
    promptId: 'MKT_008', category: 'Marketing & Social Media', subcategory: 'YouTube',
    title: 'YouTube Video Description & Tags Generator',
    difficulty: 'beginner', estimatedTime: '8 min',
    tags: ['youtube', 'seo', 'description', 'tags', 'video'],
    description: 'Generate SEO-optimized YouTube descriptions, timestamps, and tags.',
    promptText: `Hello ChatGPT,
Write a complete YouTube video description for my next video.

● Video Title: [Insert title]
● Target Keyword: [Insert keyword]
● Video Length: [X minutes]
● Main Points Covered: [List 3-5 key points]

Generate:
1. Description (200+ words with keyword placement)
2. Timestamp chapters
3. 15-20 relevant tags
4. Social media links CTA
5. Recommended next video link`,
    placeholders: ['[Insert title]', '[Insert keyword]', '[X minutes]', '[List 3-5 key points]'],
  },
  {
    promptId: 'MKT_009', category: 'Marketing & Social Media', subcategory: 'Twitter/X',
    title: 'Twitter/X Thread Builder',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['twitter', 'thread', 'viral', 'engagement'],
    description: 'Create an engaging Twitter/X thread that drives engagement and followers.',
    promptText: `Hello ChatGPT,
Write a Twitter/X thread on my chosen topic.

● Thread Topic: [Insert topic]
● Target Audience: [Who are you writing for?]
● Goal: [Educate / Entertain / Build authority / Drive traffic]
● Estimated Tweets: [10 / 15 / 20]
● Brand Voice: [Insert 3 adjectives]
● Hook Style: [Question / Statistic / Story / Controversial take]

Provide:
1. Hook tweet (scroll-stopping, under 240 chars)
2. Full thread with each tweet numbered
3. Engagement CTA tweet in the middle
4. Final tweet with link/CTA and thread recap`,
    placeholders: ['[Insert topic]', '[Who are you writing for?]', '[Educate / Entertain / Build authority / Drive traffic]', '[10 / 15 / 20]', '[Insert 3 adjectives]'],
  },
  {
    promptId: 'MKT_010', category: 'Marketing & Social Media', subcategory: 'Google Ads',
    title: 'Google Ads Copy & Keyword Strategy',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['google-ads', 'ppc', 'keywords', 'paid-search'],
    description: 'Generate Google Ads copy and keyword strategy for high-converting campaigns.',
    promptText: `Hello ChatGPT,
Create a Google Ads campaign structure with ad copy.

● Product/Service: [Insert name]
● Target Keywords: [List 5-10 seed keywords]
● Budget: [Daily budget]
● Target Location: [Country / City / Radius]
● Campaign Goal: [Leads / Sales / Traffic / Brand awareness]

Provide:
1. Campaign structure (3-5 ad groups)
2. Keywords per ad group (10-15 each, match types)
3. 3 Responsive Search Ads per group
4. Negative keyword list
5. Extension suggestions`,
    placeholders: ['[Insert name]', '[List 5-10 seed keywords]', '[Daily budget]', '[Country / City / Radius]', '[Leads / Sales / Traffic / Brand awareness]'],
  },
  {
    promptId: 'MKT_011', category: 'Marketing & Social Media', subcategory: 'Influencer Marketing',
    title: 'Influencer Outreach & Collaboration Script',
    difficulty: 'intermediate', estimatedTime: '10 min',
    tags: ['influencer', 'outreach', 'collaboration', 'partnership'],
    description: 'Write personalized influencer outreach messages that get replies.',
    promptText: `Hello ChatGPT,
Write an influencer outreach message for a collaboration.

● My Brand: [Insert brand name and niche]
● Influencer Name: [Insert name]
● Influencer Niche: [Insert niche and follower count]
● Proposed Collaboration: [Sponsored post / Affiliate / Product gifting / Co-creation]
● Budget Range: [Insert or "flexible"]
● Why This Influencer: [What you admire about their content]

Generate:
1. Initial DM/email (short, personalized, low-pressure)
2. Follow-up message (if no reply in 5 days)
3. Collaboration brief outline`,
    placeholders: ['[Insert brand name and niche]', '[Insert name]', '[Insert niche and follower count]', '[Sponsored post / Affiliate / Product gifting / Co-creation]', '[Insert or "flexible"]', '[What you admire]'],
  },
  {
    promptId: 'MKT_012', category: 'Marketing & Social Media', subcategory: 'YouTube',
    title: 'YouTube Thumbnail Hook & Title Strategy',
    difficulty: 'beginner', estimatedTime: '8 min',
    tags: ['youtube', 'thumbnails', 'titles', 'ctr'],
    description: 'Generate click-through-rate optimized titles and thumbnail concepts.',
    promptText: `Hello ChatGPT,
Optimize my YouTube video title and thumbnail for maximum CTR.

● Video Topic: [Insert topic]
● Target Audience: [Insert audience]
● Current Working Title: [Insert current title]
● Style: [Tutorial / Vlog / Review / Educational / Entertainment]

Generate:
1. 10 title variations (use power words, numbers, curiosity gaps)
2. 5 thumbnail concepts (describe composition, text overlay, colours)
3. Best title recommendation with reasoning`,
    placeholders: ['[Insert topic]', '[Insert audience]', '[Insert current title]', '[Tutorial / Vlog / Review / Educational / Entertainment]'],
  },
  {
    promptId: 'MKT_013', category: 'Marketing & Social Media', subcategory: 'Content Repurposing',
    title: 'Content Repurposing Strategy Generator',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['content', 'repurposing', 'workflow', 'efficiency'],
    description: 'Turn one piece of content into 20+ assets across platforms.',
    promptText: `Hello ChatGPT,
Create a content repurposing strategy for my existing content.

● Original Content: [Blog post / Podcast / Video / Webinar]
● Title/Link: [Insert title or URL]
● Length: [Word count or duration]
● Main Topics Covered: [List 3-5 topics]
● Target Platforms: [LinkedIn / Twitter / Instagram / YouTube / TikTok / Newsletter]

Generate a repurposing plan:
1. 5 LinkedIn posts from key takeaways
2. 10-tweet thread
3. 3 Instagram carousel outlines
4. 1 YouTube short script
5. 1 newsletter edition outline
6. 1 podcast episode brief`,
    placeholders: ['[Blog post / Podcast / Video / Webinar]', '[Insert title or URL]', '[Word count or duration]', '[List 3-5 topics]', '[Specify platforms]'],
  },
  {
    promptId: 'MKT_014', category: 'Marketing & Social Media', subcategory: 'Analytics',
    title: 'Social Media Analytics Review & Strategy Pivot',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['analytics', 'reporting', 'social-media', 'strategy'],
    description: 'Analyse social media performance data and get strategic recommendations.',
    promptText: `Hello ChatGPT,
Analyse my social media analytics and recommend strategy changes.

● Platform: [Instagram / LinkedIn / TikTok / Twitter / Facebook]
● Time Period: [Last 30 / 60 / 90 days]
● Key Metrics: [Impressions, reach, engagement rate, clicks, follower growth, saves]
● Top 3 Performing Posts: [Describe or paste links]
● Bottom 3 Performing Posts: [Describe or paste links]

[PASTE YOUR DATA OR DESCRIBE PERFORMANCE]

Provide:
1. Top 3 insights from the data
2. What's working and why (pattern recognition)
3. What's not working and how to fix it
4. Content strategy adjustment recommendations
5. Posting schedule optimization`,
    placeholders: ['[Instagram / LinkedIn / TikTok / Twitter / Facebook]', '[Last 30 / 60 / 90 days]', '[List metrics]', '[Describe top/bottom posts]', '[PASTE YOUR DATA]'],
  },
  {
    promptId: 'MKT_015', category: 'Marketing & Social Media', subcategory: 'Hashtag Strategy',
    title: 'Hashtag Research & Strategy Builder',
    difficulty: 'beginner', estimatedTime: '8 min',
    tags: ['hashtags', 'reach', 'discovery', 'social-media'],
    description: 'Build a data-driven hashtag strategy for maximum reach.',
    promptText: `Hello ChatGPT,
Build a hashtag strategy for my content on [platform].

● Platform: [Instagram / TikTok / LinkedIn / Twitter]
● Topic/Niche: [Insert topic]
● Account Size: [Small <1K / Medium 1-10K / Large 10K+]
● Content Type: [Reel / Carousel / Static / Video / Text]

Generate:
1. 30 hashtags grouped: 10 broad (500K+), 10 medium (50-500K), 10 niche (1-50K)
2. Hashtag strategy: how many, where to place them
3. 5 branded hashtag suggestions
4. Tracking method to measure hashtag performance`,
    placeholders: ['[Instagram / TikTok / LinkedIn / Twitter]', '[Insert topic]', '[Small / Medium / Large]', '[Reel / Carousel / Static / Video / Text]'],
  },

  // === Additional SEO Prompts ===
  {
    promptId: 'SEO_004', category: 'SEO Optimization', subcategory: 'Technical SEO',
    title: 'Technical SEO Audit & Action Plan',
    difficulty: 'advanced', estimatedTime: '20 min',
    tags: ['technical-seo', 'audit', 'site-health', 'crawl'],
    description: 'Get a comprehensive technical SEO audit with prioritized fixes.',
    promptText: `Hello ChatGPT,
Conduct a technical SEO audit for my website.

● Website URL: [Insert URL]
● Current Issues Known: [Slow loading / Crawl errors / Duplicate content / Mobile issues / None]
● CMS: [WordPress / Shopify / Webflow / Custom / Other]
● Pages Indexed: [Approximate number]
● Target Location: [Global / Specific country]

Audit and provide recommendations for:
1. Crawlability and indexability
2. Site speed optimization (Core Web Vitals)
3. Mobile usability
4. URL structure
5. Internal linking
6. Structured data / schema markup
7. Duplicate content
8. XML sitemap and robots.txt
9. HTTPS and security
10. Priority action list (quick wins first)`,
    placeholders: ['[Insert URL]', '[List known issues]', '[WordPress / Shopify / Webflow / Custom]', '[Approximate number]', '[Global / Specific country]'],
  },
  {
    promptId: 'SEO_005', category: 'SEO Optimization', subcategory: 'Local SEO',
    title: 'Local SEO Optimization Plan',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['local-seo', 'google-business', 'maps', 'nearby'],
    description: 'Optimize your business for local search and Google Maps rankings.',
    promptText: `Hello ChatGPT,
Create a local SEO optimization plan for my business.

● Business Name: [Insert name]
● Business Category: [Insert category]
● Location: [City, State]
● Website: [Insert URL]
● Competitors: [List 2-3 local competitors]
● Current Google Business Profile: [Claimed and verified / Not claimed / Needs optimization]

Provide:
1. Google Business Profile optimization checklist
2. Local keyword strategy (with geo-modifiers)
3. Citation building opportunities
4. Review generation strategy
5. Local content ideas
6. Competitor gap analysis`,
    placeholders: ['[Insert name]', '[Insert category]', '[City, State]', '[Insert URL]', '[List 2-3 competitors]', '[Claimed / Not claimed / Needs optimization]'],
  },
  {
    promptId: 'SEO_006', category: 'SEO Optimization', subcategory: 'Content Strategy',
    title: 'Topic Cluster & Pillar Page Strategy',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['topic-cluster', 'pillar-page', 'content-strategy', 'seo'],
    description: 'Build a topic cluster strategy with pillar pages and supporting content.',
    promptText: `Hello ChatGPT,
Create a topic cluster strategy for my website.

● Primary Niche: [Insert niche]
● Main Website Topic: [Describe what your site is about]
● Current Content Count: [Number of published articles]
● Target Keywords: [List 3-5 high-level topics]
● Competitor Domain Authority: [If known]

Provide:
1. 5 pillar page topics with outlines
2. 20+ cluster content topics (4-5 per pillar)
3. Internal linking structure between pillar and cluster pages
4. Suggested URL hierarchy
5. Content calendar (publish order for maximum SEO impact)`,
    placeholders: ['[Insert niche]', '[Describe your site]', '[Number of articles]', '[List 3-5 high-level topics]', '[Competitor DA]'],
  },
  {
    promptId: 'SEO_007', category: 'SEO Optimization', subcategory: 'Link Building',
    title: 'Skyscraper Technique Outreach Script',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['link-building', 'skyscraper', 'outreach', 'backlinks'],
    description: 'Execute the Skyscraper technique with personalized outreach templates.',
    promptText: `Hello ChatGPT,
I want to execute the Skyscraper Technique for link building.

● My Content URL: [Insert URL]
● My Content Topic: [Insert topic]
● Target Content to Beat: [Insert competitor URL doing worse]
● Why My Content Is Better: [More comprehensive / More recent / Better designed / More data]
● Target Sites to Reach Out To: [Describe the type of sites that linked to competitor content]

Generate:
1. Comparison summary (why my content deserves the link)
2. Cold email template to each target site type
3. Follow-up sequence (3 emails)
4. Tracking spreadsheet structure`,
    placeholders: ['[Insert URL]', '[Insert topic]', '[Insert competitor URL]', '[Why yours is better]', '[Describe target sites]'],
  },
  {
    promptId: 'SEO_008', category: 'SEO Optimization', subcategory: 'SERP Analysis',
    title: 'Search Intent Analysis & Content Gap Finder',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['search-intent', 'content-gap', 'serp-analysis', 'strategy'],
    description: 'Analyse search intent and identify content gaps in your niche.',
    promptText: `Hello ChatGPT,
Analyse the search intent and content gaps for my target keyword.

● Target Keyword: [Insert keyword]
● Current SERP Analysis: [Paste top 10 results or describe them]
● My Current Ranking: [Not ranking / Page X / Not applicable]

Analyse:
1. Dominant search intent (informational / commercial / transactional / navigational)
2. Content format that ranks best (listicle / guide / video / product page)
3. Content angle gaps (what's missing from top results)
4. Featured snippet opportunities
5. 5 content ideas that would fill identified gaps`,
    placeholders: ['[Insert keyword]', '[Describe top 10 results]', '[Not ranking / Page X / N/A]'],
  },
  {
    promptId: 'SEO_009', category: 'SEO Optimization', subcategory: 'Analytics',
    title: 'Google Search Console Data Analysis',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['search-console', 'analytics', 'performance', 'reporting'],
    description: 'Analyse Search Console data to find opportunities and fix issues.',
    promptText: `Hello ChatGPT,
Analyse my Google Search Console data and find opportunities.

● Domain: [Insert domain]
● Time Period: [Last 3 / 6 / 12 months]
● Total Impressions: [Insert number]
● Total Clicks: [Insert number]
● Average CTR: [Insert %]
● Average Position: [Insert number]

[PASTE YOUR SEARCH CONSOLE DATA OR KEY METRICS]

Provide:
1. Top 5 opportunities (keywords with high impressions but low CTR)
2. Pages losing traffic and why
3. Keyword ranking movements analysis
4. Quick wins to improve CTR
5. Content gap opportunities`,
    placeholders: ['[Insert domain]', '[Last 3 / 6 / 12 months]', '[Insert metrics]', '[PASTE YOUR DATA]'],
  },
  {
    promptId: 'SEO_010', category: 'SEO Optimization', subcategory: 'E-E-A-T',
    title: 'E-E-A-T Optimization Checklist Generator',
    difficulty: 'advanced', estimatedTime: '15 min',
    tags: ['eeat', 'authority', 'trust', 'quality-rater'],
    description: 'Build a customized E-E-A-T optimization plan for YMYL content.',
    promptText: `Hello ChatGPT,
Create an E-E-A-T optimization checklist for my website.

● Website Type: [Blog / E-commerce / SaaS / News / Health / Finance]
● Is This YMYL Content: [Yes / No]
● Current E-E-A-T Signals: [Author bios / Citations / Reviews / Certifications / None]
● Main Content Topics: [List 3-5 topics]
● Industry: [Insert industry]

Provide:
1. Experience optimization (first-hand proof)
2. Expertise signals (credentials, portfolio, case studies)
3. Authoritativeness building (citations, mentions, PR)
4. Trustworthiness signals (reviews, guarantees, policies)
5. Content-specific E-E-A-T checklist
6. Priority action items ranked by impact`,
    placeholders: ['[Blog / E-commerce / SaaS / News / Health / Finance]', '[Yes / No]', '[List current signals]', '[List 3-5 topics]', '[Insert industry]'],
  },

  // === Additional Content Creation & Copywriting Prompts ===
  {
    promptId: 'CNT_004', category: 'Content Creation & Copywriting', subcategory: 'Newsletter',
    title: 'Email Newsletter Edition Creator',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['newsletter', 'email', 'content', 'audience'],
    description: 'Write a complete newsletter edition with subject line and body.',
    promptText: `Hello ChatGPT,
Write a complete newsletter edition for my subscribers.

● Newsletter Name: [Insert name]
● Topic/Theme This Week: [Insert topic]
● Audience: [Describe subscribers]
● Tone: [Casual / Professional / Humorous / Inspirational]
● Key Announcement (if any): [Insert announcement]
● CTA Goal: [Read post / Buy product / Share / Reply]

Structure:
1. Subject line (5 options, 40-60 chars)
2. Preview text (1 sentence)
3. Opening (personal note, 2-3 sentences)
4. Main content (3 sections with value)
5. CTA
6. PS line (adds urgency or extra value)`,
    placeholders: ['[Insert name]', '[Insert topic]', '[Describe subscribers]', '[Casual / Professional / Humorous / Inspirational]', '[Insert announcement]', '[Read post / Buy product / Share / Reply]'],
  },
  {
    promptId: 'CNT_005', category: 'Content Creation & Copywriting', subcategory: 'Copywriting',
    title: 'Video Sales Script (VSL) Writer',
    difficulty: 'advanced', estimatedTime: '25 min',
    tags: ['vsl', 'sales', 'video-script', 'conversion'],
    description: 'Write a complete video sales letter script that converts viewers into customers.',
    promptText: `Hello ChatGPT,
Write a Video Sales Letter (VSL) script for my product.

● Product Name: [Insert name]
● Price: [Insert price]
● Target Customer: [Describe in detail]
● Core Problem: [Main problem solved]
● Key Benefits: [List 5-7 benefits]
● Objections to Overcome: [Price / Trust / Time / Results]
● Offer Details: [What's included, guarantee, bonuses]

Write a complete VSL script:
1. Hook (15 seconds — stop the scroll)
2. Problem aggravation (45 seconds)
3. Solution introduction (30 seconds)
4. Features and benefits (2 minutes)
5. Social proof (45 seconds)
6. Pricing and offer (30 seconds)
7. Objection handling (45 seconds)
8. Guarantee (15 seconds)
9. Final CTA with urgency (30 seconds)`,
    placeholders: ['[Insert name]', '[Insert price]', '[Describe target customer]', '[Main problem solved]', '[List 5-7 benefits]', '[List objections]', '[Offer details]'],
  },
  {
    promptId: 'CNT_006', category: 'Content Creation & Copywriting', subcategory: 'Blog Writing',
    title: 'Listicle Blog Post Generator',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['blog', 'listicle', 'content', 'writing'],
    description: 'Create an engaging listicle-style blog post with research-backed items.',
    promptText: `Hello ChatGPT,
Write a listicle-style blog post on my topic.

● Title Angle: [Insert proposed title or angle]
● Number of Items: [5 / 7 / 10 / 15 / 20]
● Target Audience: [Describe]
● Tone: [Educational / Fun / Inspirational / Contrarian]
● Must Include: [Statistics / Examples / Quotes / Case studies]

For each item provide:
1. Item title (bold, benefit-driven)
2. Explanation (2-3 paragraphs)
3. Example or data point
4. Takeaway or action step`,
    placeholders: ['[Insert proposed title]', '[5 / 7 / 10 / 15 / 20]', '[Describe audience]', '[Educational / Fun / Inspirational / Contrarian]', '[Must include items]'],
  },
  {
    promptId: 'CNT_007', category: 'Content Creation & Copywriting', subcategory: 'Copywriting',
    title: 'Brand Voice & Tone Guide Generator',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['brand-voice', 'tone', 'guidelines', 'copywriting'],
    description: 'Create a comprehensive brand voice and tone guide for consistent messaging.',
    promptText: `Hello ChatGPT,
Create a brand voice and tone guide for my brand.

● Brand Name: [Insert name]
● Brand Personality (3 adjectives): [Insert adjectives]
● Target Audience: [Describe]
● Industry: [Insert industry]
● Competitor Brands: [List 2-3 competitors and their voice]
● Content Types: [Blog / Social / Email / Video / Ads]

Create:
1. Brand voice definition (4 dimensions: formal-casual, serious-playful, respectful-irreverent, factual-enthusiastic)
2. Do's and Don'ts for each content type
3. Vocabulary: words to use and words to avoid
4. Tone variations by channel (LinkedIn vs TikTok vs Email)
5. Example rewrites (before/after for common content types)
6. Voice checklist (5 questions to ask before publishing)`,
    placeholders: ['[Insert name]', '[Insert 3 adjectives]', '[Describe audience]', '[Insert industry]', '[List 2-3 competitors]', '[Blog / Social / Email / Video / Ads]'],
  },
  {
    promptId: 'CNT_008', category: 'Content Creation & Copywriting', subcategory: 'Blog Writing',
    title: 'How-To Guide / Tutorial Writer',
    difficulty: 'beginner', estimatedTime: '12 min',
    tags: ['how-to', 'tutorial', 'guide', 'step-by-step'],
    description: 'Create a comprehensive how-to guide with step-by-step instructions.',
    promptText: `Hello ChatGPT,
Write a comprehensive how-to guide on my chosen topic.

● Topic: [Insert what the guide teaches]
● Skill Level: [Absolute beginner / Intermediate / Advanced]
● Estimated Completion Time: [X minutes/hours]
● Required Tools/Materials: [List if applicable]
● Reader's Transformation: [What will they be able to do after?]

Write a complete guide with:
1. Introduction (why this matters)
2. Prerequisites (what they need before starting)
3. Step-by-step instructions (numbered, each with detail)
4. Common mistakes to avoid
5. Troubleshooting section
6. Next steps / advanced tips`,
    placeholders: ['[Insert topic]', '[Absolute beginner / Intermediate / Advanced]', '[X minutes/hours]', '[List tools/materials]', '[Reader transformation]'],
  },
  {
    promptId: 'CNT_009', category: 'Content Creation & Copywriting', subcategory: 'Press Release',
    title: 'Press Release & Media Kit Writer',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['pr', 'press-release', 'media', 'announcement'],
    description: 'Write a professional press release that journalists will actually read.',
    promptText: `Hello ChatGPT,
Write a press release for my company announcement.

● Company Name: [Insert name]
● Announcement Type: [Product launch / Funding / Partnership / Hire / Award / Event]
● Headline Angle: [What's the news hook?]
● Key Quote Attribution: [Name, title, person to quote]
● Supporting Details: [Stats, dates, context]
● Target Publication Tier: [Local / Industry / National / Tech media]

Write:
1. Press release (inverted pyramid structure)
2. Boilerplate (about company, 50 words)
3. Media kit elements list
4. Suggested subject line for pitching journalists`,
    placeholders: ['[Insert company]', '[Product launch / Funding / Partnership / Hire / Award / Event]', '[What\'s the news hook?]', '[Name and title]', '[Stats, dates, context]', '[Local / Industry / National / Tech]'],
  },
  {
    promptId: 'CNT_010', category: 'Content Creation & Copywriting', subcategory: 'Copywriting',
    title: 'Facebook Ad Copy Variations Generator',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['facebook-ads', 'copy', 'variations', 'a-b-testing'],
    description: 'Generate multiple Facebook ad copy variations for split testing.',
    promptText: `Hello ChatGPT,
Create Facebook ad copy variations for split testing.

● Product/Service: [Insert name]
● Target Audience: [Age, interests, behaviours]
● Offer: [Describe the offer]
● Value Proposition: [Main reason to buy]
● CTA: [Shop Now / Learn More / Sign Up / Get Offer]
● Ad Format: [Single image / Carousel / Video / Collection]
● Tone Options: [Urgent / Friendly / Professional / Bold]

Generate 6 ad variations:
1. Benefit-driven headline
2. Curiosity-driven headline
3. Social proof angle
4. Problem-agitation-solution
5. Storytelling angle
6. Urgency/scarcity angle

Each variation: Primary text, headline, description, CTA`,
    placeholders: ['[Insert name]', '[Describe audience]', '[Describe offer]', '[Value proposition]', '[CTA type]', '[Ad format]', '[Tone options]'],
  },

  // === Additional Coding & Development Prompts ===
  {
    promptId: 'CODE_003', category: 'Coding & Development', subcategory: 'Debugging',
    title: 'Error Message Decoder & Fix Suggester',
    difficulty: 'beginner', estimatedTime: '5 min',
    tags: ['debugging', 'errors', 'troubleshooting'],
    description: 'Paste any error message and get an explanation and fix suggestions.',
    promptText: `Hello ChatGPT,
Help me understand and fix this error.

● Programming Language: [Insert language]
● Framework/Library: [Insert framework]
● Full Error Message: [PASTE ERROR HERE]
● What I Was Doing: [Describe what triggered the error]
● Relevant Code Snippet: [PASTE CODE HERE]

Provide:
1. What the error means in plain English
2. Root cause (why it's happening)
3. Fix solution (step-by-step)
4. How to prevent this error in the future`,
    placeholders: ['[Insert language]', '[Insert framework]', '[PASTE ERROR HERE]', '[Describe what triggered it]', '[PASTE CODE HERE]'],
  },
  {
    promptId: 'CODE_004', category: 'Coding & Development', subcategory: 'Architecture',
    title: 'System Architecture Designer',
    difficulty: 'advanced', estimatedTime: '25 min',
    tags: ['architecture', 'system-design', 'backend', 'scalability'],
    description: 'Design a scalable system architecture for your application.',
    promptText: `Hello ChatGPT,
Design a system architecture for my application.

● App Type: [Web / Mobile / API / Microservices / Monolith]
● Core Features: [List 5-10 features]
● Expected Traffic: [X users/day, X concurrent users]
● Tech Stack Preferences: [Languages, frameworks, databases]
● Budget Constraints: [Low / Medium / High]
● Hosting Preference: [Cloud / On-premise / Hybrid]
● Key Requirements: [Scalability / Security / Real-time / Offline support]

Provide:
1. High-level architecture diagram (text description)
2. Component breakdown and responsibilities
3. Data flow between components
4. Database schema design
5. API design principles
6. Scaling strategy
7. Security considerations
8. Monitoring and logging approach`,
    placeholders: ['[Web / Mobile / API / Microservices / Monolith]', '[List features]', '[Traffic estimates]', '[Tech stack preferences]', '[Low / Medium / High]', '[Cloud / On-premise / Hybrid]'],
  },
  {
    promptId: 'CODE_005', category: 'Coding & Development', subcategory: 'Database',
    title: 'Database Schema Designer & Query Optimizer',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['database', 'schema', 'sql', 'nosql', 'optimization'],
    description: 'Design efficient database schemas and optimize slow queries.',
    promptText: `Hello ChatGPT,
Design a database schema or optimize existing queries for my application.

● Database Type: [PostgreSQL / MySQL / MongoDB / SQLite / Other]
● Project Type: [Web app / Mobile app / Analytics / Other]
● Key Entities: [List main data objects]
● Traffic Volume: [Read-heavy / Write-heavy / Balanced]
● Current Schema (if exists): [PASTE or describe]
● Pain Points: [Slow queries / Complex joins / Data duplication / Scaling]

Provide:
1. Optimized schema design with relationships
2. Index recommendations
3. Sample queries for common operations
4. Query optimization suggestions
5. Migration plan (if refactoring)
6. Backup and recovery strategy`,
    placeholders: ['[PostgreSQL / MySQL / MongoDB / SQLite]', '[Web app / Mobile app / Analytics]', '[List data objects]', '[Read-heavy / Write-heavy / Balanced]', '[PASTE or describe]', '[Pain points]'],
  },
  {
    promptId: 'CODE_006', category: 'Coding & Development', subcategory: 'API Development',
    title: 'RESTful API Designer & Documentation Generator',
    difficulty: 'intermediate', estimatedTime: '18 min',
    tags: ['api', 'rest', 'backend', 'documentation'],
    description: 'Design complete RESTful APIs with endpoint documentation.',
    promptText: `Hello ChatGPT,
Design a RESTful API for my application.

● App Description: [Describe your app]
● Key Resources: [List main entities]
● Authentication: [JWT / OAuth / API Key / Session-based]
● Request/Response Format: [JSON / XML / Both]
● Versioning Strategy: [URL / Header / No versioning]

Provide:
1. Complete endpoint list with HTTP methods
2. Request/response schemas for each endpoint
3. Error response format
4. Authentication flow
5. Rate limiting strategy
6. Pagination design
7. Example curl commands for each endpoint`,
    placeholders: ['[Describe your app]', '[List main entities]', '[JWT / OAuth / API Key / Session]', '[JSON / XML / Both]', '[URL / Header / No versioning]'],
  },
  {
    promptId: 'CODE_007', category: 'Coding & Development', subcategory: 'DevOps',
    title: 'CI/CD Pipeline Builder',
    difficulty: 'advanced', estimatedTime: '20 min',
    tags: ['devops', 'cicd', 'automation', 'deployment'],
    description: 'Design a complete CI/CD pipeline for your project.',
    promptText: `Hello ChatGPT,
Design a CI/CD pipeline for my project.

● Project Type: [Web app / Mobile app / Library / API]
● Version Control: [GitHub / GitLab / Bitbucket]
● Hosting/Deployment: [AWS / Vercel / Netlify / Docker / Self-hosted]
● Languages: [List languages used]
● Testing Framework: [Jest / PyTest / Mocha / Other]
● Current Process: [Manual / Semi-automated / None]

Provide:
1. Pipeline stages (build → test → deploy)
2. Step-by-step pipeline configuration
3. Testing strategy (unit, integration, e2e)
4. Environment management (dev/staging/prod)
5. Rollback strategy
6. Monitoring and alerting setup
7. Security scanning integration`,
    placeholders: ['[Web / Mobile / Library / API]', '[GitHub / GitLab / Bitbucket]', '[AWS / Vercel / Netlify / Docker]', '[List languages]', '[Jest / PyTest / Mocha]', '[Manual / Semi-automated / None]'],
  },
  {
    promptId: 'CODE_008', category: 'Coding & Development', subcategory: 'Code Generation',
    title: 'React Component Generator',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['react', 'component', 'frontend', 'ui'],
    description: 'Generate reusable React components with TypeScript and styling.',
    promptText: `Hello ChatGPT,
Generate a React component for my application.

● Component Name: [Insert name]
● Component Type: [UI / Layout / Feature / Page]
● Props Required: [List props and types]
● State Management: [useState / useReducer / Context / Redux]
● Styling Approach: [CSS Modules / Tailwind / Styled Components / Inline]
● Accessibility Requirements: [ARIA labels / Keyboard nav / Screen reader]
● Edge Cases to Handle: [Loading / Empty / Error / No data]

Generate:
1. Component with TypeScript types
2. Styling
3. Usage example
4. Test cases (Jest + React Testing Library)
5. Storybook story (optional)`,
    placeholders: ['[Insert name]', '[UI / Layout / Feature / Page]', '[List props]', '[State management]', '[Styling approach]', '[ARIA / Keyboard / Screen reader]', '[Edge cases]'],
  },
  {
    promptId: 'CODE_009', category: 'Coding & Development', subcategory: 'Testing',
    title: 'Unit Test Suite Generator',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['testing', 'unit-tests', 'jest', 'pytest', 'quality'],
    description: 'Generate comprehensive unit tests for your codebase.',
    promptText: `Hello ChatGPT,
Write unit tests for my code.

● Language/Framework: [Python / JavaScript / TypeScript / Java / Go]
● Testing Library: [Jest / PyTest / JUnit / Mocha]
● Code to Test: [PASTE CODE HERE]
● Coverage Goal: [Branch / Line / Function coverage]
● Edge Cases Known: [List known edge cases]

Generate:
1. Test file with import/setup
2. Test cases covering: happy path, error cases, edge cases, boundary conditions
3. Mock setup (if external dependencies)
4. Test descriptions using Given/When/Then
5. Coverage improvement suggestions`,
    placeholders: ['[Python / JavaScript / TypeScript / Java / Go]', '[Jest / PyTest / JUnit / Mocha]', '[PASTE CODE HERE]', '[Branch / Line / Function]', '[List edge cases]'],
  },
  {
    promptId: 'CODE_010', category: 'Coding & Development', subcategory: 'Security',
    title: 'Application Security Audit Checklist',
    difficulty: 'advanced', estimatedTime: '20 min',
    tags: ['security', 'audit', 'vulnerabilities', 'best-practices'],
    description: 'Get a comprehensive security audit checklist for your application.',
    promptText: `Hello ChatGPT,
Perform a security audit analysis for my application.

● App Type: [Web / Mobile / API / Desktop]
● Tech Stack: [Languages, frameworks, databases]
● Authentication: [How users log in]
● Data Stored: [Types of sensitive data]
● Compliance Requirements: [GDPR / HIPAA / SOC2 / PCI-DSS / None]
● Third-Party Integrations: [List external services]

Provide a security checklist covering:
1. Authentication and authorization
2. Input validation and sanitization
3. Data encryption (in transit and at rest)
4. API security (rate limiting, CORS, OWASP top 10)
5. Dependency vulnerabilities
6. Infrastructure security
7. Logging and monitoring
8. Incident response plan
9. Compliance checklist`,
    placeholders: ['[Web / Mobile / API / Desktop]', '[List tech stack]', '[Auth method]', '[Types of sensitive data]', '[GDPR / HIPAA / SOC2 / PCI-DSS / None]', '[List integrations]'],
  },

  // === Additional Data Analysis Prompts ===
  {
    promptId: 'DATA_002', category: 'Data Analysis', subcategory: 'Data Cleaning',
    title: 'Data Cleaning & Preprocessing Pipeline',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['data-cleaning', 'preprocessing', 'pandas', 'etl'],
    description: 'Clean and preprocess messy datasets for analysis.',
    promptText: `Hello ChatGPT,
Help me clean and preprocess my dataset.

● Data Format: [CSV / Excel / JSON / SQL export]
● Rows/Columns: [Approximate dimensions]
● Known Issues: [Missing values / Duplicates / Outliers / Wrong types / Inconsistent formatting]
● Analysis Goal: [What are you going to do with the cleaned data?]

[PASTE SAMPLE OF YOUR DATA OR DESCRIBE IT]

Provide:
1. Data quality assessment
2. Cleaning steps (with code if applicable)
3. Handling missing values strategy
4. Outlier treatment recommendations
5. Feature engineering suggestions
6. Preprocessing pipeline (step-by-step)`,
    placeholders: ['[CSV / Excel / JSON / SQL export]', '[Dimensions]', '[Missing / Duplicates / Outliers / Wrong types]', '[Analysis goal]', '[PASTE SAMPLE DATA]'],
  },
  {
    promptId: 'DATA_003', category: 'Data Analysis', subcategory: 'Visualization',
    title: 'Data Visualization Recommendations',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['visualization', 'charts', 'dashboard', 'reporting'],
    description: 'Get chart type recommendations and visualization code for your data.',
    promptText: `Hello ChatGPT,
Recommend the best visualizations for my data.

● Data Type: [Time series / Categories / Relationships / Distribution / Composition]
● Number of Variables: [X]
● Audience: [Executive / Technical / Public / Team]
● Output Format: [Dashboard / Report / Presentation / Web]
● Preferred Tools: [Python / R / Tableau / Excel / Google Sheets]

[DESCRIBE YOUR DATA AND WHAT YOU WANT TO SHOW]

For each recommended chart:
1. Chart type and why
2. What insight it reveals
3. Code/configuration to create it
4. Design best practices for this chart`,
    placeholders: ['[Time series / Categories / Relationships / Distribution / Composition]', '[Number of variables]', '[Executive / Technical / Public / Team]', '[Dashboard / Report / Presentation / Web]', '[Preferred tools]', '[DESCRIBE DATA]'],
  },
  {
    promptId: 'DATA_004', category: 'Data Analysis', subcategory: 'Forecasting',
    title: 'Data Forecasting & Trend Prediction',
    difficulty: 'advanced', estimatedTime: '20 min',
    tags: ['forecasting', 'prediction', 'trends', 'time-series'],
    description: 'Generate data-driven forecasts with methodology explanations.',
    promptText: `Hello ChatGPT,
Forecast future trends based on my historical data.

● Data Frequency: [Daily / Weekly / Monthly / Quarterly / Yearly]
● Historical Data Points: [Number of periods]
● Seasonality: [Yes / No / Unknown]
● Key Drivers: [What factors influence this metric?]
● Forecast Horizon: [Next X periods]

[PASTE YOUR HISTORICAL DATA OR DESCRIBE IT]

Provide:
1. Data pattern analysis (trend, seasonality, cycles)
2. Best forecasting methodology for this data
3. Forecast with confidence intervals
4. Key assumptions underlying the forecast
5. Risk factors that could change the outcome
6. Recommended validation approach`,
    placeholders: ['[Daily / Weekly / Monthly / Quarterly / Yearly]', '[Number of periods]', '[Yes / No / Unknown]', '[Key drivers]', '[Next X periods]', '[PASTE DATA]'],
  },
  {
    promptId: 'DATA_005', category: 'Data Analysis', subcategory: 'A/B Testing',
    title: 'A/B Test Design & Statistical Analysis',
    difficulty: 'advanced', estimatedTime: '18 min',
    tags: ['ab-testing', 'experiment', 'statistics', 'conversion'],
    description: 'Design A/B tests and analyse results with statistical rigour.',
    promptText: `Hello ChatGPT,
Design and analyse an A/B test for my experiment.

● Test Goal: [Increase X metric]
● Current Baseline: [Current value of the metric]
● Minimum Detectable Effect: [Smallest change worth detecting]
● Traffic Available: [Visitors per day/week]
● Confidence Level: [90% / 95% / 99%]

[IF ANALYSING RESULTS, PASTE DATA HERE]

Provide:
1. Sample size calculation
2. Test duration recommendation
3. Hypothesis formulation (null and alternative)
4. Randomization strategy
5. Statistical analysis approach (test type)
6. Results interpretation (if data provided)
7. Common pitfalls to avoid`,
    placeholders: ['[Increase X metric]', '[Current baseline]', '[Smallest change to detect]', '[Traffic per day/week]', '[90% / 95% / 99%]', '[PASTE RESULTS DATA]'],
  },
  {
    promptId: 'DATA_006', category: 'Data Analysis', subcategory: 'Dashboard',
    title: 'KPI Dashboard Design & Metrics Definition',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['dashboard', 'kpi', 'metrics', 'reporting', 'business'],
    description: 'Design a KPI dashboard with defined metrics and visual layout.',
    promptText: `Hello ChatGPT,
Design a KPI dashboard for my business.

● Business Type: [SaaS / E-commerce / Agency / Service / Non-profit]
● Department: [Executive / Marketing / Sales / Product / Operations]
● Reporting Cadence: [Daily / Weekly / Monthly]
● Stakeholders: [Who will view this dashboard?]
● Key Goals: [What decisions will this dashboard inform?]
● Data Sources Available: [Google Analytics / CRM / Database / Spreadsheets / Other]

Design:
1. Dashboard structure (sections and layout)
2. Top 5-7 KPIs with definitions and formulas
3. Chart types for each KPI
4. Benchmark/comparison recommendations
5. Alert thresholds
6. Data refresh schedule
7. Tools recommendation`,
    placeholders: ['[SaaS / E-commerce / Agency / Service / Non-profit]', '[Executive / Marketing / Sales / Product / Operations]', '[Daily / Weekly / Monthly]', '[Stakeholders]', '[Decisions informed]', '[Data sources]'],
  },

  // === Additional Online Course Creation Prompts ===
  {
    promptId: 'CRSE_002', category: 'Online Course Creation', subcategory: 'Video Script',
    title: 'Course Video Script Writer',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['course', 'video', 'script', 'lesson', 'education'],
    description: 'Write engaging video scripts for online course lessons.',
    promptText: `Hello ChatGPT,
Write a video script for my online course lesson.

● Course Topic: [Insert course topic]
● Lesson Title: [Insert lesson title]
● Lesson Length: [5 / 10 / 15 / 20 minutes]
● Student Level: [Beginner / Intermediate / Advanced]
● Key Learning Objective: [What should students learn?]
● Visual Elements Available: [Slides / Screen recording / Whiteboard / Talking head]

Write:
1. Hook (first 30 seconds — grab attention)
2. Learning objectives overview (30 seconds)
3. Main content with timestamps and visual cues
4. Key takeaways summary (last 60 seconds)
5. Practice exercise prompt
6. CTA to next lesson`,
    placeholders: ['[Insert course topic]', '[Insert lesson title]', '[5 / 10 / 15 / 20 minutes]', '[Beginner / Intermediate / Advanced]', '[Learning objective]', '[Available visuals]'],
  },
  {
    promptId: 'CRSE_003', category: 'Online Course Creation', subcategory: 'Marketing',
    title: 'Course Sales Page & Launch Strategy',
    difficulty: 'intermediate', estimatedTime: '20 min',
    tags: ['course', 'sales-page', 'launch', 'marketing'],
    description: 'Create a complete course sales page and launch campaign plan.',
    promptText: `Hello ChatGPT,
Create a sales page and launch plan for my online course.

● Course Title: [Insert title]
● Course Topic: [Insert topic]
● Target Student: [Describe ideal student]
● Course Price: [Insert price]
● Course Format: [Video / Text / Live / Hybrid]
● Module Count: [X modules]
● Unique Selling Point: [What makes this course different?]
● Existing Audience Size: [Email list / Social followers]

Provide:
1. Sales page headline (5 options)
2. Sales page structure with copy for each section
3. Email launch sequence (5-7 emails)
4. Social media promotion plan (pre, during, post launch)
5. Pricing strategy (one-time / payment plan / bundle)
6. Launch timeline (2-4 week plan)
7. Post-launch follow-up sequence`,
    placeholders: ['[Insert title]', '[Insert topic]', '[Describe ideal student]', '[Insert price]', '[Video / Text / Live / Hybrid]', '[X modules]', '[Unique selling point]', '[Audience size]'],
  },
  {
    promptId: 'CRSE_004', category: 'Online Course Creation', subcategory: 'Engagement',
    title: 'Course Activity & Assessment Builder',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['course', 'activities', 'assessments', 'engagement'],
    description: 'Create interactive activities, quizzes, and assessments for your course.',
    promptText: `Hello ChatGPT,
Create engaging activities and assessments for my course.

● Course Topic: [Insert topic]
● Module: [Insert module name]
● Lesson Type: [Concept / Process / Skill / Case study]
● Student Level: [Beginner / Intermediate / Advanced]
● Assessment Type: [Quiz / Project / Peer review / Reflection / Case study analysis]
● Number of Questions: [X]

Create:
1. 10-question knowledge check quiz (multiple choice + correct answer + explanation)
2. 1 practical exercise (real-world application)
3. 1 reflection prompt
4. Grading rubric for the exercise
5. Common mistakes to address in feedback`,
    placeholders: ['[Insert topic]', '[Insert module]', '[Concept / Process / Skill / Case study]', '[Beginner / Intermediate / Advanced]', '[Quiz / Project / Peer review / Reflection]', '[Number of questions]'],
  },
  {
    promptId: 'CRSE_005', category: 'Online Course Creation', subcategory: 'Community',
    title: 'Course Community & Cohort Experience Designer',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['community', 'cohort', 'engagement', 'learning'],
    description: 'Design a cohort-based course experience with community engagement.',
    promptText: `Hello ChatGPT,
Design a cohort-based learning experience for my course.

● Course Topic: [Insert topic]
● Cohort Duration: [X weeks]
● Expected Cohort Size: [X students]
● Platform: [Discord / Slack / Circle / Facebook Group / Mighty Networks]
● Live Sessions: [Weekly / Bi-weekly / None]
● Existing Community Guidelines: [If any]

Design:
1. Cohort schedule (week-by-week breakdown)
2. Community engagement activities per week
3. Discussion prompts (5-10 per week)
4. Accountability system design
5. Office hours / AMA structure
6. Graduation / celebration event plan
7. Alumni engagement strategy`,
    placeholders: ['[Insert topic]', '[X weeks]', '[X students]', '[Discord / Slack / Circle / FB Group]', '[Weekly / Bi-weekly / None]', '[Existing guidelines]'],
  },
  {
    promptId: 'CRSE_006', category: 'Online Course Creation', subcategory: 'Pricing',
    title: 'Course Pricing & Packaging Strategist',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['pricing', 'packaging', 'tiers', 'revenue'],
    description: 'Develop optimal course pricing and packaging strategies.',
    promptText: `Hello ChatGPT,
Develop a pricing strategy for my online course.

● Course Topic: [Insert topic]
● Course Length: [X hours of content]
● Competitor Pricing: [List 3-5 competitor prices]
● My Authority Level: [New / Growing / Established expert]
● Target Audience Budget: [Low / Medium / High]
● Additional Assets: [Worksheets / Templates / Community / Coaching calls]

Provide:
1. Pricing tier recommendations (3 tiers minimum)
2. What to include in each tier
3. One-time vs subscription vs payment plan analysis
4. Launch pricing strategy (early bird, discount, bundle)
5. Price anchoring strategy
6. Revenue projection at different price points
7. Upgrade/upsell path design`,
    placeholders: ['[Insert topic]', '[X hours]', '[Competitor prices]', '[New / Growing / Established]', '[Low / Medium / High]', '[Additional assets]'],
  },

  // === Additional Sales & Persuasion Prompts ===
  {
    promptId: 'SALES_002', category: 'Sales & Persuasion', subcategory: 'Cold Calling',
    title: 'Cold Calling Script & Objection Handler',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['cold-calling', 'scripts', 'objections', 'telemarketing'],
    description: 'Create a cold calling script with objection handling responses.',
    promptText: `Hello ChatGPT,
Create a cold calling script for my B2B outreach.

● My Product/Service: [Insert name]
● Target Prospect Role: [Job title]
● Industry: [Insert industry]
● Value Proposition: [One sentence]
● Common Objections: [Too expensive / Not interested / Too busy / Happy with current]

Provide:
1. Opening script (first 15 seconds)
2. Value statement (30 seconds)
3. Discovery questions (3-5 questions)
4. Handling scripts for 5 common objections
5. Trial close / soft ask
6. Voicemail script
7. Follow-up email template`,
    placeholders: ['[Insert name]', '[Job title]', '[Insert industry]', '[Value proposition]', '[List common objections]'],
  },
  {
    promptId: 'SALES_003', category: 'Sales & Persuasion', subcategory: 'Proposal',
    title: 'Sales Proposal & Quote Builder',
    difficulty: 'intermediate', estimatedTime: '18 min',
    tags: ['proposal', 'quote', 'sales', 'documentation'],
    description: 'Write persuasive sales proposals that win deals.',
    promptText: `Hello ChatGPT,
Write a sales proposal for my prospect.

● Prospect Name/Company: [Insert name]
● My Company: [Insert name]
● Service/Product Offered: [Insert description]
● Prospect's Pain Points: [List known challenges]
● Proposed Solution: [How we solve their problem]
● Budget Range: [Insert or "TBD"]
● Timeline: [Proposed start and delivery dates]
● Competitors (if known): [Names]

Write a complete proposal:
1. Executive summary
2. Understanding of their challenges
3. Proposed solution with methodology
4. Deliverables and timeline
5. Pricing and payment terms
6. About us / credentials
7. Case study or social proof
8. Terms and conditions summary
9. Acceptance / next steps section`,
    placeholders: ['[Prospect name]', '[My company]', '[Service description]', '[Known pain points]', '[Proposed solution]', '[Budget]', '[Timeline]', '[Competitors]'],
  },
  {
    promptId: 'SALES_004', category: 'Sales & Persuasion', subcategory: 'Follow-Up',
    title: 'Sales Follow-Up Sequence (10 Emails)',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['sales', 'follow-up', 'email', 'sequence', 'persistence'],
    description: 'Create a persistent yet respectful sales follow-up sequence.',
    promptText: `Hello ChatGPT,
Create a 10-email sales follow-up sequence.

● Prospect Context: [Which stage are they at?]
● Previous Interaction: [Describe last contact]
● My Offer: [Brief description]
● Prospect Profile: [Decision maker / Influencer / User]
● Time Since Last Contact: [X days]

Create a 10-email sequence:
1. Day 1: Value-add (article, insight, tool)
2. Day 4: Social proof (case study)
3. Day 7: Different angle on value
4. Day 11: Objection handling
5. Day 15: New development or update
6. Day 20: Storytelling email
7. Day 26: Direct ask with urgency
8. Day 33: Breakup email 1 (curiosity)
9. Day 41: Final breakup (FOMO)
10. Day 60: Re-engagement (new offer)`,
    placeholders: ['[Describe stage]', '[Last interaction]', '[Offer description]', '[Decision maker / Influencer / User]', '[X days]'],
  },
  {
    promptId: 'SALES_005', category: 'Sales & Persuasion', subcategory: 'Consultative',
    title: 'Consultative Sales Discovery Question Bank',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['consultative', 'discovery', 'questions', 'needs-analysis'],
    description: 'Generate strategic discovery questions to uncover prospect needs.',
    promptText: `Hello ChatGPT,
Create a discovery question bank for my sales process.

● My Product/Service: [Insert name]
● Industry I Sell To: [Insert industry]
● Typical Buyer Role: [Job title]
● Common Problems I Solve: [List 3-5 problems]
● Sales Cycle Length: [Short / Medium / Long]

Provide questions organized by category:
1. Discovery questions (identify pain)
2. Budget questions (uncover budget)
3. Authority questions (decision process)
4. Need questions (prioritize needs)
5. Timeline questions (urgency)
6. Competitor questions (differentiation)
7. Value questions (ROI quantification)
8. Closing questions (commitment)`,
    placeholders: ['[Insert name]', '[Insert industry]', '[Typical buyer role]', '[List 3-5 problems]', '[Short / Medium / Long]'],
  },
  {
    promptId: 'SALES_006', category: 'Sales & Persuasion', subcategory: 'LinkedIn',
    title: 'LinkedIn Sales Navigator Outreach System',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['linkedin', 'sales-navigator', 'outreach', 'b2b'],
    description: 'Generate LinkedIn outreach messages that get responses from decision makers.',
    promptText: `Hello ChatGPT,
Create a LinkedIn outreach strategy for my B2B sales.

● My Offering: [Describe briefly]
● Target Prospect Role: [Job title]
● Target Industry: [Insert industry]
● Company Size: [Small / Medium / Enterprise]
● Personalization Approach: [What can you reference?]

Generate:
1. 3 connection request note variations (under 300 chars)
2. 5 first message variations (after connection)
3. 3 follow-up message variations
4. Profile optimization tips for sales
5. Content posting strategy to attract leads
6. InMail template (for Sales Navigator)`,
    placeholders: ['[Describe offering]', '[Job title]', '[Industry]', '[Small / Medium / Enterprise]', '[Personalization approach]'],
  },
  {
    promptId: 'SALES_007', category: 'Sales & Persuasion', subcategory: 'ROI',
    title: 'ROI Calculator & Value Proposition Builder',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['roi', 'value', 'justification', 'business-case'],
    description: 'Build a compelling ROI analysis to justify your solution.',
    promptText: `Hello ChatGPT,
Create an ROI calculator framework for my product/service.

● Product/Service: [Insert name]
● Price: [Insert price]
● Implementation Time: [X days/weeks]
● Primary Value Drivers: [Time saved / Revenue increased / Cost reduced / Quality improved]
● Typical Customer Profile: [Describe]
● Payback Period Expectations: [X months]

Provide:
1. ROI formula and methodology
2. Cost avoidance calculations
3. Revenue impact projections
4. Productivity savings estimates
5. Intangible benefits framework
6. Payback period calculation
7. 3 customer scenarios (conservative, moderate, optimistic)
8. Executive summary template`,
    placeholders: ['[Insert name]', '[Insert price]', '[Implementation time]', '[Value drivers]', '[Customer profile]', '[Payback period]'],
  },

  // === Additional HR & Recruitment Prompts ===
  {
    promptId: 'HR_002', category: 'HR & Recruitment', subcategory: 'Interview Questions',
    title: 'Behavioral Interview Question Generator',
    difficulty: 'beginner', estimatedTime: '8 min',
    tags: ['hr', 'interview', 'questions', 'hiring'],
    description: 'Generate behavioral interview questions for any role.',
    promptText: `Hello ChatGPT,
Generate behavioral interview questions for my open role.

● Job Title: [Insert title]
● Key Competencies Required: [List 4-6 competencies]
● Experience Level: [Junior / Mid / Senior / Lead]
● Company Culture: [Describe culture keywords]
● Role Type: [Individual contributor / Manager / Executive]

For each competency, generate:
1. 3 behavioral questions using the STAR format
2. What a good answer looks like
3. Red flags to watch for
4. Follow-up probing questions`,
    placeholders: ['[Insert title]', '[List 4-6 competencies]', '[Junior / Mid / Senior / Lead]', '[Culture keywords]', '[Individual / Manager / Executive]'],
  },
  {
    promptId: 'HR_003', category: 'HR & Recruitment', subcategory: 'Onboarding',
    title: 'Employee Onboarding Plan & Checklist',
    difficulty: 'beginner', estimatedTime: '12 min',
    tags: ['hr', 'onboarding', 'new-hire', 'training'],
    description: 'Create a comprehensive employee onboarding plan for your new hire.',
    promptText: `Hello ChatGPT,
Create a 90-day employee onboarding plan.

● Job Title: [Insert title]
● Department: [Insert department]
● Seniority: [Junior / Mid / Senior / Executive]
● Remote/Hybrid/On-site: [Specify]
● Equipment Provided: [Laptop, software, etc.]
● Mentor/Buddy Available: [Yes / No]

Design:
1. Pre-boarding checklist (before Day 1)
2. Day 1 schedule
3. Week 1 goals and activities
4. First 30 days: learning and integration plan
5. Days 31-60: contribution and ramp-up
6. Days 61-90: independence and ownership
7. 30/60/90 day goals template
8. Check-in schedule (manager + HR)
9. Training and resources list`,
    placeholders: ['[Insert title]', '[Insert department]', '[Junior / Mid / Senior / Executive]', '[Remote / Hybrid / On-site]', '[Equipment provided]', '[Yes / No]'],
  },
  {
    promptId: 'HR_004', category: 'HR & Recruitment', subcategory: 'Performance Review',
    title: 'Performance Review & Feedback Template',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['hr', 'performance', 'feedback', 'review'],
    description: 'Generate a structured performance review with actionable feedback.',
    promptText: `Hello ChatGPT,
Create a performance review for my team member.

● Employee Name: [Insert name or placeholder]
● Role: [Insert title]
● Review Period: [X months]
● Key Achievements: [List accomplishments]
● Areas for Growth: [List improvement areas]
● Company Values to Assess: [List values]
● Rating Scale: [1-5 / 1-10 / Meets-Exceeds]

Generate:
1. Overall performance summary (3-4 sentences)
2. Achievement highlights (specific examples)
3. Growth areas (constructive, specific)
4. Goal setting for next period (3-5 SMART goals)
5. Development plan recommendations
6. Manager comment section
7. Employee self-reflection questions`,
    placeholders: ['[Insert name]', '[Insert title]', '[X months]', '[List accomplishments]', '[List improvement areas]', '[List values]', '[1-5 / 1-10 / Meets-Exceeds]'],
  },
  {
    promptId: 'HR_005', category: 'HR & Recruitment', subcategory: 'Offer Letters',
    title: 'Job Offer Letter & Negotiation Toolkit',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['hr', 'offer', 'negotiation', 'hiring'],
    description: 'Create professional offer letters and handle candidate negotiations.',
    promptText: `Hello ChatGPT,
Create a job offer letter and negotiation guidance.

● Candidate Name: [Insert name]
● Job Title: [Insert title]
● Base Salary: [Insert amount]
● Bonus/Commission: [Describe structure]
● Equity: [Describe if applicable]
● Benefits: [List key benefits]
● Start Date: [Insert date]
● Reporting To: [Insert manager title]

Generate:
1. Formal offer letter template
2. Key talking points for verbal offer call
3. Handling common objections (salary, equity, title)
4. Counter-offer response strategies
5. Acceptance follow-up email
6. Rejection follow-up email (if they decline)`,
    placeholders: ['[Insert name]', '[Insert title]', '[Salary]', '[Bonus structure]', '[Equity details]', '[Benefits]', '[Start date]', '[Manager]'],
  },
  {
    promptId: 'HR_006', category: 'HR & Recruitment', subcategory: 'Culture',
    title: 'Company Culture Code & Values Definition',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['hr', 'culture', 'values', 'mission', 'vision'],
    description: 'Define your company culture code and core values with AI guidance.',
    promptText: `Hello ChatGPT,
Help me define my company culture code and core values.

● Company Name: [Insert name]
● Industry: [Insert industry]
● Team Size: [X employees]
● Company Stage: [Startup / Growth / Established]
● Current Culture Keywords: [Adjectives describing current culture]
● Aspirational Culture Keywords: [Adjectives describing desired culture]
● Founder/Leader Values: [What matters to leadership?]

Create:
1. Mission statement (1 sentence)
2. Vision statement (1-2 sentences)
3. Core values (5-7 values with descriptions and behaviours)
4. Culture code document structure
5. Values in action: how each value shows up in daily work
6. Hiring for culture fit: interview questions per value
7. Recognition framework tied to values`,
    placeholders: ['[Insert name]', '[Insert industry]', '[X employees]', '[Startup / Growth / Established]', '[Current culture]', '[Desired culture]', '[Leader values]'],
  },

  // === Additional Project Management Prompts ===
  {
    promptId: 'PM_002', category: 'Project Management', subcategory: 'Sprint Planning',
    title: 'Agile Sprint Planning Facilitator',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['agile', 'sprint', 'scrum', 'planning', 'team'],
    description: 'Plan a complete sprint with story breakdown and capacity planning.',
    promptText: `Hello ChatGPT,
Plan an Agile sprint for my development team.

● Project: [Insert project name]
● Sprint Duration: [1 / 2 / 3 / 4 weeks]
● Team Size: [X developers, X designers, X QA]
● Team Capacity: [X story points or hours per sprint]
● Previously Committed Items: [List carry-over items]
● New Priorities: [List new feature requests or tickets]
● Known Dependencies: [List external dependencies]
● Velocity (historical): [X story points per sprint]

Provide:
1. Sprint goal (1 sentence)
2. Capacity allocation (new work vs maintenance vs tech debt)
3. Suggested sprint backlog with story point estimates
4. Risk assessment for each item
5. Daily standup question suggestions
6. Sprint review demo plan
7. Retrospective prompt ideas`,
    placeholders: ['[Project name]', '[1 / 2 / 3 / 4 weeks]', '[Team composition]', '[Capacity]', '[Carry-over items]', '[New priorities]', '[Dependencies]', '[Velocity]'],
  },
  {
    promptId: 'PM_003', category: 'Project Management', subcategory: 'Risk Management',
    title: 'Project Risk Register & Mitigation Plan',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['risk', 'mitigation', 'planning', 'project-management'],
    description: 'Build a comprehensive risk register with mitigation strategies.',
    promptText: `Hello ChatGPT,
Create a risk register for my project.

● Project Name: [Insert name]
● Project Phase: [Planning / Execution / Monitoring / Closing]
● Team Size: [X members]
● Budget: [Insert amount]
● Timeline: [Start to end date]
● Known Risks Already: [List any known risks]
● Stakeholder Concerns: [List stakeholder worries]

Generate a risk register with:
1. Risk identification (10-15 risks minimum)
2. Probability assessment (Low / Medium / High)
3. Impact assessment (Low / Medium / High)
4. Risk score (Probability × Impact)
5. Mitigation strategies for each risk
6. Contingency plans for high-scoring risks
7. Risk owner assignment recommendations
8. Review cadence and trigger conditions`,
    placeholders: ['[Project name]', '[Planning / Execution / Monitoring / Closing]', '[X members]', '[Budget]', '[Timeline]', '[Known risks]', '[Stakeholder concerns]'],
  },
  {
    promptId: 'PM_004', category: 'Project Management', subcategory: 'Meeting Facilitation',
    title: 'Meeting Agenda & Facilitation Guide',
    difficulty: 'beginner', estimatedTime: '8 min',
    tags: ['meetings', 'agenda', 'facilitation', 'productivity'],
    description: 'Create focused meeting agendas that respect everyone\'s time.',
    promptText: `Hello ChatGPT,
Create an agenda for my upcoming meeting.

● Meeting Type: [Standup / Planning / Review / Retro / One-on-one / Workshop]
● Duration: [X minutes]
● Participants: [Number and roles]
● Key Outcomes Needed: [What decisions or outputs?]
● Pre-work Required: [What should participants prepare?]
● Recurring or One-off: [Recurring / One-time]

Provide:
1. Meeting objective (1 sentence)
2. Timed agenda (each topic with time allocation)
3. Facilitation notes for each agenda item
4. Decision-making process for each discussion point
5. Action items template
6. Follow-up communication template`,
    placeholders: ['[Meeting type]', '[X minutes]', '[Participant roles]', '[Desired outcomes]', '[Pre-work]', '[Recurring / One-time]'],
  },
  {
    promptId: 'PM_005', category: 'Project Management', subcategory: 'Stakeholder',
    title: 'Stakeholder Communication Plan',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['stakeholder', 'communication', 'reporting', 'management'],
    description: 'Design a stakeholder communication plan with reporting templates.',
    promptText: `Hello ChatGPT,
Create a stakeholder communication plan for my project.

● Project Name: [Insert name]
● Key Stakeholders: [List names, roles, and interests]
● Project Complexity: [Low / Medium / High]
● Communication Preferences: [Email / Slack / In-person / Dashboard / Weekly report]
● Reporting Cadence: [Daily / Weekly / Monthly / Milestone-based]

Provide:
1. Stakeholder matrix (interest vs influence grid)
2. Communication frequency and channel per stakeholder group
3. Status report template
4. Escalation path
5. Meeting rhythm (who, when, how often)
6. Feedback collection method
7. Communication plan for project changes or issues`,
    placeholders: ['[Project name]', '[Stakeholder list]', '[Low / Medium / High]', '[Preferred channels]', '[Cadence]'],
  },
  {
    promptId: 'PM_006', category: 'Project Management', subcategory: 'Documentation',
    title: 'Project Documentation & Wiki Generator',
    difficulty: 'beginner', estimatedTime: '12 min',
    tags: ['documentation', 'wiki', 'knowledge-base', 'handbook'],
    description: 'Create comprehensive project documentation and team wikis.',
    promptText: `Hello ChatGPT,
Create project documentation for my team.

● Project Name: [Insert name]
● Team: [List team members and roles]
● Tech Stack (if applicable): [List technologies]
● Repository URL: [Insert URL]
● Key Documents Already Exist: [List existing documentation]

Generate:
1. README template (project overview, setup, usage)
2. Architecture documentation outline
3. Onboarding guide for new team members
4. API documentation structure
5. Development workflow (branching, PR, review process)
6. Deployment process documentation
7. Troubleshooting guide template
8. FAQ section`,
    placeholders: ['[Project name]', '[Team and roles]', '[Tech stack]', '[Repo URL]', '[Existing docs]'],
  },

  // === Additional Health & Fitness Prompts ===
  {
    promptId: 'HLT_002', category: 'Health & Fitness', subcategory: 'Nutrition',
    title: 'Personalized Meal Plan & Nutrition Guide',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['nutrition', 'meal-plan', 'diet', 'health'],
    description: 'Create a customized meal plan based on your goals and preferences.',
    promptText: `Hello ChatGPT,
Create a personalized meal plan for my nutrition goals.

● Primary Goal: [Weight loss / Muscle gain / Maintenance / Energy / Specific health]
● Dietary Preference: [Omnivore / Vegetarian / Vegan / Keto / Paleo / Mediterranean]
● Calories Target: [Insert or "I don't know"]
● Meals Per Day: [3 / 4 / 5 / 6]
● Foods I Like: [List preferred foods]
● Foods to Avoid: [Allergies, dislikes, intolerances]
● Cooking Time Available: [15 / 30 / 60 minutes per meal]

Generate:
1. Daily macro breakdown (protein, carbs, fat)
2. 7-day meal plan with breakfast, lunch, dinner, snacks
3. Grocery shopping list for the week
4. Meal prep instructions (Sunday prep)
5. Hydration and supplement recommendations`,
    placeholders: ['[Weight loss / Muscle gain / Maintenance / Energy]', '[Dietary preference]', '[Calories or "I don\'t know"]', '[3 / 4 / 5 / 6]', '[Preferred foods]', '[Foods to avoid]', '[Cooking time]'],
  },
  {
    promptId: 'HLT_003', category: 'Health & Fitness', subcategory: 'Mental Health',
    title: 'Mindfulness & Stress Management Plan',
    difficulty: 'beginner', estimatedTime: '8 min',
    tags: ['mindfulness', 'stress', 'mental-health', 'wellness'],
    description: 'Create a personalized mindfulness and stress management routine.',
    promptText: `Hello ChatGPT,
Create a mindfulness and stress management routine.

● Current Stress Level: [1-10]
● Primary Stressors: [Work / Relationships / Health / Finances / Other]
● Time Available Daily: [5 / 10 / 15 / 30 minutes]
● Previous Experience: [None / Beginner / Intermediate / Advanced]
● Preferred Approach: [Meditation / Journaling / Breathing / Movement / Combination]
● Current Coping Mechanisms: [Describe what you do now]

Create:
1. Daily mindfulness routine (time-boxed)
2. 3 breathing exercises for acute stress moments
3. Journaling prompts for emotional processing
4. Body scan or relaxation script
5. Weekly check-in questions
6. Progress tracking method
7. Signs you need professional support`,
    placeholders: ['[1-10]', '[Stressors]', '[Time available]', '[Experience level]', '[Preferred approach]', '[Current coping]'],
  },
  {
    promptId: 'HLT_004', category: 'Health & Fitness', subcategory: 'Sleep',
    title: 'Sleep Optimization Protocol',
    difficulty: 'beginner', estimatedTime: '8 min',
    tags: ['sleep', 'recovery', 'circadian-rhythm', 'health'],
    description: 'Design a science-based sleep optimization protocol.',
    promptText: `Hello ChatGPT,
Create a sleep optimization protocol for better rest.

● Current Sleep Duration: [X hours per night]
● Sleep Quality: [Poor / Fair / Good]
● Bedtime: [Current bedtime]
● Wake Time: [Current wake time]
● Sleep Issues: [Falling asleep / Staying asleep / Waking early / Restless / Snoring]
● Caffeine Intake: [When and how much?]
● Screen Time Before Bed: [X hours/minutes]
● Exercise Routine: [Describe]

Provide:
1. Ideal sleep schedule recommendation
2. Bedtime routine (60 minutes before sleep)
3. Morning routine for circadian rhythm alignment
4. Environment optimization (temperature, light, noise)
5. Food and drink timing guide
6. Supplement considerations
7. Tracking and adjustment method`,
    placeholders: ['[X hours]', '[Poor / Fair / Good]', '[Bedtime]', '[Wake time]', '[Sleep issues]', '[Caffeine]', '[Screen time]', '[Exercise]'],
  },
  {
    promptId: 'HLT_005', category: 'Health & Fitness', subcategory: 'Recovery',
    title: 'Post-Workout Recovery & Mobility Plan',
    difficulty: 'beginner', estimatedTime: '8 min',
    tags: ['recovery', 'mobility', 'stretching', 'injury-prevention'],
    description: 'Design a recovery and mobility routine to complement your training.',
    promptText: `Hello ChatGPT,
Create a post-workout recovery and mobility plan.

● Training Type: [Strength / Running / HIIT / Sports / General fitness]
● Training Frequency: [X sessions per week]
● Current Recovery Practices: [Stretching / Foam rolling / Nothing]
● Problem Areas: [Tight hamstrings / Sore lower back / Shoulder tightness / Knees / Other]
● Time Available for Recovery: [10 / 15 / 20 / 30 minutes per session]

Provide:
1. Post-workout cool-down routine (5-10 min)
2. Mobility routine for problem areas (10 min)
3. Active recovery day plan
4. Foam rolling / self-massage guide
5. Stretching progression (weeks 1-4)
6. Signs of overtraining to watch for
7. Sleep and nutrition for recovery`,
    placeholders: ['[Strength / Running / HIIT / Sports / General]', '[X sessions/week]', '[Current practices]', '[Problem areas]', '[Time available]'],
  },
  {
    promptId: 'HLT_006', category: 'Health & Fitness', subcategory: 'Habit Building',
    title: 'Habit Building & Behavior Change System',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['habits', 'behavior-change', 'productivity', 'goals'],
    description: 'Design a habit-building system using behavioral science principles.',
    promptText: `Hello ChatGPT,
Help me build a habit system for my goals.

● Goal: [Describe the habit you want to build]
● Current Behavior: [What you do now instead]
● Motivation Level (1-10): [Insert number]
● Past Attempts: [What has/hasn't worked before]
● Environment: [What in your environment helps or hurts?]
● Accountability Preference: [Self / Buddy / Coach / App / Public]

Design a habit system:
1. Tiny habit version (2-minute minimum viable version)
2. Implementation intention (When/Where I will do it)
3. Habit stacking (attach to existing habit)
4. Environment design changes
5. Tracking method
6. Reward system
7. Recovery plan (what happens when you miss a day)
8. 30-day progression plan`,
    placeholders: ['[Describe habit]', '[Current behavior]', '[Motivation level]', '[Past attempts]', '[Environment]', '[Accountability preference]'],
  },

  // === Additional Prompt Engineering Prompts ===
  {
    promptId: 'PE_003', category: 'Prompt Engineering', subcategory: 'Chain-of-Thought',
    title: 'Chain-of-Thought Prompt Builder',
    difficulty: 'intermediate', estimatedTime: '10 min',
    tags: ['chain-of-thought', 'reasoning', 'prompt-engineering'],
    description: 'Design chain-of-thought prompts that force logical reasoning.',
    promptText: `Hello ChatGPT,
Create a chain-of-thought prompting strategy for my use case.

● Task Type: [Math / Logic / Analysis / Planning / Decision / Explanation]
● Complexity: [Simple / Moderate / Complex / Multi-step]
● Desired Output Format: [Final answer / Step-by-step / Both]
● Data/Context Available: [Describe available information]
● Common Errors AI Makes: [What goes wrong without CoT?]

Provide:
1. Optimized chain-of-thought prompt
2. Step-by-step reasoning framework to include in the prompt
3. Example of expected reasoning pattern
4. Verification step prompt (to catch errors)
5. Variations for different scenarios
6. When to use CoT vs direct prompting`,
    placeholders: ['[Math / Logic / Analysis / Planning / Decision / Explanation]', '[Simple / Moderate / Complex]', '[Final answer / Step-by-step / Both]', '[Available info]', '[Common errors]'],
  },
  {
    promptId: 'PE_004', category: 'Prompt Engineering', subcategory: 'Templates',
    title: 'Prompt Template Library Builder',
    difficulty: 'beginner', estimatedTime: '15 min',
    tags: ['templates', 'library', 'prompts', 'reusable'],
    description: 'Build a library of reusable prompt templates for common tasks.',
    promptText: `Hello ChatGPT,
Create a library of reusable prompt templates.

● My Primary Use Cases: [Writing / Analysis / Coding / Research / Planning / Marketing]
● Number of Templates: [5 / 10 / 15 / 20]
● AI Tool: [ChatGPT / Claude / Gemini / Mixed]
● Skill Level: [Beginner / Intermediate / Advanced]

Create a prompt template library with:
1. Template name and category
2. When to use this template
3. Complete template with [PLACEHOLDERS]
4. Example filled-in version
5. Tips for customization`,
    placeholders: ['[Use cases]', '[5 / 10 / 15 / 20]', '[ChatGPT / Claude / Gemini / Mixed]', '[Beginner / Intermediate / Advanced]'],
  },
  {
    promptId: 'PE_005', category: 'Prompt Engineering', subcategory: 'Evaluation',
    title: 'Prompt Output Evaluation & Improvement System',
    difficulty: 'advanced', estimatedTime: '12 min',
    tags: ['evaluation', 'quality', 'improvement', 'testing'],
    description: 'Create a system to evaluate and iteratively improve prompt outputs.',
    promptText: `Hello ChatGPT,
Design a prompt evaluation system to assess and improve AI outputs.

● My Prompt: [PASTE YOUR PROMPT HERE]
● Output Purpose: [What should the output accomplish?]
● Quality Criteria: [Accuracy / Relevance / Tone / Format / Completeness / Creativity]
● Current Issues: [Describe output problems]

Provide:
1. Evaluation rubric (score 1-5 for each criterion)
2. Evaluation of my current prompt using the rubric
3. Specific improvement recommendations
4. Rewritten prompt with improvements
5. A/B test methodology for prompt versions
6. Automated evaluation prompt (to have AI evaluate its own output)`,
    placeholders: ['[PASTE PROMPT]', '[Output purpose]', '[Quality criteria]', '[Current issues]'],
  },
  {
    promptId: 'PE_006', category: 'Prompt Engineering', subcategory: 'Workflow',
    title: 'Multi-Step Prompt Workflow Designer',
    difficulty: 'advanced', estimatedTime: '18 min',
    tags: ['workflow', 'multi-step', 'pipeline', 'automation'],
    description: 'Design multi-step prompt workflows for complex tasks.',
    promptText: `Hello ChatGPT,
Design a multi-step prompt workflow for my complex task.

● Task Description: [Describe the overall goal]
● Number of Steps: [X steps]
● Input Type: [Text / Data / URL / Image / Mixed]
● Output Goal: [Final deliverable description]
● AI Tools Available: [ChatGPT / Claude / Gemini / Other]
● Automation Tool: [Manual / Zapier / Make / Python script]

Design a workflow:
1. Step 1: Input processing prompt
2. Step 2: Analysis/generation prompt
3. Step 3: Refinement prompt
4. Step 4: Formatting/output prompt
5. Step 5: Quality check prompt
6. Data handoff between steps (what passes from one to the next)
7. Error handling at each step
8. Final output template`,
    placeholders: ['[Describe goal]', '[X steps]', '[Input type]', '[Output goal]', '[AI tools]', '[Automation tool]'],
  },
  {
    promptId: 'PE_007', category: 'Prompt Engineering', subcategory: 'System Prompts',
    title: 'Persona-Based Prompt Designer',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['persona', 'role', 'character', 'system-prompt'],
    description: 'Design detailed AI personas with expertise, tone, and constraints.',
    promptText: `Hello ChatGPT,
Create a detailed persona prompt for my AI assistant.

● Persona Role: [Job title or archetype]
● Expertise Level: [Junior / Mid / Senior / World-class]
● Industry: [Insert industry]
● Communication Style: [Formal / Casual / Technical / Inspirational / Humorous]
● Persona Background: [Describe backstory, experience, credentials]
● Key Behaviors: [List 4-6 behaviors this persona should exhibit]
● Constraints: [What should this persona NOT do or say?]
● Output Preferences: [Length, format, structure]

Generate:
1. Complete persona system prompt
2. Example interactions (persona in action)
3. Activation phrase or scenario
4. Boundary conditions (when to drop persona)
5. Customization notes for different contexts`,
    placeholders: ['[Role/archetype]', '[Expertise level]', '[Industry]', '[Communication style]', '[Backstory]', '[Key behaviors]', '[Constraints]', '[Output preferences]'],
  },
  {
    promptId: 'PE_008', category: 'Prompt Engineering', subcategory: 'Meta-Prompting',
    title: 'Meta-Prompt Creator (Prompts That Write Prompts)',
    difficulty: 'advanced', estimatedTime: '15 min',
    tags: ['meta-prompt', 'prompt-generation', 'automation'],
    description: 'Create meta-prompts that instruct AI to generate effective prompts.',
    promptText: `Hello ChatGPT,
Create a meta-prompt that instructs AI to generate effective prompts.

● Domain: [Write / Marketing / Code / Research / Creative / Business]
● Target User Skill Level: [Beginner / Intermediate / Advanced]
● Prompt Generation Goal: [Create prompts that are detailed / concise / creative / structured]
● Variables to Include: [Role / Context / Task / Format / Constraints / Examples]
● Output Prompt Style: [Template / Bullet list / Paragraph / Hybrid]

Generate:
1. The meta-prompt (prompt that generates prompts)
2. Example usage: what it produces when given a topic
3. Customization guide
4. Advanced variations (for different domains)
5. Self-improvement mechanism (how the meta-prompt evolves)`,
    placeholders: ['[Domain]', '[Skill level]', '[Generation goal]', '[Variables]', '[Output style]'],
  },

  // === Additional eCommerce & Customer Support Prompts ===
  {
    promptId: 'ECOM_002', category: 'eCommerce & Customer Support', subcategory: 'Customer Service',
    title: 'Customer Service Response Template Library',
    difficulty: 'beginner', estimatedTime: '12 min',
    tags: ['customer-service', 'support', 'templates', 'responses'],
    description: 'Generate a library of customer service response templates for common scenarios.',
    promptText: `Hello ChatGPT,
Create customer service response templates for my business.

● Business Type: [E-commerce / SaaS / Agency / Service / Physical product]
● Brand Voice: [Friendly / Professional / Casual / Empathetic / Efficient]
● Common Support Scenarios: [Refunds / Shipping delays / Technical issues / Account problems / Product questions]
● Average Response Time Goal: [Within X hours]

Generate response templates for:
1. Order status inquiry
2. Refund/return request
3. Shipping delay notification
4. Technical issue troubleshooting
5. Account access problem
6. Product question/uncertainty
7. Complaint/escalation handling
8. Positive feedback acknowledgment
For each: subject line (if email), opening, body, closing, CTA`,
    placeholders: ['[Business type]', '[Brand voice]', '[Common scenarios]', '[Response time goal]'],
  },
  {
    promptId: 'ECOM_003', category: 'eCommerce & Customer Support', subcategory: 'Product Launch',
    title: 'Product Launch Campaign Planner',
    difficulty: 'intermediate', estimatedTime: '20 min',
    tags: ['product-launch', 'ecommerce', 'campaign', 'marketing'],
    description: 'Plan a complete product launch campaign with channel strategy.',
    promptText: `Hello ChatGPT,
Create a product launch campaign for my new product.

● Product Name: [Insert name]
● Product Category: [Insert category]
● Target Audience: [Describe ideal customer]
● Price Point: [Insert price]
● Launch Date: [Insert date]
● Pre-orders Available: [Yes / No]
● Existing Customers: [X email subscribers, X social followers]
● Budget: [Insert budget]

Create a launch plan:
1. Pre-launch phase (2-4 weeks before)
   - Teaser campaign
   - Email sequence (3 emails)
   - Social media countdown
2. Launch day plan
   - Announcement copy (email + social)
   - Influencer/affiliate activation
   - Paid ad setup
3. Post-launch phase (2 weeks after)
   - Social proof campaign
   - Follow-up email sequence
   - Retargeting strategy
4. Success metrics and tracking`,
    placeholders: ['[Product name]', '[Category]', '[Target audience]', '[Price]', '[Launch date]', '[Yes / No]', '[Audience size]', '[Budget]'],
  },
  {
    promptId: 'ECOM_004', category: 'eCommerce & Customer Support', subcategory: 'Reviews',
    title: 'Review & Testimonial Collection System',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['reviews', 'testimonials', 'social-proof', 'ecommerce'],
    description: 'Design a system to collect and leverage customer reviews and testimonials.',
    promptText: `Hello ChatGPT,
Create a review and testimonial collection system.

● Business Type: [Product / Service / SaaS / Course]
● Current Review Volume: [X reviews per month]
● Platforms: [Website / Amazon / Google / Yelp / Trustpilot]
● Incentive for Reviews: [Discount / Freebie / Contest / None]
● Customer Follow-up: [Automated / Manual / None]

Provide:
1. Review request email template (3 variations)
2. SMS review request template
3. In-product review prompt design
4. Video testimonial request script
5. Incentive strategy (ethical and compliant)
6. Responding to negative reviews (template)
7. Replying to positive reviews (template)
8. Social proof aggregation strategy`,
    placeholders: ['[Product / Service / SaaS / Course]', '[X per month]', '[Platforms]', '[Incentive]', '[Automated / Manual / None]'],
  },
  {
    promptId: 'ECOM_005', category: 'eCommerce & Customer Support', subcategory: 'Abandoned Cart',
    title: 'Abandoned Cart Recovery Email Sequence',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['abandoned-cart', 'recovery', 'email', 'ecommerce'],
    description: 'Create a high-converting abandoned cart email sequence.',
    promptText: `Hello ChatGPT,
Create an abandoned cart recovery email sequence.

● Product(s) in Cart: [Describe product and price]
● Average Order Value: [Insert amount]
● Abandonment Rate: [X% or "unknown"]
● Brand Voice: [Describe tone]
● Incentives Available: [Discount / Free shipping / Bonus / None]
● CTA Goal: [Complete purchase]

Create a 3-email sequence:
1. Email 1 (1 hour after abandonment):
   - Friendly reminder, product benefit reminder
   - No discount yet (protect margin)
2. Email 2 (24 hours after):
   - Social proof (reviews, popularity)
   - Address objections
3. Email 3 (72 hours after):
   - Incentive (if available) or scarcity message
   - Final reminder
Each email: subject line, preview text, body, CTA`,
    placeholders: ['[Product and price]', '[AOV]', '[Abandonment rate]', '[Brand voice]', '[Incentives]', '[Complete purchase]'],
  },
  {
    promptId: 'ECOM_006', category: 'eCommerce & Customer Support', subcategory: 'Upsell',
    title: 'Post-Purchase Upsell & Cross-Sell System',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['upsell', 'cross-sell', 'post-purchase', 'revenue'],
    description: 'Design post-purchase upsell and cross-sell strategies that increase AOV.',
    promptText: `Hello ChatGPT,
Create a post-purchase upsell and cross-sell strategy.

● Main Products: [List product categories]
● Average Order Value: [Insert amount]
● Customer Segments: [New / Repeat / VIP]
● Upsell Options Available: [Product upgrades / Bundles / Add-ons / Subscriptions]
● Timing: [Immediate / Next day / Next week]

Provide:
1. Post-purchase thank you page upsell strategy
2. Email upsell sequence (3 emails)
3. Product bundle recommendations (3 bundles)
4. Subscription upgrade offer script
5. VIP/loyalty program cross-sell
6. Analytics to track upsell performance
7. A/B test ideas for upsell offers`,
    placeholders: ['[Product categories]', '[AOV]', '[Customer segments]', '[Upsell options]', '[Timing]'],
  },

  // === Additional Travel & Lifestyle Prompts ===
  {
    promptId: 'TRV_002', category: 'Travel & Lifestyle', subcategory: 'Packing',
    title: 'Smart Packing List Generator',
    difficulty: 'beginner', estimatedTime: '5 min',
    tags: ['packing', 'travel', 'luggage', 'preparation'],
    description: 'Generate a customized packing list for any trip.',
    promptText: `Hello ChatGPT,
Create a packing list for my trip.

● Destination: [City/Country]
● Trip Duration: [X days]
● Climate/Weather: [Hot / Cold / Rainy / Mixed / Unknown]
● Activities Planned: [Beach / Hiking / Business / Sightseeing / Adventure]
● Accommodation Type: [Hotel / Hostel / Camping / Airbnb / Family]
● Luggage Type: [Carry-on / Checked / Backpack]
● Special Needs: [Medication / Equipment / Documents]

Generate:
1. Clothing packing list (by category with quantities)
2. Toiletries and personal care
3. Electronics and chargers
4. Documents and money
5. First-aid and health items
6. Activity-specific gear
7. Optional / nice-to-have items
8. Weight/space optimization tips`,
    placeholders: ['[Destination]', '[X days]', '[Weather]', '[Activities]', '[Accommodation]', '[Luggage type]', '[Special needs]'],
  },
  {
    promptId: 'TRV_003', category: 'Travel & Lifestyle', subcategory: 'Budget',
    title: 'Travel Budget & Cost Estimator',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['budget', 'travel', 'costs', 'planning'],
    description: 'Estimate your complete travel budget with cost breakdowns.',
    promptText: `Hello ChatGPT,
Create a travel budget estimate for my trip.

● Destination: [City/Country]
● Trip Duration: [X days]
● Traveller Type: [Solo / Couple / Family / Group of X]
● Accommodation Budget: [Budget / Mid-range / Luxury]
● Activities: [Adventure / Relaxation / Cultural / Mixed]
● Meals: [Budget / Mid-range / Fine dining / Mixed]
● Transportation: [Flights booked / Need to book / Public transport / Rental car]
● Currency: [Local currency]

Provide:
1. Estimated daily budget breakdown
2. Accommodation cost estimate (per night, total)
3. Food and dining budget (per meal, per day)
4. Transportation costs (local + inter-city)
5. Activities and entertainment budget
6. Miscellaneous and contingency (10-15%)
7. Total estimated trip cost
8. Money-saving tips for this destination`,
    placeholders: ['[Destination]', '[X days]', '[Traveller type]', '[Accommodation budget]', '[Activities]', '[Meals]', '[Transport]', '[Currency]'],
  },
  {
    promptId: 'TRV_004', category: 'Travel & Lifestyle', subcategory: 'Language',
    title: 'Travel Phrasebook Creator',
    difficulty: 'beginner', estimatedTime: '5 min',
    tags: ['language', 'phrases', 'travel', 'communication'],
    description: 'Generate a custom travel phrasebook for your destination.',
    promptText: `Hello ChatGPT,
Create a travel phrasebook for my destination.

● Destination: [Country/City]
● Language: [Local language]
● My Proficiency: [None / Beginner / Some basics]
● Situations: [Restaurant / Hotel / Shopping / Transport / Emergency / Social]
● Phrases Needed: [20 / 30 / 50 / 100]

Generate a phrasebook with:
1. Greetings and pleasantries
2. Restaurant and food phrases
3. Hotel and accommodation
4. Shopping and bargaining
5. Directions and transportation
6. Emergency and health
7. Numbers and money
8. Cultural etiquette tips
For each phrase: English → Local language → Pronunciation guide`,
    placeholders: ['[Destination]', '[Language]', '[Proficiency]', '[Situations]', '[Number of phrases]'],
  },
  {
    promptId: 'TRV_005', category: 'Travel & Lifestyle', subcategory: 'Photo',
    title: 'Travel Photography Shot List & Tips',
    difficulty: 'beginner', estimatedTime: '8 min',
    tags: ['photography', 'travel', 'tips', 'shots'],
    description: 'Create a photography shot list and tips for your trip.',
    promptText: `Hello ChatGPT,
Create a travel photography guide for my trip.

● Destination: [City/Country]
● Camera Type: [Phone / DSLR / Mirrorless / Action cam]
● Photography Skill Level: [Beginner / Intermediate / Advanced]
● Subjects I Want to Capture: [Landscapes / People / Food / Architecture / Street / Wildlife]
● Golden Hour Times: [Sunrise / Sunset times if known]
● Special Events: [Festivals / Markets / Ceremonies]

Provide:
1. Shot list by location and time of day
2. Camera settings recommendations for each scenario
3. Composition tips for travel photography
4. Editing workflow (apps and steps)
5. Packing list for photography gear
6. Local photography etiquette and rules
7. Instagram-worthy location suggestions`,
    placeholders: ['[Destination]', '[Camera type]', '[Skill level]', '[Subjects]', '[Golden hour]', '[Events]'],
  },
  {
    promptId: 'TRV_006', category: 'Travel & Lifestyle', subcategory: 'Digital Nomad',
    title: 'Digital Nomad Destination & Setup Guide',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['digital-nomad', 'remote-work', 'travel', 'lifestyle'],
    description: 'Plan a digital nomad trip with work-friendly destinations and setups.',
    promptText: `Hello ChatGPT,
Help me plan a digital nomad trip.

● Job Type: [Remote employee / Freelancer / Business owner]
● Work Hours Needed: [Weekly hours, timezone requirements]
● Monthly Budget: [Accommodation + living costs]
● Preferred Regions: [Southeast Asia / Europe / Latin America / Any]
● Internet Requirements: [Speed needed, reliability]
● Duration: [1 / 3 / 6 / 12 months]
● Visa Requirements: [Need visa / Visa-free / Digital nomad visa]

Provide:
1. Top 3 destination recommendations with reasoning
2. Cost of living breakdown per destination
3. Co-working spaces and café recommendations
4. Accommodation options (short and long-term)
5. Internet reliability and backup plan
6. Time zone analysis for work
7. Visa and legal considerations
8. Community and networking opportunities
9. Packing list for digital nomads`,
    placeholders: ['[Job type]', '[Work hours]', '[Monthly budget]', '[Preferred regions]', '[Internet needs]', '[Duration]', '[Visa]'],
  },

  // === Additional Web Design & UX Prompts ===
  {
    promptId: 'WEB_002', category: 'Web Design & UX', subcategory: 'UX Research',
    title: 'User Research & Usability Test Plan',
    difficulty: 'intermediate', estimatedTime: '18 min',
    tags: ['ux', 'research', 'usability', 'testing', 'user'],
    description: 'Design a user research study and usability testing plan.',
    promptText: `Hello ChatGPT,
Design a user research plan for my website/app.

● Product/Website: [Insert name and description]
● Research Goal: [What do you want to learn?]
● Target Users: [Describe user demographics and behaviours]
● Current Stage: [Pre-launch / Early / Growth / Mature]
● Research Budget: [Low / Medium / High]
● Timeline: [X weeks]
● Stakeholders: [Who needs to see results?]

Design a research plan:
1. Research questions (5-10 questions)
2. Methodology recommendation (interviews / surveys / usability tests / analytics)
3. Participant recruitment criteria and screener
4. Interview/discussion guide (15-20 questions)
5. Usability test tasks (5-7 tasks)
6. Success metrics for each task
7. Analysis plan
8. Report template structure
9. Recommended tools`,
    placeholders: ['[Product name]', '[Research goal]', '[Target users]', '[Stage]', '[Budget]', '[Timeline]', '[Stakeholders]'],
  },
  {
    promptId: 'WEB_003', category: 'Web Design & UX', subcategory: 'Information Architecture',
    title: 'Website IA & Sitemap Generator',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['ia', 'sitemap', 'navigation', 'structure'],
    description: 'Design your website information architecture and sitemap.',
    promptText: `Hello ChatGPT,
Design the information architecture and sitemap for my website.

● Website Type: [Blog / E-commerce / SaaS / Portfolio / Business / Education]
● Main Content Categories: [List 3-7 main categories]
● User Types: [List user personas]
● Key User Tasks: [Top 5 things users come to do]
● Pages Already Planned: [List existing page ideas]
● Competitor Sites: [List competitor URLs for reference]

Provide:
1. Site structure / hierarchy (visual tree)
2. Navigation labels (primary, secondary, footer)
3. URL structure recommendation
4. Page template types needed
5. Content grouping rationale
6. Search and filter strategy
7. Breadcrumb navigation design
8. Suggested CMS structure`,
    placeholders: ['[Website type]', '[Main categories]', '[User types]', '[Key tasks]', '[Existing pages]', '[Competitor URLs]'],
  },
  {
    promptId: 'WEB_004', category: 'Web Design & UX', subcategory: 'Accessibility',
    title: 'Web Accessibility (WCAG) Audit Checklist',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['accessibility', 'wcag', 'a11y', 'inclusive'],
    description: 'Generate a WCAG compliance checklist for your website.',
    promptText: `Hello ChatGPT,
Create a web accessibility audit checklist for my website.

● Website Type: [Public / Internal tool / E-commerce / Government / Educational]
● Current Compliance Level: [None / Basic / AA target / AAA target]
● Known Issues: [List known accessibility problems]
● Pages to Audit: [Number of pages or specific pages]
● Tools Available: [Accessibility tools you have]

Generate a WCAG 2.1 checklist:
1. Perceivable (text alternatives, captions, adaptable, distinguishable)
2. Operable (keyboard accessible, enough time, seizures, navigable)
3. Understandable (readable, predictable, input assistance)
4. Robust (compatible with current/future tools)
5. Priority-ranked fix list (critical → high → medium → low)
6. Testing methodology (automated + manual)
7. Remediation timeline recommendation`,
    placeholders: ['[Website type]', '[Compliance level]', '[Known issues]', '[Pages to audit]', '[Tools available]'],
  },
  {
    promptId: 'WEB_005', category: 'Web Design & UX', subcategory: 'Wireframing',
    title: 'Wireframe & Mockup Content Generator',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['wireframe', 'mockup', 'content', 'placeholder'],
    description: 'Generate realistic content for wireframes and design mockups.',
    promptText: `Hello ChatGPT,
Generate realistic placeholder content for my design mockups.

● Page Type: [Landing page / Dashboard / Product page / Blog / Profile / Settings]
● Industry: [Insert industry]
● Target Audience: [Describe user]
● Brand Tone: [Insert 3 adjectives]
● Sections Needed: [List sections of the page]

Generate realistic content:
1. Page headline and subheadline
2. Navigation labels (5-7 items)
3. Body copy for each section
4. Button text (primary and secondary CTAs)
5. Form labels and placeholder text
6. Error and success messages
7. User profile names and bios
8. Product names, prices, descriptions
9. Testimonial quotes with fictional names
10. Image alt text descriptions`,
    placeholders: ['[Page type]', '[Industry]', '[Target audience]', '[Brand tone]', '[Sections]'],
  },
  {
    promptId: 'WEB_006', category: 'Web Design & UX', subcategory: 'Analytics',
    title: 'Web Analytics & Conversion Tracking Setup',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['analytics', 'tracking', 'conversion', 'ga4', 'data'],
    description: 'Set up web analytics and conversion tracking for data-driven decisions.',
    promptText: `Hello ChatGPT,
Help me set up web analytics and conversion tracking.

● Website URL: [Insert URL]
● Analytics Platform: [Google Analytics 4 / Plausible / Mixpanel / Heap / Matomo]
● Business Model: [E-commerce / Lead gen / Content / SaaS / Subscription]
● Key Conversion Events: [Purchases / Sign-ups / Form fills / Downloads / Calls]
● Current Tracking Status: [Not set up / Basic / Partial / Needs audit]

Provide:
1. Setup checklist for chosen platform
2. Key events to track (with implementation notes)
3. Conversion funnel definition
4. Goal configuration steps
5. Dashboard/report design (key KPIs to monitor)
6. UTM parameter strategy for campaigns
7. E-commerce tracking setup (if applicable)
8. Common tracking mistakes and how to avoid them`,
    placeholders: ['[URL]', '[Analytics platform]', '[Business model]', '[Key events]', '[Tracking status]'],
  },

  // === Additional Language Learning Prompts ===
  {
    promptId: 'LANG_002', category: 'Language Learning', subcategory: 'Vocabulary',
    title: 'Vocabulary Builder with Spaced Repetition',
    difficulty: 'beginner', estimatedTime: '8 min',
    tags: ['vocabulary', 'spaced-repetition', 'flashcards', 'learning'],
    description: 'Generate vocabulary lists with spaced repetition scheduling.',
    promptText: `Hello ChatGPT,
Create a vocabulary learning plan for my target language.

● Language: [Insert language]
● Current Level: [Beginner / Intermediate / Advanced]
● Words I Already Know: [Approximate number]
● Theme/Topic: [Specific topic or general]
● Words Needed: [20 / 50 / 100 / 200]
● Learning Goal: [Conversation / Reading / Writing / Exam prep]

Generate vocabulary list with:
1. Word/phrase in target language
2. English translation
3. Example sentence in context
4. Pronunciation guide
5. Memory technique / mnemonic
6. Spaced repetition schedule (Day 1, 3, 7, 14, 30)
7. Practice exercise using these words`,
    placeholders: ['[Language]', '[Level]', '[Known words]', '[Theme]', '[Number of words]', '[Goal]'],
  },
  {
    promptId: 'LANG_003', category: 'Language Learning', subcategory: 'Grammar',
    title: 'Grammar Concept Explainer & Practice',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['grammar', 'explanation', 'practice', 'exercises'],
    description: 'Get clear grammar explanations with practice exercises.',
    promptText: `Hello ChatGPT,
Explain a grammar concept and provide practice exercises.

● Language: [Insert language]
● Concept: [Grammar rule or concept to explain]
● My Level: [Beginner / Intermediate / Advanced]
● My Native Language: [Insert native language]
● Confusion Points: [What specifically is confusing?]
● Learning Style: [Rules-first / Examples-first / Both]

Provide:
1. Clear explanation (with comparison to English/native language)
2. 5 example sentences with breakdown
3. Common mistakes learners make
4. 10 practice exercises (fill-in-the-blank / transformation / translation)
5. Answer key with explanations
6. Next concept to learn after mastering this one`,
    placeholders: ['[Language]', '[Grammar concept]', '[Level]', '[Native language]', '[Confusion points]', '[Learning style]'],
  },
  {
    promptId: 'LANG_004', category: 'Language Learning', subcategory: 'Pronunciation',
    title: 'Pronunciation Coach & Minimal Pair Drill',
    difficulty: 'beginner', estimatedTime: '8 min',
    tags: ['pronunciation', 'speaking', 'accent', 'phonetics'],
    description: 'Practice challenging sounds and improve pronunciation.',
    promptText: `Hello ChatGPT,
Help me improve my pronunciation in my target language.

● Language: [Insert language]
● My Native Language: [Insert native language]
● Sounds I Struggle With: [Specific sounds or "not sure"]
● Current Level: [Beginner / Intermediate / Advanced]
● Practice Time Available: [5 / 10 / 15 minutes daily]

Provide:
1. Sound inventory of challenging phonemes
2. Minimal pairs for each challenging sound (10 pairs minimum)
3. Tongue/ mouth position guide for each sound
4. Slow practice phrases (5 phrases)
5. Natural speed phrases (5 phrases)
6. Daily practice routine (5 minutes)
7. Recording and self-assessment guide
8. Resources for native audio examples`,
    placeholders: ['[Language]', '[Native language]', '[Problem sounds]', '[Level]', '[Practice time]'],
  },
  {
    promptId: 'LANG_005', category: 'Language Learning', subcategory: 'Reading',
    title: 'Reading Comprehension & Translation Practice',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['reading', 'comprehension', 'translation', 'passages'],
    description: 'Generate reading passages with comprehension questions.',
    promptText: `Hello ChatGPT,
Create a reading comprehension exercise in my target language.

● Language: [Insert language]
● My Level: [Beginner / Intermediate / Advanced]
● Topic Interest: [Insert preferred topic]
● Passage Length: [Short (<100 words) / Medium (100-300) / Long (300-500)]
● Skills to Practice: [General comprehension / Vocabulary / Grammar / Translation]
● Format: [Passage + Questions / Gap-fill / Translation exercise]

Generate:
1. Reading passage on the chosen topic
2. 5 comprehension questions (in target language)
3. 5 vocabulary words from the passage with definitions
4. 3 grammar points highlighted in context
5. Translation exercise (translate 3 key sentences to native language)
6. Discussion questions (for speaking practice)`,
    placeholders: ['[Language]', '[Level]', '[Topic]', '[Passage length]', '[Skills to practice]', '[Format]'],
  },
  {
    promptId: 'LANG_006', category: 'Language Learning', subcategory: 'Culture',
    title: 'Cultural Context & Etiquette Guide',
    difficulty: 'beginner', estimatedTime: '8 min',
    tags: ['culture', 'etiquette', 'customs', 'communication'],
    description: 'Learn cultural norms and etiquette for effective communication.',
    promptText: `Hello ChatGPT,
Teach me about the cultural context and etiquette for my target language.

● Language: [Insert language]
● Country/Region: [Insert country]
● Situation: [Business / Social / Travel / Formal / Casual]
● My Cultural Background: [Describe your culture]
● Purpose: [Avoid faux pas / Build relationships / Understand media]

Provide:
1. Communication style (direct vs indirect, formal vs informal)
2. Greetings and introductions
3. Gift-giving etiquette
4. Dining and socializing norms
5. Business meeting etiquette
6. Taboos and sensitive topics
7. Non-verbal communication (gestures, eye contact, personal space)
8. Cultural values and beliefs that shape communication
9. Language register (formal vs informal, when to use which)`,
    placeholders: ['[Language]', '[Country]', '[Situation]', '[Your culture]', '[Purpose]'],
  },

  // === Additional Logistics & Supply Chain Prompts ===
  {
    promptId: 'LOG_002', category: 'Logistics & Supply Chain', subcategory: 'Inventory',
    title: 'Inventory Management System Design',
    difficulty: 'advanced', estimatedTime: '18 min',
    tags: ['inventory', 'stock', 'warehouse', 'management'],
    description: 'Design an inventory management system with reorder points and ABC analysis.',
    promptText: `Hello ChatGPT,
Design an inventory management system for my business.

● Business Type: [Retail / E-commerce / Manufacturing / Wholesale]
● Number of SKUs: [X]
● Sales Volume: [High / Medium / Low]
● Storage: [Own warehouse / 3PL / Dropshipping / Mixed]
● Current Method: [Spreadsheet / Software / Manual / None]
● Perishable Items: [Yes / No / Some]
● Lead Times: [Short <1 week / Medium 1-4 weeks / Long >4 weeks]

Provide:
1. ABC classification of inventory
2. Reorder point calculation for each class
3. Safety stock levels
4. Inventory turnover targets
5. Cycle counting schedule
6. Warehouse organization method
7. Software recommendations with justification
8. KPI dashboard design (fill rate, stockout rate, accuracy)
9. Implementation roadmap (30/60/90 days)`,
    placeholders: ['[Business type]', '[X SKUs]', '[Volume]', '[Storage type]', '[Current method]', '[Perishable]', '[Lead times]'],
  },
  {
    promptId: 'LOG_003', category: 'Logistics & Supply Chain', subcategory: 'Shipping',
    title: 'Shipping Strategy & Carrier Optimization',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['shipping', 'carrier', 'costs', 'fulfillment'],
    description: 'Optimize your shipping strategy across carriers and zones.',
    promptText: `Hello ChatGPT,
Optimize my shipping strategy for cost and speed.

● Business Type: [E-commerce / Wholesale / Manufacturing]
● Average Package Weight: [X lbs/kg]
● Average Package Dimensions: [X × Y × Z]
● Monthly Shipments: [X]
● Primary Shipping Zones: [Domestic / International / Specific regions]
● Current Carriers Used: [FedEx / UPS / USPS / DHL / Regional]
● Current Average Shipping Cost: [X per package]
● Free Shipping Threshold: [Insert if applicable]
● Returns Rate: [X%]

Provide:
1. Carrier mix optimization recommendation
2. Rate negotiation preparation (data to gather)
3. Zone skipping analysis
4. Free shipping strategy (threshold optimization)
5. Dimensional weight reduction tips
6. Packaging optimization (reduce size, weight)
7. Returns management strategy
8. International shipping considerations
9. Tracking and reporting setup`,
    placeholders: ['[Business type]', '[Package weight]', '[Dimensions]', '[Monthly volume]', '[Zones]', '[Carriers]', '[Average cost]', '[Free shipping threshold]', '[Returns rate]'],
  },
  {
    promptId: 'LOG_004', category: 'Logistics & Supply Chain', subcategory: 'Supplier',
    title: 'Supplier Evaluation & Selection Framework',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['supplier', 'procurement', 'evaluation', 'sourcing'],
    description: 'Evaluate and select suppliers using a structured framework.',
    promptText: `Hello ChatGPT,
Create a supplier evaluation framework for my sourcing needs.

● Product/Material Needed: [Describe what you need]
● Annual Volume: [X units / value]
● Quality Requirements: [Certifications, standards, tolerances]
● Location Preference: [Domestic / Near-shore / Overseas / Any]
● Budget Range: [Insert budget]
● Timeline: [When do you need to start?]
● Current Suppliers: [List or "none"]

Create a supplier evaluation framework:
1. Evaluation criteria with weights (quality, cost, lead time, reliability, communication)
2. Request for Information (RFI) template
3. Request for Quotation (RFQ) template
4. Supplier scorecard (1-10 rating per criterion)
5. Audit checklist (if visiting facilities)
6. Red flags to watch for
7. Contract terms to negotiate
8. Relationship management plan`,
    placeholders: ['[What you need]', '[Annual volume]', '[Quality requirements]', '[Location preference]', '[Budget]', '[Timeline]', '[Current suppliers]'],
  },
  {
    promptId: 'LOG_005', category: 'Logistics & Supply Chain', subcategory: 'Demand Planning',
    title: 'Demand Forecasting & Planning Model',
    difficulty: 'advanced', estimatedTime: '20 min',
    tags: ['demand-forecasting', 'planning', 'inventory', 'sales'],
    description: 'Build a demand forecasting model for inventory and production planning.',
    promptText: `Hello ChatGPT,
Build a demand forecasting model for my business.

● Business Type: [Retail / E-commerce / Manufacturing / Wholesale]
● Sales Data Available: [X years/months of historical data]
● Number of Products: [X SKUs]
● Seasonality: [Yes / No / Unknown]
● Known Demand Drivers: [Marketing campaigns / Season / Promotions / Trends / External factors]
● Forecast Horizon: [Weekly / Monthly / Quarterly]
● Accuracy Requirements: [What level of error is acceptable?]

[PASTE OR DESCRIBE YOUR DATA]

Provide:
1. Forecasting methodology recommendation
2. Data preparation steps
3. Baseline forecast (if data provided)
4. Seasonality adjustment
5. Promotion/marketing adjustment factor
6. Error measurement approach (MAPE, MAE)
7. Safety stock recommendation based on forecast error
8. Review and adjustment cadence
9. Implementation plan`,
    placeholders: ['[Business type]', '[Data available]', '[X SKUs]', '[Seasonality]', '[Demand drivers]', '[Horizon]', '[Accuracy needs]', '[PASTE DATA]'],
  },
  {
    promptId: 'LOG_006', category: 'Logistics & Supply Chain', subcategory: 'Sustainability',
    title: 'Supply Chain Sustainability & Green Logistics Plan',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['sustainability', 'green', 'carbon', 'environment'],
    description: 'Design a sustainable supply chain strategy with measurable goals.',
    promptText: `Hello ChatGPT,
Create a supply chain sustainability plan for my business.

● Business Type: [Manufacturing / Retail / E-commerce / Logistics]
● Current Sustainability Initiatives: [List or "none"]
● Key Stakeholder Pressure: [Customers / Investors / Regulators / None]
● Budget for Sustainability: [Low / Medium / High]
● Reporting Requirements: [ESG / GHG / None]
● Supply Chain Regions: [List regions]

Provide:
1. Carbon footprint assessment approach
2. Emissions reduction opportunities (scope 1, 2, 3)
3. Sustainable sourcing criteria
4. Packaging optimization (reduce, reuse, recycle)
5. Transportation efficiency (route, mode, fuel)
6. Supplier sustainability requirements
7. Circular economy opportunities
8. Green certification options (B Corp, ISO 14001, etc.)
9. Reporting framework and metrics
10. Implementation timeline with quick wins`,
    placeholders: ['[Business type]', '[Current initiatives]', '[Stakeholder pressure]', '[Budget]', '[Reporting requirements]', '[Regions]'],
  },

  // === Batch 3: Additional Marketing Prompts ===
  {
    promptId: 'MKT_016', category: 'Marketing & Social Media', subcategory: 'Analytics',
    title: 'Marketing Dashboard KPI Definition Guide',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['marketing', 'kpi', 'dashboard', 'metrics'],
    description: 'Define the key marketing KPIs for your dashboard.',
    promptText: `Hello ChatGPT,
Define the key marketing KPIs I should track on my dashboard.

● Business Type: [SaaS / E-commerce / Agency / B2B / B2C]
● Marketing Channels Used: [List active channels]
● Revenue Model: [Subscription / One-time / Lead gen / Affiliate]
● Team Size: [X people]
● Current Tracking Method: [Spreadsheet / Tool / None]

Provide:
1. Top 5 KPIs for my business type with definitions
2. Calculation formula for each
3. Benchmark ranges (good / average / poor)
4. Reporting frequency recommendation
5. Visualization type for each KPI
6. Leading vs lagging indicators`,
    placeholders: ['[Business type]', '[Channels]', '[Revenue model]', '[Team size]', '[Tracking method]'],
  },
  {
    promptId: 'MKT_017', category: 'Marketing & Social Media', subcategory: 'Community',
    title: 'Online Community Engagement Strategy',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['community', 'engagement', 'growth', 'moderation'],
    description: 'Build and engage an online community around your brand.',
    promptText: `Hello ChatGPT,
Create an online community engagement strategy.

● Community Platform: [Discord / Slack / Facebook Group / Circle / Reddit / Custom]
● Community Size: [X members]
● Community Purpose: [Support / Discussion / Networking / Education / Events]
● Target Member: [Describe ideal member]
● Current Engagement Level: [Low / Medium / High]
● Team Capacity: [X community managers]

Provide:
1. Community guidelines template
2. Weekly engagement activities calendar
3. Member onboarding sequence (5 touchpoints)
4. Discussion prompts for each day of the week
5. Moderation strategy
6. Growth initiatives (member-get-member, cross-promotion)
7. Metrics to track (engagement rate, retention, NPS)
8. Monetization opportunities`,
    placeholders: ['[Platform]', '[X members]', '[Purpose]', '[Ideal member]', '[Engagement level]', '[Team size]'],
  },
  {
    promptId: 'MKT_018', category: 'Marketing & Social Media', subcategory: 'Video',
    title: 'Short-Form Video Content Strategy (30 Days)',
    difficulty: 'beginner', estimatedTime: '15 min',
    tags: ['video', 'short-form', 'tiktok', 'reels', 'shorts'],
    description: 'Plan 30 days of short-form video content for any platform.',
    promptText: `Hello ChatGPT,
Create a 30-day short-form video content plan.

● Platform: [TikTok / Instagram Reels / YouTube Shorts]
● Niche: [Insert niche]
● Target Audience: [Describe]
● Posting Frequency: [1x / 2x / 3x per day]  
● Content Pillars: [List 3-5 themes]
● Available Assets: [Stock footage / B-roll / Product shots / None]

For each of 30 days provide:
1. Video topic and angle
2. Hook (first 3 seconds)
3. Script outline (bullet points, 30-60 sec)
4. Visual description
5. Sound/audio trend suggestion
6. Caption and hashtags`,
    placeholders: ['[Platform]', '[Niche]', '[Audience]', '[Frequency]', '[Pillars]', '[Assets]'],
  },
  {
    promptId: 'MKT_019', category: 'Marketing & Social Media', subcategory: 'Affiliate',
    title: 'Affiliate Program Setup & Recruiter',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['affiliate', 'partners', 'commission', 'program'],
    description: 'Design and launch an affiliate program for your product.',
    promptText: `Hello ChatGPT,
Design an affiliate program for my product.

● Product: [Insert name and price]
● Commission Budget: [X% or $X per sale]
● Target Affiliates: [Bloggers / YouTubers / Instagrammers / Email listers / Course creators]
● Current Sales Volume: [X per month]
● Platform: [ShareASale / Impact / FirstPromoter / Custom / None yet]

Provide:
1. Commission structure (tiered if applicable)
2. Affiliate terms and conditions
3. Affiliate recruitment email template
4. Affiliate onboarding sequence (3 emails)
5. Creative assets to provide (banners, links, samples)
6. Tracking and reporting setup
7. Affiliate communication cadence
8. Top performer rewards program`,
    placeholders: ['[Product name/price]', '[Commission]', '[Target affiliates]', '[Monthly sales]', '[Platform]'],
  },
  {
    promptId: 'MKT_020', category: 'Marketing & Social Media', subcategory: 'Personal Brand',
    title: 'Personal Brand Building Blueprint',
    difficulty: 'intermediate', estimatedTime: '18 min',
    tags: ['personal-brand', 'authority', 'linkedin', 'twitter'],
    description: 'Build a personal brand that attracts opportunities and clients.',
    promptText: `Hello ChatGPT,
Create a personal brand building plan for me.

● My Expertise: [Your main skill or topic]
● Target Audience: [Who do you want to reach?]
● Current Following: [X on platform Y]
● Goals: [Clients / Speaking / Book deal / Job offers / Community]
● Time I Can Invest: [X hours per week]
● Platforms I Prefer: [LinkedIn / Twitter / YouTube / Blog / Newsletter]

Create a 90-day brand building plan:
1. Positioning statement (1 sentence)
2. Content pillars (3-5 topics)
3. Platform strategy (which platform, what content type)
4. Content calendar template (weekly)
5. Growth tactics (engagement, collaboration, hashtags)
6. Monetization pathway
7. Metrics to track (not vanity metrics)
8. Pitfalls to avoid`,
    placeholders: ['[Expertise]', '[Audience]', '[Following]', '[Goals]', '[Hours/week]', '[Platforms]'],
  },
  {
    promptId: 'MKT_021', category: 'Marketing & Social Media', subcategory: 'Competitive',
    title: 'Competitive Analysis & Positioning Framework',
    difficulty: 'intermediate', estimatedTime: '18 min',
    tags: ['competitive-analysis', 'positioning', 'strategy', 'market'],
    description: 'Analyse competitors and find your unique market position.',
    promptText: `Hello ChatGPT,
Conduct a competitive analysis and recommend positioning.

● My Product/Service: [Insert name and description]
● Main Competitors: [List 3-5 competitors]
● My Current Positioning: [How you describe yourself]
● My Strengths: [List 3-5 advantages]
● My Weaknesses: [List 3-5 gaps]
● Market: [Describe market and trends]

Provide:
1. Competitive landscape overview
2. Feature comparison matrix
3. Pricing comparison
4. Positioning map (2x2 matrix description)
5. Competitive advantage identification
6. Positioning recommendation (target audience + differentiator + proof)
7. Messaging framework (for your team)
8. Action plan to strengthen position`,
    placeholders: ['[Your product]', '[Competitors]', '[Current positioning]', '[Strengths]', '[Weaknesses]', '[Market]'],
  },
  {
    promptId: 'MKT_022', category: 'Marketing & Social Media', subcategory: 'SaaS',
    title: 'SaaS Go-to-Market Launch Plan',
    difficulty: 'advanced', estimatedTime: '25 min',
    tags: ['saas', 'gtm', 'launch', 'product-hunt', 'b2b'],
    description: 'Create a complete go-to-market plan for your SaaS product.',
    promptText: `Hello ChatGPT,
Create a go-to-market plan for my SaaS product.

● Product: [Name and description]
● Target Customer: [Ideal customer profile]
● Pricing: [Monthly / Annual / Freemium / Tiered]
● Launch Timeline: [Insert target launch date]
● Current Traction: [Beta users / Waitlist / Revenue / None]
● Budget: [X]
● Team: [X people available]

Create a 90-day GTM plan:
1. Pre-launch (30 days): audience building, content creation, partnerships
2. Launch week plan: channels, messaging, offers, PR
3. Post-launch (60 days): optimization, retargeting, expansion
4. Channel strategy (organic, paid, partnerships, content)
5. Pricing and packaging recommendation
6. Sales process definition
7. Success metrics (activation, retention, revenue)
8. Risk mitigation`,
    placeholders: ['[Name/description]', '[ICP]', '[Pricing model]', '[Launch date]', '[Traction]', '[Budget]', '[Team]'],
  },
  {
    promptId: 'MKT_023', category: 'Marketing & Social Media', subcategory: 'Growth',
    title: 'Growth Hacking Experiment Generator',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['growth', 'hacking', 'experiments', 'channels'],
    description: 'Generate growth hacking experiments to test for your business.',
    promptText: `Hello ChatGPT,
Generate growth hacking experiments for my business.

● Business Type: [SaaS / E-commerce / Marketplace / Content / App]
● Current Growth Channels: [List what you already do]
● Growth Constraint: [Traffic / Conversion / Retention / Referral / Revenue]
● Budget for Experiments: [Low / Medium / High]
● Experiment Cadence: [1 / 2 / 4 experiments per week]

Generate 20 growth experiment ideas:
1. Experiment name
2. Hypothesis (if we do X then Y will happen because Z)
3. Channels to test
4. Estimated effort (hours)
5. Expected impact (Low / Medium / High)
6. Success metric
7. Variant description (what to change vs control)
8. How to set up the experiment`,
    placeholders: ['[Business type]', '[Current channels]', '[Constraint]', '[Budget]', '[Cadence]'],
  },

  // === Batch 3: Additional SEO Prompts ===
  {
    promptId: 'SEO_011', category: 'SEO Optimization', subcategory: 'International',
    title: 'International SEO & Hreflang Strategy',
    difficulty: 'advanced', estimatedTime: '18 min',
    tags: ['international-seo', 'hreflang', 'multilingual', 'global'],
    description: 'Set up international SEO with proper hreflang and language targeting.',
    promptText: `Hello ChatGPT,
Create an international SEO strategy for my website.

● Website: [Insert URL]
● Target Countries: [List countries]
● Languages: [List languages]
● Current Setup: [Same domain / Subdomains / Subdirectories / ccTLDs]
● CMS: [WordPress / Shopify / Custom / Other]
● Existing Translations: [Yes / No / Some]

Provide:
1. Domain structure recommendation (best for SEO)
2. Hreflang implementation guide (code examples)
3. URL structure per language/country
4. Content localization checklist (beyond translation)
5. Keyword research per market
6. Local link building strategy
7. Technical considerations (hosting, CDN, speed)
8. Google Search Console setup per country`,
    placeholders: ['[URL]', '[Countries]', '[Languages]', '[Domain setup]', '[CMS]', '[Translation status]'],
  },
  {
    promptId: 'SEO_012', category: 'SEO Optimization', subcategory: 'Core Web Vitals',
    title: 'Core Web Vitals Optimization Guide',
    difficulty: 'advanced', estimatedTime: '20 min',
    tags: ['core-web-vitals', 'speed', 'lcp', 'cls', 'fid'],
    description: 'Optimize your website for Google Core Web Vitals.',
    promptText: `Hello ChatGPT,
Create a Core Web Vitals optimization plan for my website.

● Website URL: [Insert URL]
● Current LCP: [X seconds or "unknown"]
● Current FID/INP: [X ms or "unknown"]
● Current CLS: [X score or "unknown"]
● CMS/Platform: [WordPress / Shopify / Custom / Other]
● Hosting: [Shared / VPS / Dedicated / CDN]
● Current Issues Known: [Slow images / Render-blocking / Layout shifts / None]

Provide:
1. How to measure each metric (tools and methodology)
2. LCP optimization (images, server response, render-blocking)
3. INP optimization (JavaScript, event handlers, third-party code)
4. CLS optimization (layout shifts, dynamic content, fonts)
5. Quick wins (implementable in 1 day)
6. Medium-term improvements (1-4 weeks)
7. Long-term refactoring (1-3 months)
8. Monitoring and alerting setup`,
    placeholders: ['[URL]', '[LCP]', '[FID/INP]', '[CLS]', '[CMS]', '[Hosting]', '[Known issues]'],
  },
  {
    promptId: 'SEO_013', category: 'SEO Optimization', subcategory: 'Content',
    title: 'SEO Content Gap Analysis & Opportunity Finder',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['content-gap', 'opportunity', 'keywords', 'strategy'],
    description: 'Find untapped content opportunities in your niche.',
    promptText: `Hello ChatGPT,
Find content gaps and SEO opportunities in my niche.

● My Website: [Insert URL]
● Main Niche: [Describe niche]
● Top 3 Competitors: [Competitor URLs]
● Current Content: [X articles/pages]
● Target Keywords: [List 5-10 keywords you already target]
● Tools Available: [Ahrefs / SEMrush / Moz / None]

Analyse and provide:
1. Keywords competitors rank for that I don't
2. Content formats that are working in the niche
3. Featured snippet opportunities
4. Question-based content ideas ("People Also Ask")
5. Content upgrade opportunities (thin content to improve)
6. Low-competition keyword opportunities
7. Content cluster recommendations
8. Priority matrix (effort vs impact)`,
    placeholders: ['[URL]', '[Niche]', '[Competitors]', '[Content count]', '[Target keywords]', '[Tools]'],
  },
  {
    promptId: 'SEO_014', category: 'SEO Optimization', subcategory: 'Recovery',
    title: 'SEO Traffic Recovery & Penalty Fix',
    difficulty: 'advanced', estimatedTime: '20 min',
    tags: ['recovery', 'penalty', 'algorithm', 'traffic-drop'],
    description: 'Diagnose and recover from SEO traffic drops or penalties.',
    promptText: `Hello ChatGPT,
Help me recover from an SEO traffic drop.

● Website: [Insert URL]
● Traffic Drop: [X% drop]
● Date Drop Started: [Insert date]
● Recent Changes: [Site redesign / Content changes / Migration / Plugin updates / None]
● Google Update: [Known update at that time?]
● Current Index Status: [X pages indexed / Unknown]
● Manual Actions in Search Console: [Yes / No / Unknown]

[PASTE ANALYTICS DATA IF AVAILABLE]

Diagnose and recommend:
1. Potential causes (algorithm penalty, manual action, technical issue, content issue, competitor)
2. Data to gather for confirmation
3. Technical SEO audit (crawl, index, Core Web Vitals)
4. Content quality assessment
5. Backlink audit for toxic links
6. Recovery action plan (step-by-step)
7. Timeline expectations for recovery
8. Monitoring plan`,
    placeholders: ['[URL]', '[Drop %]', '[Date]', '[Recent changes]', '[Google update]', '[Index status]', '[Manual actions]', '[PASTE DATA]'],
  },
  {
    promptId: 'SEO_015', category: 'SEO Optimization', subcategory: 'Reporting',
    title: 'Monthly SEO Report Template',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['reporting', 'seo', 'monthly', 'dashboard'],
    description: 'Create a comprehensive monthly SEO report template.',
    promptText: `Hello ChatGPT,
Create a monthly SEO report template for my stakeholders.

● Website: [Insert URL]
● Report Audience: [Executive / Marketing team / Client]
● Reporting Period: [Monthly / Bi-weekly / Weekly]
● Key Goals: [Organic traffic / Rankings / Conversions / Brand visibility]
● Data Sources: [Google Analytics / Search Console / Rank tracker / Ahrefs / SEMrush]

Create a report template:
1. Executive summary (1 paragraph)
2. Organic traffic overview (visits, trends, comparisons)
3. Keyword performance (rankings by position group)
4. Top landing pages (traffic, conversions)
5. Technical health (Core Web Vitals, crawl errors, index count)
6. Content performance (new content, backlinks, engagement)
7. Competitor movement
8. Next month priorities and goals`,
    placeholders: ['[URL]', '[Audience]', '[Period]', '[Goals]', '[Data sources]'],
  },
  {
    promptId: 'SEO_016', category: 'SEO Optimization', subcategory: 'E-commerce',
    title: 'E-commerce SEO Category & Product Page Guide',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['ecommerce-seo', 'product-pages', 'category', 'shopify'],
    description: 'Optimize e-commerce category and product pages for search.',
    promptText: `Hello ChatGPT,
Optimize my e-commerce SEO for category and product pages.

● E-commerce Platform: [Shopify / WooCommerce / Magento / BigCommerce / Custom]
● Number of Products: [X]
● Number of Categories: [X]
● Current Issues: [Duplicate content / Thin content / Missing meta / Slow pages]
● Main Competitors: [List competitor URLs]

Provide:
1. Category page SEO structure (title, description, H1, content)
2. Product page SEO optimization checklist
3. URL structure best practice
4. Schema markup for products (JSON-LD examples)
5. Review/rating schema implementation
6. Image optimization for product photos
7. Faceted navigation SEO (handling filters)
8. Pagination SEO (rel=next/prev or infinite scroll)
9. Internal linking between related products
10. Content strategy for category pages`,
    placeholders: ['[Platform]', '[Product count]', '[Category count]', '[Issues]', '[Competitors]'],
  },

  // === Batch 3: Additional Content & Copywriting Prompts ===
  {
    promptId: 'CNT_011', category: 'Content Creation & Copywriting', subcategory: 'Copywriting',
    title: 'About Page Storytelling Framework',
    difficulty: 'beginner', estimatedTime: '12 min',
    tags: ['about-page', 'storytelling', 'brand', 'copy'],
    description: 'Write a compelling About page that builds connection and trust.',
    promptText: `Hello ChatGPT,
Write an About page for my brand that tells our story.

● Company Name: [Insert name]
● Founded: [Year]
● Founder Background: [Describe founder story]
● Mission: [What do you do and why?]
● Target Customer: [Who do you serve?]
● Company Values: [List 3-5 values]
● Team Size: [X people]
● Key Milestones: [List major achievements]

Write:
1. Hero section (headline + subheadline)
2. Origin story (why we started, 3 paragraphs)
3. Mission and vision (1 sentence each)
4. Values with descriptions
5. Team section copy
6. Social proof (achievements, press, clients)
7. CTA to next step (contact, products, etc.)
8. SEO meta description`,
    placeholders: ['[Name]', '[Year]', '[Founder story]', '[Mission]', '[Customers]', '[Values]', '[Team]', '[Milestones]'],
  },
  {
    promptId: 'CNT_012', category: 'Content Creation & Copywriting', subcategory: 'Copywriting',
    title: 'UVP & Elevator Pitch Developer',
    difficulty: 'beginner', estimatedTime: '8 min',
    tags: ['uvp', 'elevator-pitch', 'value-proposition', 'messaging'],
    description: 'Craft a unique value proposition and elevator pitch for your business.',
    promptText: `Hello ChatGPT,
Help me craft my unique value proposition and elevator pitch.

● Business/Product: [Insert name]
● What It Does: [Describe in one sentence]
● Target Customer: [Who needs this?]
● Main Competitors: [Names and their positioning]
● Key Differentiator: [What makes you truly different?]
● Customer Problem: [Main problem you solve]
● Customer Result: [What outcome do customers get?]

Generate:
1. Unique Value Proposition (1 sentence — "We help X do Y by Z")
2. 3 elevator pitch variations (15, 30, 60 seconds)
3. Tagline options (5 variations, 3-8 words each)
4. Positioning statement template
5. Messaging hierarchy (problem → solution → benefit → proof)
6. One-liner for each use case (social bio, website hero, pitch deck)`,
    placeholders: ['[Name]', '[Description]', '[Customers]', '[Competitors]', '[Differentiator]', '[Problem]', '[Result]'],
  },
  {
    promptId: 'CNT_013', category: 'Content Creation & Copywriting', subcategory: 'Blog',
    title: 'Thought Leadership Article Writer',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['thought-leadership', 'opinion', 'authority', 'blog'],
    description: 'Write a thought leadership article that positions you as an expert.',
    promptText: `Hello ChatGPT,
Write a thought leadership article on my chosen topic.

● Topic/Opinion: [What bold opinion do you hold?]
● Your Expertise: [Why should people listen to you?]
● Target Publication: [LinkedIn / Medium / Industry blog / Your blog]
● Target Audience: [Who needs to hear this?]
● Supporting Evidence: [Data, examples, case studies]
● Opposing View: [What do most people think?]

Write:
1. Provocative title (5 options)
2. Opening hook (challenge conventional wisdom)
3. Your thesis statement
4. Supporting arguments (3 main points with evidence)
5. Counter-argument acknowledgment
6. Call to action (what should change?)
7. Author bio line`,
    placeholders: ['[Opinion]', '[Expertise]', '[Publication]', '[Audience]', '[Evidence]', '[Opposing view]'],
  },
  {
    promptId: 'CNT_014', category: 'Content Creation & Copywriting', subcategory: 'Case Study',
    title: 'Customer Case Study Writer',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['case-study', 'social-proof', 'testimonial', 'customer'],
    description: 'Write a compelling customer case study with real results.',
    promptText: `Hello ChatGPT,
Write a customer case study for my business.

● Customer Name: [Insert name or anonymous]
● Customer Type: [Business / Individual]
● Industry: [Insert industry]
● Initial Challenge: [Describe their problem before]
● Our Solution: [What did we provide?]
● Results Achieved: [Quantifiable outcomes]
● Customer Quote: [Insert testimonial quote]
● Timeline: [How long from start to results?]

Write:
1. Title (result-driven, SEO friendly)
2. Executive summary (3 sentences)
3. Background and challenge
4. Solution implementation
5. Results (with numbers, before/after)
6. Customer quote section
7. Conclusion and future outlook
8. CTA (how to get similar results)`,
    placeholders: ['[Customer]', '[Type]', '[Industry]', '[Challenge]', '[Solution]', '[Results]', '[Quote]', '[Timeline]'],
  },
  {
    promptId: 'CNT_015', category: 'Content Creation & Copywriting', subcategory: 'eBook',
    title: 'Lead Magnet / eBook Outline Creator',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['lead-magnet', 'ebook', 'pdf', 'content-offer'],
    description: 'Create a compelling lead magnet outline that converts visitors.',
    promptText: `Hello ChatGPT,
Create a lead magnet or eBook outline for my audience.

● Topic: [Insert topic]
● Target Audience: [Describe reader]
● Core Promise: [What will they learn or get?]
● Format: [PDF / Checklist / Template / Workbook / Video series]
● Length: [5 / 10 / 20 / 50 pages]
● Gate: [Email opt-in / Free / Paid]
● Existing Content in This Area: [What have you already published?]

Create:
1. Title (5 options, benefit-driven)
2. Description for opt-in page
3. Full outline with chapters/sections
4. Key takeaways per section
5. Design and layout suggestions
6. Call-to-action within the lead magnet
7. Follow-up email sequence for new subscribers (3 emails)`,
    placeholders: ['[Topic]', '[Audience]', '[Promise]', '[Format]', '[Length]', '[Gate]', '[Existing content]'],
  },
  {
    promptId: 'CNT_016', category: 'Content Creation & Copywriting', subcategory: 'Social',
    title: 'Social Media Caption Vault (100+ Templates)',
    difficulty: 'beginner', estimatedTime: '20 min',
    tags: ['captions', 'social-media', 'templates', 'copy'],
    description: 'Generate 100+ social media caption templates for any occasion.',
    promptText: `Hello ChatGPT,
Generate a library of social media caption templates.

● Brand Voice: [Describe tone — e.g., witty, professional, inspirational]
● Platforms: [Instagram / LinkedIn / TikTok / Twitter / Facebook]
● Content Types: [Educational / Promotional / Behind-scenes / Inspirational / Interactive / Personal]

Provide 100+ caption templates organized by:
1. Educational posts (20 templates)
2. Promotional posts (15 templates)
3. Behind-the-scenes (10 templates)
4. Inspirational/motivational (15 templates)
5. Interactive/engagement (15 templates)
6. Personal/storytelling (10 templates)
7. Seasonal/event-based (10 templates)
8. Question/discussion starters (10 templates)
Each template: Purpose, caption template with [brackets], ideal length, hook tip`,
    placeholders: ['[Brand voice]', '[Platforms]', '[Content types]'],
  },
  {
    promptId: 'CNT_017', category: 'Content Creation & Copywriting', subcategory: 'PR',
    title: 'Media Pitch & Story Angle Generator',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['pr', 'media', 'pitch', 'journalist', 'coverage'],
    description: 'Write media pitches that journalists actually open and reply to.',
    promptText: `Hello ChatGPT,
Write a media pitch for my story.

● My News: [What is the announcement or angle?]
● Why Now: [Timeliness, trend, or news jacking angle]
● Target Journalist Beat: [Tech / Business / Lifestyle / Industry]
● Target Publication Type: [Blog / Newspaper / Podcast / Newsletter / TV]
● My Credentials: [Why am I the right source?]
● Previous Coverage: [Links or description]
● Visual Assets Available: [Photos / Video / Infographic / Demo]

Generate:
1. Subject line (5 options, under 60 chars)
2. Pitch email (under 150 words)
3. Bullet points of key facts (for quick scanning)
4. Suggested interview questions
5. Follow-up sequence (2 emails)
6. Media kit one-pager outline`,
    placeholders: ['[Your news]', '[Why now]', '[Journalist beat]', '[Publication type]', '[Credentials]', '[Previous coverage]', '[Visuals]'],
  },
  {
    promptId: 'CNT_018', category: 'Content Creation & Copywriting', subcategory: 'Writing',
    title: 'Creative Writing Prompt & Story Starter',
    difficulty: 'beginner', estimatedTime: '8 min',
    tags: ['creative', 'writing', 'story', 'fiction'],
    description: 'Generate creative writing prompts and story starters.',
    promptText: `Hello ChatGPT,
Generate creative writing prompts for my project.

● Genre: [Fiction / Non-fiction / Fantasy / Sci-fi / Romance / Mystery / Thriller / Literary]
● Tone: [Dark / Light-hearted / Suspenseful / Reflective / Humorous]
● Elements to Include: [Specific themes, objects, locations, or constraints]
● Format: [Short story / Novel chapter / Flash fiction / Poem / Scene]
● Length Goal: [X words or pages]

Provide:
1. 10 story prompts with hook sentences
2. 5 character concepts with backstory
3. 3 setting descriptions
4. 2 plot twist ideas
5. 1 complete opening paragraph
6. Dialogue starter for each prompt`,
    placeholders: ['[Genre]', '[Tone]', '[Elements]', '[Format]', '[Length]'],
  },

  // === Batch 3: Additional Coding Prompts ===
  {
    promptId: 'CODE_011', category: 'Coding & Development', subcategory: 'Python',
    title: 'Python Script Automator (Any Task)',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['python', 'automation', 'script', 'data'],
    description: 'Generate Python scripts to automate repetitive tasks.',
    promptText: `Hello ChatGPT,
Write a Python script to automate my task.

● Task Description: [What needs to be automated?]
● Input: [File type / API / User input / Database]
● Output: [File / Email / API call / Database update / Report]
● Libraries Preferred: [List if known]
● Error Handling: [What should happen on failure?]
● Schedule: [Run once / Daily / Hourly / Trigger-based]

Generate:
1. Complete Python script with imports and functions
2. Error handling and logging
3. Usage instructions
4. Example input and expected output
5. Requirements.txt file
6. Testing approach`,
    placeholders: ['[Task]', '[Input]', '[Output]', '[Libraries]', '[Error handling]', '[Schedule]'],
  },
  {
    promptId: 'CODE_012', category: 'Coding & Development', subcategory: 'Git',
    title: 'Git Workflow & Collaboration Guide',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['git', 'version-control', 'collaboration', 'workflow'],
    description: 'Set up a Git workflow for your team with branching strategy.',
    promptText: `Hello ChatGPT,
Create a Git workflow guide for my team.

● Team Size: [X developers]
● Project Type: [Web / Mobile / Library / Monorepo / Microservices]
● Platform: [GitHub / GitLab / Bitbucket]
● Experience Level: [Beginner / Intermediate / Advanced]
● Current Workflow: [Describe or "none"]
● CI/CD Integration: [Yes / No / Planned]

Create a Git workflow guide:
1. Branching strategy (main, develop, feature, release, hotfix)
2. Naming conventions for branches
3. Commit message convention (e.g., Conventional Commits)
4. Pull request process and checklist
5. Code review guidelines
6. Merge strategy (merge commit / squash / rebase)
7. Handling conflicts guide
8. Git hooks setup (pre-commit, pre-push)
9. Common commands cheat sheet`,
    placeholders: ['[Team size]', '[Project type]', '[Platform]', '[Experience]', '[Current workflow]', '[CI/CD]'],
  },
  {
    promptId: 'CODE_013', category: 'Coding & Development', subcategory: 'Docker',
    title: 'Docker Containerization Setup Guide',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['docker', 'containers', 'devops', 'deployment'],
    description: 'Create Docker configuration files for your application.',
    promptText: `Hello ChatGPT,
Create Docker configuration for my application.

● App Type: [Web app / API / Worker / Database / Static site]
● Language/Runtime: [Node.js / Python / Go / Java / Ruby / PHP]
● Dependencies: [List key services: Redis, Postgres, etc.]
● Port: [Application port]
● Environment Variables: [List required env vars]
● Multi-stage Build: [Yes / No / Not sure]
● Deployment Target: [Docker Compose / Kubernetes / Single host]

Generate:
1. Dockerfile (optimized, multi-stage if appropriate)
2. Docker Compose file with all services
3. .dockerignore file
4. Health check configuration
5. Volume mount points
6. Environment file template (.env.example)
7. Build and run commands
8. Docker networking configuration
9. Security best practices applied`,
    placeholders: ['[App type]', '[Runtime]', '[Dependencies]', '[Port]', '[Env vars]', '[Multi-stage]', '[Target]'],
  },
  {
    promptId: 'CODE_014', category: 'Coding & Development', subcategory: 'GraphQL',
    title: 'GraphQL API Schema Designer',
    difficulty: 'advanced', estimatedTime: '18 min',
    tags: ['graphql', 'api', 'schema', 'backend'],
    description: 'Design a GraphQL API schema with types, queries, and mutations.',
    promptText: `Hello ChatGPT,
Design a GraphQL API schema for my application.

● App Description: [Describe your app and data model]
● Key Entities: [List main objects with fields]
● Relationships: [One-to-one, one-to-many, many-to-many]
● Auth Required: [Yes / No]
● Real-time Needs: [Subscriptions needed?]
● Current API: [REST API to wrap / New / GraphQL already]

Provide:
1. Schema definition (types, inputs, enums, interfaces)
2. Query definitions with arguments and pagination
3. Mutation definitions with input types
4. Subscription definitions (if needed)
5. Resolver signatures
6. Authentication and authorization approach
7. N+1 query prevention strategies (DataLoader)
8. Error handling pattern`,
    placeholders: ['[App description]', '[Entities]', '[Relationships]', '[Auth]', '[Real-time]', '[Current API]'],
  },
  {
    promptId: 'CODE_015', category: 'Coding & Development', subcategory: 'Performance',
    title: 'Web Performance Optimization Audit',
    difficulty: 'advanced', estimatedTime: '20 min',
    tags: ['performance', 'optimization', 'speed', 'lighthouse'],
    description: 'Get a comprehensive web performance optimization plan.',
    promptText: `Hello ChatGPT,
Perform a web performance optimization audit for my site.

● Website URL: [Insert URL]
● Current Lighthouse Score: [X/100 or "unknown"]
● Core Web Vitals: [Known values or "unknown"]
● Framework: [React / Vue / Angular / Next.js / Vanilla / WordPress / Shopify]
● Hosting: [Shared / VPS / CDN / Serverless]
● Current Issues: [Slow loading / Janky interactions / Large bundle / Images / Third-party scripts]

Provide:
1. Performance audit checklist (with priority levels)
2. JavaScript optimization (code splitting, lazy loading, tree shaking)
3. Image optimization (format, compression, responsive, lazy loading)
4. CSS optimization (critical CSS, minification, unused CSS removal)
5. Font optimization (display swap, subsetting, preloading)
6. Server and network optimization (TTFB, CDN, caching, compression)
7. Third-party script management
8. Progressive Web App (PWA) checklist
9. Monitoring and measurement setup
10. Implementation roadmap (quick wins, medium, long-term)`,
    placeholders: ['[URL]', '[Lighthouse score]', '[Core Web Vitals]', '[Framework]', '[Hosting]', '[Known issues]'],
  },
  {
    promptId: 'CODE_016', category: 'Coding & Development', subcategory: 'Documentation',
    title: 'Technical Documentation Writer',
    difficulty: 'beginner', estimatedTime: '12 min',
    tags: ['documentation', 'technical-writing', 'readme', 'api-docs'],
    description: 'Write clear technical documentation for your project.',
    promptText: `Hello ChatGPT,
Write technical documentation for my project.

● Project Name: [Insert name]
● Project Type: [Library / API / App / Tool / Framework]
● Language/Framework: [Insert tech stack]
● Main Features: [List 5-10 features]
● Installation: [npm / pip / docker / download / clone]
● Audience: [Beginner / Intermediate / Advanced / Mixed]

Generate:
1. README.md structure (badges, description, install, usage, API, contributing, license)
2. Quick start guide (5 steps)
3. API documentation with examples (if applicable)
4. Configuration reference table
5. Common troubleshooting section
6. Contributing guide
7. Code examples for common use cases`,
    placeholders: ['[Name]', '[Type]', '[Tech stack]', '[Features]', '[Install method]', '[Audience]'],
  },
  {
    promptId: 'CODE_017', category: 'Coding & Development', subcategory: 'Migration',
    title: 'Legacy Code Migration & Upgrade Plan',
    difficulty: 'advanced', estimatedTime: '20 min',
    tags: ['migration', 'legacy', 'upgrade', 'refactoring'],
    description: 'Plan a migration from legacy code to modern technologies.',
    promptText: `Hello ChatGPT,
Create a migration plan for modernizing my legacy codebase.

● Current Tech Stack: [Languages, frameworks, databases, servers]
● Target Tech Stack: [Desired modern alternatives]
● Codebase Size: [X lines of code or X files]
● Team Size: [X developers]
● Migration Timeline: [Ideal timeframe]
● Constraints: [No downtime / Must support existing features / Budget]

Provide:
1. Migration strategy recommendation (big bang vs incremental vs strangler fig)
2. Risk assessment for each component
3. Migration phases in order (dependency-first approach)
4. Testing strategy (integration, regression, parallel run)
5. Rollback plan per phase
6. Data migration approach (if changing databases)
7. Team training requirements
8. Success criteria and go/no-go decision points`,
    placeholders: ['[Current stack]', '[Target stack]', '[Codebase size]', '[Team]', '[Timeline]', '[Constraints]'],
  },
  {
    promptId: 'CODE_018', category: 'Coding & Development', subcategory: 'AI Integration',
    title: 'OpenAI API Integration Guide',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['openai', 'api', 'integration', 'gpt', 'llm'],
    description: 'Integrate OpenAI API into your application with best practices.',
    promptText: `Hello ChatGPT,
Help me integrate the OpenAI API into my application.

● Use Case: [Chat / Text generation / Embeddings / Image generation / Transcription]
● Language: [Python / JavaScript / TypeScript / Java / Go / Ruby / PHP]
● Framework: [Express / Django / FastAPI / Flask / Next.js / Other]
● Features Needed: [Streaming / History / Function calling / Memory / Multi-turn]
● Authentication: [API Key / Azure AD / Other]
● Rate Limits: [Tier and limits]
● Budget: [Monthly API budget]

Provide:
1. Setup and authentication code
2. Basic integration with error handling
3. Streaming response implementation (if needed)
4. Prompt engineering integration (system messages, temperature, max tokens)
5. Rate limiting and retry logic
6. Cost optimization strategies
7. Security best practices (API key protection, input sanitization)
8. Monitoring and logging
9. Example of a production-ready wrapper`,
    placeholders: ['[Use case]', '[Language]', '[Framework]', '[Features]', '[Auth]', '[Rate limits]', '[Budget]'],
  },

  // === Batch 3: Additional Data Analysis Prompts ===
  {
    promptId: 'DATA_007', category: 'Data Analysis', subcategory: 'SQL',
    title: 'SQL Query Generator & Optimizer',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['sql', 'queries', 'optimization', 'database'],
    description: 'Generate and optimize SQL queries for your data needs.',
    promptText: `Hello ChatGPT,
Generate or optimize SQL queries for my database.

● Database Type: [PostgreSQL / MySQL / SQL Server / SQLite / BigQuery]
● Table Structure: [Describe tables, columns, relationships]
● Query Goal: [What data do you need?]
● Current Query (if optimizing): [PASTE QUERY HERE]
● Performance Issue: [Slow / Complex / Not returning expected results]

Generate:
1. Complete SQL query for the goal
2. Index recommendations
3. Query explanation (what each part does)
4. Optimization suggestions (if applicable)
5. Alternative approaches
6. Testing data setup (if needed)`,
    placeholders: ['[DB type]', '[Table structure]', '[Query goal]', '[Current query]', '[Issues]'],
  },
  {
    promptId: 'DATA_008', category: 'Data Analysis', subcategory: 'Statistics',
    title: 'Statistical Analysis Plan & Method Selection',
    difficulty: 'advanced', estimatedTime: '18 min',
    tags: ['statistics', 'analysis', 'methodology', 'hypothesis'],
    description: 'Select the right statistical methods for your research question.',
    promptText: `Hello ChatGPT,
Help me design a statistical analysis plan.

● Research Question: [What are you trying to prove or discover?]
● Data Type: [Continuous / Categorical / Ordinal / Mixed]
● Sample Size: [X observations]
● Groups Being Compared: [Number and description]
● Variables: [Dependent / Independent / Confounding / Control]
● Hypothesis: [What do you expect to find?]

Provide:
1. Recommended statistical tests with justification
2. Assumptions to check for each test
3. Sample size / power analysis
4. Effect size interpretation
5. P-value and confidence interval approach
6. Common pitfalls and alternatives
7. Visualization recommendations for results
8. Results reporting template (for paper or presentation)`,
    placeholders: ['[Question]', '[Data type]', '[Sample size]', '[Groups]', '[Variables]', '[Hypothesis]'],
  },
  {
    promptId: 'DATA_009', category: 'Data Analysis', subcategory: 'Python',
    title: 'Exploratory Data Analysis (EDA) Notebook Generator',
    difficulty: 'intermediate', estimatedTime: '20 min',
    tags: ['eda', 'python', 'jupyter', 'data-exploration'],
    description: 'Generate a complete exploratory data analysis notebook.',
    promptText: `Hello ChatGPT,
Generate an exploratory data analysis notebook for my dataset.

● Data Description: [What does the data represent?]
● File Format: [CSV / Excel / JSON / Parquet / SQL]
● Columns: [List column names and types]
● Target Variable (if any): [Column to predict or analyse]
● Known Issues: [Missing values / Outliers / Imbalance]
● Analysis Goal: [Understand patterns / Prepare for modeling / Find insights]

Generate a complete EDA notebook with:
1. Data loading and initial inspection
2. Data cleaning (missing values, duplicates, type fixing)
3. Univariate analysis (distributions, summary stats)
4. Bivariate analysis (correlations, relationships)
5. Multivariate analysis (interactions, patterns)
6. Visualization recommendations
7. Key insights and findings
8. Next steps recommendation`,
    placeholders: ['[Data description]', '[Format]', '[Columns]', '[Target]', '[Issues]', '[Goal]'],
  },

  // === Batch 3: Additional Course Creation Prompts ===
  {
    promptId: 'CRSE_007', category: 'Online Course Creation', subcategory: 'Production',
    title: 'Course Video Production Checklist',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['video-production', 'recording', 'lighting', 'audio'],
    description: 'Get a complete video production checklist for recording course content.',
    promptText: `Hello ChatGPT,
Create a video production checklist for my online course.

● Recording Setup: [Home studio / Office / Professional studio / Outdoor]
● Equipment Available: [Camera / Webcam / Phone / External mic / No special gear]
● Video Type: [Talking head / Screen recording / Slides + voice / Hybrid]
● Course Length: [X hours of video]
● Budget for Equipment: [Low / Medium / High]

Provide:
1. Pre-production checklist (script, slides, wardrobe, set)
2. Audio setup and best practices (mic placement, room treatment, noise reduction)
3. Lighting setup (key, fill, back light — DIY options)
4. Screen recording settings and tips
5. Recording session workflow (warm-up, takes, breaks)
6. Common mistakes and how to fix them in post-production
7. Post-production workflow (editing, captions, thumbnails)
8. File management and backup`,
    placeholders: ['[Setup]', '[Equipment]', '[Video type]', '[Course length]', '[Budget]'],
  },
  {
    promptId: 'CRSE_008', category: 'Online Course Creation', subcategory: 'Engagement',
    title: 'Course Completion & Retention Strategy',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['retention', 'completion', 'engagement', 'learning'],
    description: 'Design strategies to keep students engaged and completing your course.',
    promptText: `Hello ChatGPT,
Design a student retention and course completion strategy.

● Course Topic: [Insert topic]
● Course Length: [X modules, X hours]
● Current Completion Rate: [X% or "unknown"]
● Student Demographics: [Describe typical student]
● Course Format: [Self-paced / Cohort / Hybrid]
● Drop-off Point (if known): [Where do students stop?]

Provide:
1. Course structure optimization (chunking, pacing, milestones)
2. Engagement mechanics (quizzes, challenges, community)
3. Accountability system design
4. Progress tracking and motivation triggers
5. Email/notification sequence to re-engage inactive students
6. Community and peer support design
7. Certificate / credential incentives
8. Feedback collection and iteration process
9. Case study: what top courses do differently`,
    placeholders: ['[Topic]', '[Length]', '[Completion rate]', '[Students]', '[Format]', '[Drop-off point]'],
  },
  {
    promptId: 'CRSE_009', category: 'Online Course Creation', subcategory: 'Production',
    title: 'Course Slide Deck & Visual Aid Designer',
    difficulty: 'beginner', estimatedTime: '12 min',
    tags: ['slides', 'presentation', 'visual-aids', 'design'],
    description: 'Design effective slide decks and visual aids for your course.',
    promptText: `Hello ChatGPT,
Design a slide deck structure for my course lesson.

● Course Topic: [Insert topic]
● Lesson Title: [Insert lesson title]
● Lesson Length: [X minutes]
● Content Type: [Concept / Process / Comparison / Case study]
● Slide Count: [X slides]
● Brand Colours: [Hex codes or describe]
● Supporting Materials: [Diagrams / Screenshots / Code snippets / Data tables]

Create:
1. Slide-by-slide structure with content outlines
2. Visual suggestions (diagrams, icons, images)
3. Text rules (max words per slide, font sizes)
4. Animation and transition recommendations
5. Speaker notes per slide
6. Downloadable handout version design
7. Accessibility tips (contrast, alt text, readability)`,
    placeholders: ['[Topic]', '[Lesson title]', '[Length]', '[Content type]', '[Slide count]', '[Brand]', '[Materials]'],
  },
  {
    promptId: 'CRSE_010', category: 'Online Course Creation', subcategory: 'Pricing',
    title: 'Course Pricing Tiers & Packaging Strategy',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['pricing', 'tiers', 'packaging', 'upsell'],
    description: 'Design effective course pricing tiers that maximize revenue.',
    promptText: `Hello ChatGPT,
Design pricing tiers for my online course.

● Course Topic: [Insert topic]
● Course Content: [X modules, X hours, X resources]
● Target Student Budget: [Low / Medium / High]
● Competitor Pricing: [List competitor prices]
● Additional Assets: [Worksheets / Templates / Community / Coaching / Certificates]
● Platform: [Own site / Udemy / Teachable / Kajabi]

Design:
1. 3-tier pricing structure (good, better, best)
2. What to include in each tier (value stacking)
3. Tier pricing rationale (anchoring, decoy effect)
4. Payment plan options
5. Bundle upsell opportunities
6. Launch discount strategy
7. Lifetime access vs subscription pricing
8. Upgrade path between tiers`,
    placeholders: ['[Topic]', '[Content]', '[Budget]', '[Competitors]', '[Assets]', '[Platform]'],
  },
  {
    promptId: 'CRSE_011', category: 'Online Course Creation', subcategory: 'Marketing',
    title: 'Course Content Upgrade & Evergreen Funnel',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['evergreen', 'funnel', 'automation', 'marketing'],
    description: 'Build an evergreen course marketing funnel with content upgrades.',
    promptText: `Hello ChatGPT,
Design an evergreen marketing funnel for my online course.

● Course Topic: [Insert topic]
● Course Price: [Insert price]
● Lead Magnet: [Freebie to attract subscribers]
● Traffic Sources: [SEO / Social / Paid / Partnerships / Content]
● Email Platform: [ConvertKit / Mailchimp / ActiveCampaign / Other]
● Conversion Goal: [Free trial / Webinar registration / Direct purchase]

Create an evergreen funnel:
1. Lead magnet opt-in page copy
2. Email sequence (5-7 emails delivering value + selling course)
3. Webinar or challenge sequence (alternative path)
4. Cart open / promotion sequence
5. Abandoned cart recovery (if applicable)
6. Post-purchase upsell sequence
7. Affiliate/partner recruitment path
8. Metrics to track (conversion rate, CPA, LTV)`,
    placeholders: ['[Topic]', '[Price]', '[Lead magnet]', '[Traffic]', '[Email platform]', '[Goal]'],
  },

  // === Batch 3: Additional Sales Prompts ===
  {
    promptId: 'SALES_008', category: 'Sales & Persuasion', subcategory: 'Pitch Deck',
    title: 'Sales Meeting Pitch Deck Creator',
    difficulty: 'intermediate', estimatedTime: '18 min',
    tags: ['pitch-deck', 'sales-meeting', 'presentation', 'closing'],
    description: 'Create a persuasive sales meeting deck that closes deals.',
    promptText: `Hello ChatGPT,
Create a sales meeting pitch deck for my product.

● Product/Service: [Insert name]
● Target Prospect: [Company type, role, pain point]
● Deal Size: [X]
● Decision Makers: [Who will be in the room?]
● Main Competitors: [Names and weaknesses]
● Proof Points: [Case studies, metrics, testimonials]
● Objections Expected: [Price / Timing / Competition / Integration]

Create a 10-slide pitch deck outline:
1. Title + agenda
2. Their problem (agitate, not just state)
3. Cost of not solving (quantify)
4. Our solution (how we solve it uniquely)
5. Proof (case study with numbers)
6. How it works (implementation, timeline)
7. ROI analysis (the numbers they care about)
8. Objection handling slide
9. Pricing and options
10. Next steps and CTA`,
    placeholders: ['[Product]', '[Prospect]', '[Deal size]', '[Decision makers]', '[Competitors]', '[Proof]', '[Objections]'],
  },
  {
    promptId: 'SALES_009', category: 'Sales & Persuasion', subcategory: 'Closing',
    title: 'Sales Closing Technique Scripts (10 Techniques)',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['closing', 'techniques', 'scripts', 'objections'],
    description: 'Generate closing scripts using 10 different sales techniques.',
    promptText: `Hello ChatGPT,
Generate closing scripts for my sales conversations.

● Product/Service: [Insert name]
● Price: [Insert price]
● Typical Objections: [List 3-5 common objections]
● Sales Channel: [Phone / Video call / In-person / Email]
● Prospect Relationship: [Cold / Warm / Existing customer]
● Closing Goal: [Book meeting / Get commitment / Close deal]

Generate scripts for 10 closing techniques:
1. Assumptive close
2. Alternative choice close
3. Urgency/scarcity close
4. Summary close
5. Question close
6. Takeaway close
7. Sharp angle close
8. Now-or-never close
9. Permission close
10. Direct close`,
    placeholders: ['[Product]', '[Price]', '[Objections]', '[Channel]', '[Relationship]', '[Goal]'],
  },
  {
    promptId: 'SALES_010', category: 'Sales & Persuasion', subcategory: 'Discovery',
    title: 'Sales Discovery Call Framework & Question Bank',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['discovery', 'qualification', 'bant', 'meddic'],
    description: 'Structure your discovery calls with proven qualification frameworks.',
    promptText: `Hello ChatGPT,
Create a discovery call framework and question bank.

● Product/Service: [Insert name]
● Ideal Customer Profile: [Describe]
● Deal Size Range: [X to Y]
● Sales Cycle Length: [X days/weeks]
● Qualification Framework: [BANT / MEDDIC / CHAMP / Custom / None]
● Common Fit Issues: [When should we disqualify?]

Create:
1. Discovery call agenda (timed, 30-60 minutes)
2. Qualification questions using chosen framework
3. Pain discovery questions (find the emotional driver)
4. Budget questions (uncover and justify)
5. Authority questions (decision process and stakeholders)
6. Need/pain prioritization questions
7. Timeline questions (urgency and consequences of delay)
8. Competition questions (understand alternatives)
9. Red flag identification guide
10. Next step commitment script`,
    placeholders: ['[Product]', '[ICP]', '[Deal size]', '[Cycle length]', '[Framework]', '[Fit issues]'],
  },
  {
    promptId: 'SALES_011', category: 'Sales & Persuasion', subcategory: 'Objections',
    title: 'Objection Handling Playbook (50 Objections)',
    difficulty: 'intermediate', estimatedTime: '20 min',
    tags: ['objections', 'handling', 'playbook', 'scripts'],
    description: 'Build a complete objection handling playbook for your sales team.',
    promptText: `Hello ChatGPT,
Build an objection handling playbook for my product.

● Product/Service: [Insert name]
● Price: [Insert price]
● Industry: [Insert industry]
● Target Customer: [Describe]
● Common Objections: [List 10-15 objections you hear]

For each objection provide:
1. The objection verbatim
2. What the prospect really means (underlying concern)
3. Acknowledgment phrase (validate their concern)
4. Reframe or redirect
5. Proof point or data to share
6. Check-back question ("Does that address your concern?")
7. If they persist, escalation response

Organize objections by category:
- Price/cost objections
- Timing objections
- Competitor objections
- Authority objections
- Need objections
- Trust objections`,
    placeholders: ['[Product]', '[Price]', '[Industry]', '[Customer]', '[Objections list]'],
  },
  {
    promptId: 'SALES_012', category: 'Sales & Persuasion', subcategory: 'Referral',
    title: 'Customer Referral Program Design',
    difficulty: 'beginner', estimatedTime: '12 min',
    tags: ['referral', 'word-of-mouth', 'growth', 'customers'],
    description: 'Design a customer referral program that drives new business.',
    promptText: `Hello ChatGPT,
Design a customer referral program for my business.

● Business Type: [SaaS / E-commerce / Service / Agency / Course]
● Average Customer LTV: [X]
● Current Customer Count: [X]
● NPS or Satisfaction Score: [X or "unknown"]
● Referral Incentive: [Discount / Cash / Credit / Gift / Donation]
● Ideal Referral Source: [Who are your happiest customers?]

Design:
1. Referral program structure (how it works)
2. Incentive design (reward for referrer and referee)
3. Referral request email templates (3 variations)
4. In-product referral prompt
5. Social share copy
6. Tracking and attribution system
7. Promotional plan (launch + ongoing)
8. Success metrics (referral rate, conversion, LTV of referred customers)
9. Terms and conditions`,
    placeholders: ['[Business type]', '[LTV]', '[Customer count]', '[NPS]', '[Incentive]', '[Sources]'],
  },

  // === Batch 3: Additional HR & Recruitment Prompts ===
  {
    promptId: 'HR_007', category: 'HR & Recruitment', subcategory: 'Learning',
    title: 'Employee Training & Development Plan',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['training', 'development', 'learning', 'skills'],
    description: 'Create a professional development plan for your team.',
    promptText: `Hello ChatGPT,
Create a training and development plan for my team.

● Team Role: [Job titles in team]
● Team Size: [X people]
● Current Skill Gaps: [List identified gaps]
● Development Goals: [Individual contributors / Managers / Cross-functional]
● Budget: [X per person per year]
● Time Available: [X hours per week/month for learning]
● Company Goals: [How does training support company objectives?]

Create:
1. Skills assessment framework
2. Individual development plan template
3. Training methods (courses, mentoring, job shadowing, conferences)
4. 12-month training calendar
5. Budget allocation recommendation
6. Success metrics (skill improvement, promotion readiness)
7. Learning culture initiatives
8. ROI measurement approach`,
    placeholders: ['[Role]', '[Team size]', '[Skill gaps]', '[Goals]', '[Budget]', '[Time]', '[Company goals]'],
  },
  {
    promptId: 'HR_008', category: 'HR & Recruitment', subcategory: 'Remote',
    title: 'Remote Team Management & Culture Guide',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['remote', 'distributed', 'async', 'culture'],
    description: 'Design remote work policies and culture for your distributed team.',
    promptText: `Hello ChatGPT,
Create a remote work guide for my distributed team.

● Team Size: [X]
● Time Zones: [List main time zones]
● Async vs Sync Ratio: [X% async / X% synchronous]
● Current Tools: [Slack / Zoom / Notion / Asana / Other]
● Current Challenges: [Communication / Collaboration / Isolation / Accountability / Culture]
● Office: [No office / Coworking stipend / Hybrid]

Create:
1. Remote work policy document
2. Async communication guidelines
3. Meeting culture (when to meet, how to run effective remote meetings)
4. Collaboration tools stack recommendation
5. Team rituals (daily standup, weekly wrap, social events)
6. Performance management for remote teams
7. Onboarding remote employees
8. Building culture intentionally (virtual team building, recognition)
9. Wellness and burnout prevention`,
    placeholders: ['[Team size]', '[Time zones]', '[Async ratio]', '[Tools]', '[Challenges]', '[Office setup]'],
  },
  {
    promptId: 'HR_009', category: 'HR & Recruitment', subcategory: 'DEI',
    title: 'DEI (Diversity, Equity, Inclusion) Strategy Builder',
    difficulty: 'intermediate', estimatedTime: '18 min',
    tags: ['dei', 'diversity', 'inclusion', 'equity', 'culture'],
    description: 'Build a diversity, equity, and inclusion strategy for your organization.',
    promptText: `Hello ChatGPT,
Create a DEI strategy for my organization.

● Company Size: [X employees]
● Industry: [Insert industry]
● Current DEI Initiatives: [List or "none"]
● Key DEI Challenges: [Recruitment / Retention / Promotion / Culture / Pay equity]
● Leadership Buy-in: [Strong / Moderate / Low]
● Budget: [X or "none"]

Create a 12-month DEI strategy:
1. DEI vision statement (1 sentence)
2. Baseline assessment approach (collect data, employee survey)
3. Recruitment DEI (blind screening, diverse sourcing, unbiased interviewing)
4. Retention DEI (mentorship, ERGs, inclusive culture)
5. Promotion and pay equity review
6. Training and education plan (mandatory + optional)
7. Accountability and metrics (who owns it, how to measure)
8. Communication and transparency plan
9. Small company vs large company considerations`,
    placeholders: ['[Company size]', '[Industry]', '[Current initiatives]', '[Challenges]', '[Buy-in]', '[Budget]'],
  },
  {
    promptId: 'HR_010', category: 'HR & Recruitment', subcategory: 'Succession',
    title: 'Succession Planning & Talent Pipeline',
    difficulty: 'advanced', estimatedTime: '18 min',
    tags: ['succession', 'talent', 'promotion', 'planning'],
    description: 'Design a succession plan for key roles in your organization.',
    promptText: `Hello ChatGPT,
Create a succession planning framework for my organization.

● Company Size: [X employees]
● Key Leadership Roles: [List critical roles]
● Current Readiness: [Have successors / Need to develop / No plan]
● Timeline: [1-year / 3-year / 5-year plan]
● Growth Plans: [Expected team growth over next X years]

Create:
1. Succession planning framework and criteria
2. High-potential employee identification process
3. Development plans for potential successors
4. Knowledge transfer process
5. Risk assessment for each key role (likelihood of vacancy × impact)
6. Timeline and milestones
7. Communication plan (who knows what)
8. Review and update cadence`,
    placeholders: ['[Size]', '[Key roles]', '[Readiness]', '[Timeline]', '[Growth plans]'],
  },

  // === Batch 3: Additional Project Management Prompts ===
  {
    promptId: 'PM_007', category: 'Project Management', subcategory: 'Estimation',
    title: 'Project Estimation & Timeline Builder',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['estimation', 'timeline', 'planning', 'effort'],
    description: 'Create accurate project estimates and realistic timelines.',
    promptText: `Hello ChatGPT,
Create a project estimate and timeline for my project.

● Project Description: [What needs to be built?]
● Team: [X developers, X designers, X QA]
● Known Requirements: [List known features or deliverables]
● Unknowns/Risks: [What could go wrong or change?]
● Methodology: [Agile / Waterfall / Hybrid]
● Constraints: [Hard deadline / Budget cap / Resources]

Provide:
1. Work breakdown structure (phases → tasks → subtasks)
2. Effort estimation per task (hours or story points)
3. Dependencies and critical path
4. Team capacity allocation
5. Timeline with milestones
6. Buffer recommendations (contingency)
7. Confidence level (best case / likely / worst case)
8. Estimation methodology used and assumptions`,
    placeholders: ['[Description]', '[Team]', '[Requirements]', '[Risks]', '[Methodology]', '[Constraints]'],
  },
  {
    promptId: 'PM_008', category: 'Project Management', subcategory: 'Retro',
    title: 'Agile Retrospective Facilitator',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['retrospective', 'agile', 'improvement', 'team'],
    description: 'Facilitate effective agile retrospectives with proven formats.',
    promptText: `Hello ChatGPT,
Facilitate an agile retrospective for my team.

● Sprint/Project Length: [X weeks]
● Team Size: [X]
● What Went Well: [List known positive things]
● What Didn't: [List known issues]
● Team Morale: [High / Medium / Low]
● Retro Format Preference: [Start-Stop-Continue / Mad-Sad-Glad / 4Ls / Sailboat / Custom]

Create a retrospective plan:
1. Check-in activity (icebreaker, 5 min)
2. Data gathering prompts (what happened? 10 min)
3. Insight generation (why did it happen? 10 min)
4. Action item creation (what will we change? 10 min)
5. Closing activity (5 min)
6. Action item tracking template
7. Facilitator tips for keeping it productive
8. Follow-up process (next retro review)`,
    placeholders: ['[Sprint length]', '[Team size]', '[Wins]', '[Issues]', '[Morale]', '[Format]'],
  },
  {
    promptId: 'PM_009', category: 'Project Management', subcategory: 'Remote',
    title: 'Remote Collaboration & Async Workflow Guide',
    difficulty: 'beginner', estimatedTime: '12 min',
    tags: ['remote', 'async', 'collaboration', 'tools'],
    description: 'Optimize remote team collaboration with async-first workflows.',
    promptText: `Hello ChatGPT,
Create an async-first collaboration guide for my remote team.

● Team Size: [X]
● Time Zones: [List or range]
● Key Tools: [Slack / Notion / Asana / Linear / GitHub / Google Docs]
● Current Pain Points: [Too many meetings / Slow decisions / Context switching / Information silos]
● Meeting Culture: [Meeting-heavy / Balanced / Async-preferred]

Create:
1. Async communication principles (written communication first)
2. Decision-making framework (DACI or RACI for async)
3. Documentation culture (write things down, share openly)
4. Meeting reduction strategy (meeting types that can be async)
5. Async standup format
6. Status update rhythm (weekly written updates)
7. Feedback culture (async code review, document review)
8. Tools and automation setup recommendations
9. Onboarding remote team members to async culture`,
    placeholders: ['[Team size]', '[Time zones]', '[Tools]', '[Pain points]', '[Meeting culture]'],
  },
  {
    promptId: 'PM_010', category: 'Project Management', subcategory: 'Tooling',
    title: 'Project Management Tool Setup & Workflow Design',
    difficulty: 'beginner', estimatedTime: '12 min',
    tags: ['project-management', 'tool', 'workflow', 'setup'],
    description: 'Configure your project management tool for your team\'s workflow.',
    promptText: `Hello ChatGPT,
Set up my project management tool for my team's workflow.

● Tool: [Asana / Jira / Trello / Linear / Monday / Notion / ClickUp]
● Team Size: [X]
● Methodology: [Kanban / Scrum / Custom]
● Project Types: [Software / Marketing / Operations / Design / Mixed]
● Custom Fields Needed: [Priority / Status / Department / Sprint / Epic]
● Automation Rules: [What should happen automatically?]

Provide:
1. Workspace/project structure recommendation
2. Board/view setup (columns, swimlanes, filters)
3. Custom fields and templates
4. Workflow states (to-do → in progress → review → done)
5. Automation rules to implement
6. Integration with other tools (Slack, GitHub, calendar)
7. Permission and access settings
8. Team onboarding guide to the tool`,
    placeholders: ['[Tool]', '[Team size]', '[Methodology]', '[Project types]', '[Fields]', '[Automation]'],
  },

  // === Batch 3: Additional Health & Fitness Prompts ===
  {
    promptId: 'HLT_007', category: 'Health & Fitness', subcategory: 'Nutrition',
    title: 'Grocery Shopping List & Meal Prep Guide',
    difficulty: 'beginner', estimatedTime: '8 min',
    tags: ['grocery', 'meal-prep', 'nutrition', 'planning'],
    description: 'Generate a grocery shopping list and meal prep plan for the week.',
    promptText: `Hello ChatGPT,
Create a grocery shopping list and meal prep plan for my week.

● Dietary Preference: [Omnivore / Vegetarian / Vegan / Keto / Paleo / Mediterranean]
● Calories Target: [X or "not tracking"]
● Meals to Prep: [Breakfast / Lunch / Dinner / Snacks / All]
● People to Feed: [X]
● Budget: [Low / Medium / High]
● Foods I Already Have: [List items to use up]
● Time for Cooking: [X hours on prep day]

Generate:
1. Meal plan for 7 days (breakfast, lunch, dinner, snacks)
2. Complete grocery shopping list (organized by store section)
3. Meal prep Sunday step-by-step plan
4. Storage instructions (fridge vs freezer, container type)
5. Recipes for 3 key meals (simple, 5-10 ingredients)
6. Estimated cost breakdown`,
    placeholders: ['[Diet]', '[Calories]', '[Meals]', '[People]', '[Budget]', '[Existing food]', '[Prep time]'],
  },
  {
    promptId: 'HLT_008', category: 'Health & Fitness', subcategory: 'HIIT',
    title: 'HIIT & Cardio Workout Generator',
    difficulty: 'beginner', estimatedTime: '8 min',
    tags: ['hiit', 'cardio', 'workout', 'interval'],
    description: 'Generate HIIT and cardio workouts for any fitness level.',
    promptText: `Hello ChatGPT,
Create a HIIT or cardio workout for me.

● Fitness Level: [Beginner / Intermediate / Advanced]
● Equipment Available: [None / Bodyweight / Dumbbells / Kettlebell / Treadmill / Bike / Rower]
● Duration: [10 / 15 / 20 / 30 / 45 minutes]
● Focus: [Fat burn / Endurance / Conditioning / General fitness]
● Intensity Preference: [Moderate / High / Maximum]
● Injuries/Limitations: [List or "none"]
● Location: [Home / Gym / Outdoor]

Provide:
1. Warm-up (5 minutes)
2. Workout structure (intervals, rounds, rest periods)
3. Exercise list with instructions
4. Cool-down and stretching (5 minutes)
5. Modifications for beginners / advanced
6. Heart rate zone guidance
7. Weekly progression plan`,
    placeholders: ['[Level]', '[Equipment]', '[Duration]', '[Focus]', '[Intensity]', '[Injuries]', '[Location]'],
  },
  {
    promptId: 'HLT_009', category: 'Health & Fitness', subcategory: 'Yoga',
    title: 'Yoga & Flexibility Routine Designer',
    difficulty: 'beginner', estimatedTime: '8 min',
    tags: ['yoga', 'flexibility', 'stretching', 'mobility'],
    description: 'Create a yoga or flexibility routine for any level.',
    promptText: `Hello ChatGPT,
Create a yoga or flexibility routine for me.

● Experience: [Beginner / Intermediate / Advanced]
● Goal: [Flexibility / Relaxation / Strength / Balance / Recovery]
● Duration: [10 / 15 / 20 / 30 / 45 / 60 minutes]
● Focus Areas: [Full body / Hips / Shoulders / Back / Legs]
● Style Preference: [Hatha / Vinyasa / Yin / Restorative / Power / Mixed]
● Available Props: [Mat / Blocks / Strap / None]
● Injuries: [List or "none"]

Provide:
1. Sequence of poses with Sanskrit and English names
2. Breathing instructions (when to inhale/exhale)
3. Hold durations and transitions
4. Modifications for each pose (easier + harder)
5. Alignment cues
6. Closing relaxation (savasana)
7. Weekly progression or variation suggestions`,
    placeholders: ['[Experience]', '[Goal]', '[Duration]', '[Focus]', '[Style]', '[Props]', '[Injuries]'],
  },
  {
    promptId: 'HLT_010', category: 'Health & Fitness', subcategory: 'Wellness',
    title: 'Daily Wellness Routine Builder',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['wellness', 'routine', 'morning', 'evening', 'habits'],
    description: 'Design a holistic daily wellness routine for mind and body.',
    promptText: `Hello ChatGPT,
Design a daily wellness routine for me.

● Wake-up Time: [Insert time]
● Bedtime: [Insert time]
● Available Morning Time: [X minutes]
● Available Evening Time: [X minutes]
● Wellness Goals: [More energy / Less stress / Better sleep / Focus / Strength / Flexibility]
● Current Habits: [What do you already do?]
● Stressors: [Work / Family / Health / Finance / Other]
● Preferences: [Meditation / Journaling / Exercise / Reading / Cold exposure / Breathing]

Design:
1. Morning routine (30-60 minutes, step-by-step)
2. Workday wellness (movement breaks, hydration, focus blocks)
3. Evening wind-down routine (30-60 minutes)
4. Weekly reset (weekend practices)
5. Habit stacking guide (attach new habits to existing ones)
6. Progress tracking method`,
    placeholders: ['[Wake-up]', '[Bedtime]', '[AM time]', '[PM time]', '[Goals]', '[Current habits]', '[Stressors]', '[Preferences]'],
  },
  {
    promptId: 'HLT_011', category: 'Health & Fitness', subcategory: 'Supplements',
    title: 'Supplement & Nutrition Stack Guide',
    difficulty: 'intermediate', estimatedTime: '10 min',
    tags: ['supplements', 'vitamins', 'nutrition', 'optimization'],
    description: 'Get evidence-based supplement recommendations for your goals.',
    promptText: `Hello ChatGPT,
Recommend a supplement and nutrition stack for my goals.

● Primary Goal: [Energy / Muscle gain / Fat loss / Sleep / Focus / Immunity / Longevity]
● Diet: [Omnivore / Vegetarian / Vegan / Keto / Paleo / Mediterranean]
● Activity Level: [Sedentary / Light / Moderate / Very active / Athlete]
● Known Deficiencies: [If known from blood work]
● Current Supplements: [List what you take]
● Budget: [Low / Medium / High]
● Health Conditions: [List or "none"]

Provide:
1. Core supplement recommendations with dosage
2. Timing guide (when to take each)
3. Food sources to prioritize (food first approach)
4. Interactions and contraindications
5. Quality and brand selection tips
6. Cycling and tolerance considerations
7. Expected timeline for results
8. When to get blood work to verify`,
    placeholders: ['[Goal]', '[Diet]', '[Activity]', '[Deficiencies]', '[Current supplements]', '[Budget]', '[Health conditions]'],
  },

  // === Batch 3: Additional Prompt Engineering Prompts ===
  {
    promptId: 'PE_009', category: 'Prompt Engineering', subcategory: 'Frameworks',
    title: 'Prompt Framework Comparator (CARE, RICE, COSTAR, etc.)',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['frameworks', 'prompt-structures', 'comparison', 'methodology'],
    description: 'Compare and choose the best prompt framework for your use case.',
    promptText: `Hello ChatGPT,
Compare prompt engineering frameworks and recommend the best for my use case.

● My Use Case: [Writing / Analysis / Coding / Planning / Creative / Research]
● AI Tool: [ChatGPT / Claude / Gemini / Other]
● Complexity: [Simple / Moderate / Complex]
● Desired Output: [Structured / Creative / Analytical / Code]
● Experience Level: [Beginner / Intermediate / Advanced]

Analyse these frameworks:
1. RICE (Role, Instructions, Context, Example)
2. COSTAR (Context, Objective, Style, Tone, Audience, Response)
3. CARE (Context, Action, Result, Example)
4. TAG (Task, Action, Goal)
5. ROSES (Role, Objective, Scenario, Expected Solution, Steps)
6. Custom

Provide:
1. Best framework recommendation with reasoning
2. Complete prompt template for the recommended framework
3. Example filled-in prompt
4. Alternative framework for this use case
5. Tips to customize the framework`,
    placeholders: ['[Use case]', '[AI tool]', '[Complexity]', '[Output]', '[Level]'],
  },
  {
    promptId: 'PE_010', category: 'Prompt Engineering', subcategory: 'Techniques',
    title: 'Advanced Prompting Technique Generator',
    difficulty: 'advanced', estimatedTime: '15 min',
    tags: ['advanced', 'techniques', 'reasoning', 'prompt-engineering'],
    description: 'Apply advanced prompting techniques for complex reasoning tasks.',
    promptText: `Hello ChatGPT,
Apply advanced prompting techniques to my complex task.

● Task: [Describe your complex task]
● Desired Output: [What should the AI produce?]
● Challenges: [What makes this task hard?]
● Techniques I've Tried: [List or "none"]
● AI Model: [GPT-4 / Claude 3 / Gemini Pro / Other]
● Reasoning Required: [Yes / No]

Design prompts using these techniques:
1. Chain-of-thought (step-by-step reasoning)
2. Tree-of-thought (explore multiple reasoning paths)
3. Self-consistency (generate multiple answers, pick most common)
4. Least-to-most (break complex into subproblems)
5. Generated knowledge (AI generates facts first, then answers)
6. Reflection (AI critiques its own output)
7. Persona + expertise layering

For each: explanation, when to use, full prompt template, example output`,
    placeholders: ['[Task]', '[Output]', '[Challenges]', '[Techniques tried]', '[Model]', '[Reasoning needed]'],
  },
  {
    promptId: 'PE_011', category: 'Prompt Engineering', subcategory: 'Guardrails',
    title: 'AI Guardrails & Output Control System',
    difficulty: 'advanced', estimatedTime: '15 min',
    tags: ['guardrails', 'safety', 'control', 'boundaries'],
    description: 'Design guardrails and constraints to control AI output quality and safety.',
    promptText: `Hello ChatGPT,
Design guardrails and output controls for my AI system.

● Use Case: [Customer support / Content generation / Code generation / Moderation / Education]
● Audience: [General public / Internal team / Children / Professionals]
● Risk Level: [Low / Medium / High]
● Output Types: [Text / Code / JSON / Images / Mixed]
● Specific Constraints Needed: [No profanity / No medical advice / No bias / Factual accuracy]
● Compliance: [GDPR / HIPAA / COPPA / SOC2 / None]

Design a guardrail system:
1. System prompt constraints (rules for the AI)
2. Input filtering (what users can't ask)
3. Output filtering (what AI can't say)
4. Content moderation categories
5. Edge case handling (prompt injection, jailbreak attempts)
6. Human-in-the-loop triggers
7. Testing and validation approach
8. Monitoring and logging setup`,
    placeholders: ['[Use case]', '[Audience]', '[Risk level]', '[Output types]', '[Constraints]', '[Compliance]'],
  },
  {
    promptId: 'PE_012', category: 'Prompt Engineering', subcategory: 'Optimization',
    title: 'Prompt A/B Testing & Iteration Framework',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['ab-testing', 'optimization', 'iteration', 'metrics'],
    description: 'Set up a systematic prompt A/B testing and iteration process.',
    promptText: `Hello ChatGPT,
Set up an A/B testing framework for my prompts.

● Prompt Purpose: [Describe what the prompt does]
● Current Prompt: [PASTE CURRENT PROMPT]
● Success Criteria: [Output quality / Accuracy / Length / Tone / Format compliance]
● Testing Volume: [X runs per variant]
● Variables to Test: [Temperature / Prompt structure / Examples / Role framing / Constraints]

Provide:
1. A/B test methodology (how to set up and measure)
2. Variant generation (3-5 variants with one variable changed each)
3. Evaluation criteria and scoring rubric
4. Data collection approach
5. Statistical significance calculation
6. Winner selection and deployment process
7. Iteration cycle (how often to retest)
8. Common A/B testing pitfalls`,
    placeholders: ['[Purpose]', '[Current prompt]', '[Success criteria]', '[Volume]', '[Variables]'],
  },

  // === Batch 3: Additional eCommerce Prompts ===
  {
    promptId: 'ECOM_007', category: 'eCommerce & Customer Support', subcategory: 'Conversion',
    title: 'E-commerce Conversion Rate Optimization Plan',
    difficulty: 'intermediate', estimatedTime: '18 min',
    tags: ['cro', 'conversion', 'optimization', 'ecommerce'],
    description: 'Create a data-driven conversion rate optimization plan for your store.',
    promptText: `Hello ChatGPT,
Create a conversion rate optimization plan for my e-commerce store.

● Store URL: [Insert URL]
● Current Conversion Rate: [X% or "unknown"]
● Average Traffic: [X visitors/month]
● Average Order Value: [X]
● Top Traffic Sources: [Organic / Paid / Social / Email / Direct]
● Current CRO Efforts: [List or "none"]
● Tools Available: [Hotjar / Google Optimize / VWO / Lucky Orange / None]

Create a 90-day CRO plan:
1. Data collection and analysis (week 1)
2. Quick wins (weeks 1-2): fix obvious friction points
3. Checkout optimization (weeks 2-4)
4. Product page improvements (weeks 3-5)
5. Pricing and offers testing (weeks 4-6)
6. Mobile optimization (weeks 5-7)
7. Cart abandonment recovery (weeks 6-8)
8. Post-purchase optimization (weeks 7-9)
9. Full funnel review and next steps (weeks 10-12)`,
    placeholders: ['[URL]', '[CR rate]', '[Traffic]', '[AOV]', '[Sources]', '[Current efforts]', '[Tools]'],
  },
  {
    promptId: 'ECOM_008', category: 'eCommerce & Customer Support', subcategory: 'Customer Service',
    title: 'Live Chat & Chatbot Script Library',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['live-chat', 'chatbot', 'support', 'automation'],
    description: 'Build a library of live chat and chatbot scripts for common scenarios.',
    promptText: `Hello ChatGPT,
Create a library of live chat and chatbot scripts.

● Business Type: [E-commerce / SaaS / Service / Support]
● Brand Voice: [Friendly / Professional / Casual / Empathetic]
● Channels: [Website chat / WhatsApp / Messenger / SMS]
● Automation Level: [Full chatbot / Hybrid / Human-only]
● Common Chat Topics: [Order status / Returns / Pricing / Technical issues / Product questions]

Create scripts for:
1. Greeting and initiation (3 variations)
2. Order status inquiry response
3. Return/refund request handling
4. Technical issue troubleshooting flow
5. Product recommendation conversation
6. Price/discount inquiry handling
7. Abandoned cart chat recovery
8. Escalation to human agent
9. Closing and satisfaction check
10. Off-hours / away message`,
    placeholders: ['[Business type]', '[Voice]', '[Channels]', '[Automation]', '[Topics]'],
  },
  {
    promptId: 'ECOM_009', category: 'eCommerce & Customer Support', subcategory: 'Marketplace',
    title: 'Amazon FBA Product Research & Listing Guide',
    difficulty: 'intermediate', estimatedTime: '20 min',
    tags: ['amazon', 'fba', 'product-research', 'selling'],
    description: 'Research and optimize Amazon FBA product listings for success.',
    promptText: `Hello ChatGPT,
Guide me through Amazon FBA product research and listing optimization.

● Product Niche: [Insert niche or "need help finding one"]
● Budget: [X for initial inventory]
● Current Amazon Experience: [New / Some / Experienced]
● Target Margins: [X% minimum]
● Preferred Categories: [Categories you're interested in]
● Competition Comfort Level: [Low / Medium / High competition OK]

Provide:
1. Product research criteria (demand, competition, margin, seasonality)
2. Product opportunity analysis framework
3. Listing optimization (title, bullets, description, backend keywords)
4. Amazon PPC strategy (campaign structure, keywords, bids)
5. Pricing strategy (competitive positioning, promotions)
6. Review generation strategy (compliant)
7. Inventory management (forecasting, storage fees, replenishment)
8. Common mistakes to avoid as a new seller`,
    placeholders: ['[Niche]', '[Budget]', '[Experience]', '[Target margins]', '[Categories]', '[Competition level]'],
  },
  {
    promptId: 'ECOM_010', category: 'eCommerce & Customer Support', subcategory: 'Klaviyo',
    title: 'Klaviyo/Email Marketing Flow Builder',
    difficulty: 'intermediate', estimatedTime: '18 min',
    tags: ['klaviyo', 'email', 'flows', 'automation', 'ecommerce'],
    description: 'Design complete Klaviyo email marketing flows for e-commerce.',
    promptText: `Hello ChatGPT,
Design Klaviyo email flows for my e-commerce store.

● Store Platform: [Shopify / WooCommerce / BigCommerce / Custom]
● Products: [Describe main product categories]
● Average Order Value: [X]
● Email List Size: [X subscribers]
● Current Klaviyo Setup: [Basic / Some flows / Advanced / None]

Design these flows:
1. Welcome series (5 emails)
2. Abandoned cart (3 emails)
3. Browse abandonment (2 emails)
4. Post-purchase follow-up (4 emails)
5. Win-back (3 emails over 60 days)
6. Cross-sell / upsell (triggered by purchase)
7. Birthday / anniversary (1 email)
8. Review request (1 email + SMS)
For each: trigger, goal, email content, subject line, timing, segmentation`,
    placeholders: ['[Platform]', '[Products]', '[AOV]', '[List size]', '[Current setup]'],
  },

  // === Batch 3: Additional Travel Prompts ===
  {
    promptId: 'TRV_007', category: 'Travel & Lifestyle', subcategory: 'Road Trip',
    title: 'Road Trip Planner & Route Optimizer',
    difficulty: 'beginner', estimatedTime: '12 min',
    tags: ['road-trip', 'route', 'planning', 'driving'],
    description: 'Plan an optimized road trip route with stops and attractions.',
    promptText: `Hello ChatGPT,
Plan a road trip for my upcoming adventure.

● Starting Point: [City/Address]
● Destination: [City or "loop trip back to start"]
● Duration: [X days]
● Driving Preference: [Scenic / Fastest / Balanced]
● Interests: [Nature / History / Food / Cities / Hiking / Photography / Wine / Music]
● Budget: [Budget / Mid-range / Luxury]
● Accommodation Type: [Camping / Motel / Hotel / Airbnb / Mixed]

Create:
1. Day-by-day route with driving times and distances
2. Must-see stops and attractions along the way
3. Accommodation recommendations per night
4. Food highlights and restaurant suggestions
5. Packing list specific to road trips
6. Tips for each segment (road conditions, gas stations)
7. Backup plans for weather or closures
8. Music/podcast recommendations for the drive`,
    placeholders: ['[Start]', '[End]', '[Days]', '[Preference]', '[Interests]', '[Budget]', '[Accommodation]'],
  },
  {
    promptId: 'TRV_008', category: 'Travel & Lifestyle', subcategory: 'Solo',
    title: 'Solo Travel Planning & Safety Guide',
    difficulty: 'beginner', estimatedTime: '12 min',
    tags: ['solo-travel', 'safety', 'planning', 'confidence'],
    description: 'Plan a safe and enjoyable solo travel experience.',
    promptText: `Hello ChatGPT,
Create a solo travel plan for my trip.

● Destination: [City/Country]
● Duration: [X days]
● Experience Level: [First solo trip / Some experience / Frequent solo traveller]
● Comfort Level: [Nervous / Cautious / Confident]
● Interests: [Sightseeing / Food / Nature / Culture / Nightlife / Relaxation]
● Budget: [Budget / Mid-range / Luxury]

Create a solo travel guide:
1. Destination suitability for solo travellers
2. Safety tips and local scams to avoid
3. Accommodation recommendations (social vs private)
4. Day-by-day itinerary (with solo-friendly activities)
5. Meeting people: social spots, tours, apps
6. Dining alone tips
7. Photo-taking strategies (selfies, asking strangers, gear)
8. Emergency plan (contacts, embassy, insurance)
9. Packing list for solo travel`,
    placeholders: ['[Destination]', '[Duration]', '[Experience]', '[Comfort]', '[Interests]', '[Budget]'],
  },
  {
    promptId: 'TRV_009', category: 'Travel & Lifestyle', subcategory: 'Photography',
    title: 'Destination Photography Location Guide',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['photography', 'locations', 'golden-hour', 'instagram'],
    description: 'Find the best photography spots and times at your destination.',
    promptText: `Hello ChatGPT,
Create a photography location guide for my destination.

● Destination: [City/Country/Region]
● Photography Style: [Landscape / Portrait / Street / Architecture / Nature / Mixed]
● Gear: [Phone / DSLR / Mirrorless / Drone / Film]
● Time of Visit: [Season, month]
● Skill Level: [Beginner / Intermediate / Advanced]
● Physical Difficulty: [Easy walks / Hiking / Any]

Provide:
1. Top 10 photo locations with GPS coordinates
2. Best time of day to shoot each location
3. Composition tips for each spot
4. Recommended camera settings
5. Permit or access requirements (especially for drones)
6. Sunrise/sunset times and angles
7. Less-crowded alternatives to popular spots
8. Editing style suggestions for the destination
9. Instagram caption ideas`,
    placeholders: ['[Destination]', '[Style]', '[Gear]', '[Season]', '[Level]', '[Difficulty]'],
  },
  {
    promptId: 'TRV_010', category: 'Travel & Lifestyle', subcategory: 'Workcation',
    title: 'Workcation Planning (Work + Travel)',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['workcation', 'remote-work', 'travel', 'productivity'],
    description: 'Plan a productive workcation that balances work and exploration.',
    promptText: `Hello ChatGPT,
Plan a workcation for me (work + travel combo).

● Destination: [City/Country]
● Duration: [X days/weeks]
● Work Hours Required: [X hours/week, X timezone preference]
● Meeting Schedule: [Fixed meeting times or async]
● Work Setup Needed: [Laptop / Monitor / External keyboard / Ergonomic setup / Stable internet]
● Non-Work Goals: [Sightseeing / Hiking / Relaxation / Social / Learning]
● Budget: [Budget / Mid-range / Luxury]

Create a workcation plan:
1. Accommodation with workspace (coworking-friendly)
2. Daily schedule (work blocks + exploration blocks)
3. Coworking spaces and café recommendations
4. Internet reliability assessment and backup plan
5. Weekend trip and activity suggestions
6. Meal planning (cook vs eat out balance)
7. Time zone management strategy
8. Productivity tips for working while travelling
9. Packing list for digital nomads`,
    placeholders: ['[Destination]', '[Duration]', '[Work hours]', '[Meetings]', '[Setup]', '[Goals]', '[Budget]'],
  },

  // === Batch 3: Additional Web Design Prompts ===
  {
    promptId: 'WEB_007', category: 'Web Design & UX', subcategory: 'Design Systems',
    title: 'Design System & Component Library Builder',
    difficulty: 'advanced', estimatedTime: '25 min',
    tags: ['design-system', 'components', 'ui-library', 'consistency'],
    description: 'Create a design system and component library for your product.',
    promptText: `Hello ChatGPT,
Create a design system plan for my product.

● Product Type: [Web app / Mobile app / Design agency / SaaS]
● Current State: [No design system / Partial / Needs restructuring]
● Team: [X designers, X developers]
● Tech Stack: [React / Vue / Flutter / SwiftUI / Webflow / Framer]
● Brand Guidelines: [Exist / Need to create / Need updating]
● Components Already Built: [List or "none"]

Design a design system:
1. Design tokens (colours, typography, spacing, shadows, breakpoints)
2. Component hierarchy (atoms → molecules → organisms → templates)
3. Core component list with descriptions (minimum 20 components)
4. Component documentation template
5. Naming conventions
6. Versioning and release process
7. Accessibility standards to follow
8. Figma/design tool setup
9. Developer handoff process
10. Maintenance and governance plan`,
    placeholders: ['[Product type]', '[Current state]', '[Team]', '[Stack]', '[Brand]', '[Existing components]'],
  },
  {
    promptId: 'WEB_008', category: 'Web Design & UX', subcategory: 'Mobile',
    title: 'Mobile App UX Design Guide',
    difficulty: 'intermediate', estimatedTime: '18 min',
    tags: ['mobile', 'app', 'ux', 'ios', 'android'],
    description: 'Design a user-friendly mobile app experience with best practices.',
    promptText: `Hello ChatGPT,
Design a mobile app UX for my product.

● App Type: [Utility / Social / E-commerce / Productivity / Health / Entertainment]
● Platform: [iOS / Android / Both]
● Core Features: [List 3-5 core features]
● Target Users: [Describe demographic and tech comfort]
● Design Style: [Minimal / Bold / Playful / Professional / Dark mode]
● Current Stage: [Idea / Wireframe / Design / Development / Live]

Provide:
1. User flow diagram (key screens and navigation)
2. Screen-by-screen UX description
3. Navigation pattern recommendation (tab bar / drawer / gesture)
4. Touch interaction design (buttons, gestures, haptics)
5. Mobile-specific UX patterns (pull-to-refresh, swipe, long-press)
6. Form design for mobile (thumb zones, auto-fill, validation)
7. Loading and error states
8. Push notification strategy
9. Accessibility (VoiceOver, TalkBack, dynamic text)
10. Platform-specific guidelines (iOS HIG vs Material Design)`,
    placeholders: ['[App type]', '[Platform]', '[Features]', '[Users]', '[Style]', '[Stage]'],
  },
  {
    promptId: 'WEB_009', category: 'Web Design & UX', subcategory: 'SEO',
    title: 'SEO-Friendly Web Design Checklist',
    difficulty: 'beginner', estimatedTime: '12 min',
    tags: ['seo', 'web-design', 'technical', 'structure'],
    description: 'Design websites that are search-engine friendly from day one.',
    promptText: `Hello ChatGPT,
Create an SEO-friendly web design checklist.

● Site Type: [Blog / E-commerce / SaaS / Portfolio / Business / Directory]
● CMS/Builder: [WordPress / Webflow / Framer / Shopify / Custom / Not sure yet]
● Design Phase: [Planning / Wireframing / Design / Development / Live]
● Current SEO Knowledge: [None / Basic / Intermediate / Advanced]

Provide a checklist organized by phase:
1. Information architecture (URL structure, navigation, hierarchy)
2. Content structure (H1-H6 hierarchy, semantic HTML, heading structure)
3. Technical foundation (page speed, mobile responsiveness, SSL, sitemap)
4. On-page elements (title tags, meta descriptions, Open Graph, structured data)
5. Images and media (alt text, file names, compression, lazy loading)
6. Internal linking strategy
7. Performance optimization (Core Web Vitals, caching, CDN)
8. Launch checklist (analytics, Search Console, redirects)
9. Post-launch monitoring`,
    placeholders: ['[Site type]', '[CMS]', '[Phase]', '[SEO knowledge]'],
  },
  {
    promptId: 'WEB_010', category: 'Web Design & UX', subcategory: 'E-commerce UX',
    title: 'E-commerce Checkout UX Optimization',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['checkout', 'ecommerce', 'ux', 'conversion'],
    description: 'Optimize your e-commerce checkout flow to reduce cart abandonment.',
    promptText: `Hello ChatGPT,
Optimize my e-commerce checkout UX.

● Store Platform: [Shopify / WooCommerce / Magento / BigCommerce / Custom]
● Current Checkout Type: [Single page / Multi-step / One-page]
● Current Abandonment Rate: [X% or "unknown"]
● Average Cart Value: [X]
● Guest Checkout: [Available / Required login / Not sure]
● Payment Methods: [Credit card / PayPal / Apple Pay / Shop Pay / Other]
● Known Issues: [Slow loading / Confusing / Too many steps / No trust signals]

Provide:
1. Checkout flow audit (steps, friction points, opportunities)
2. Best practices for each checkout element
3. Progress indicator design
4. Form optimization (fields to include/remove, auto-fill, validation)
5. Trust signal placement (security badges, return policy, testimonials)
6. Mobile checkout optimization
7. Payment method UX (Apple Pay, Shop Pay, express checkout)
8. Error handling and validation UX
9. Post-purchase confirmation page
10. A/B testing ideas for checkout`,
    placeholders: ['[Platform]', '[Type]', '[Abandonment]', '[AOV]', '[Guest checkout]', '[Payments]', '[Issues]'],
  },

  // === Batch 3: Additional Language Learning Prompts ===
  {
    promptId: 'LANG_007', category: 'Language Learning', subcategory: 'Listening',
    title: 'Listening Comprehension Practice Builder',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['listening', 'comprehension', 'audio', 'dictation'],
    description: 'Create listening comprehension exercises in your target language.',
    promptText: `Hello ChatGPT,
Create a listening comprehension practice session.

● Language: [Insert language]
● My Level: [A1 / A2 / B1 / B2 / C1]
● Topic: [Insert preferred topic]
● Native Speaker Speed: [Slow / Moderate / Natural]
● Exercise Type: [Dictation / Gap-fill / Comprehension Q&A / Shadowing]

Create:
1. A short paragraph in the target language (at natural speed level)
2. Slowed-down version with pauses for dictation
3. Comprehension questions (5 questions)
4. Transcript with vocabulary annotations
5. Translation to native language
6. Pronunciation notes (link speech sounds to spelling)
7. Shadowing script (for speaking practice)
8. Key grammar points in the passage`,
    placeholders: ['[Language]', '[Level]', '[Topic]', '[Speed]', '[Type]'],
  },
  {
    promptId: 'LANG_008', category: 'Language Learning', subcategory: 'Speaking',
    title: 'Speaking Practice & Dialogue Simulation',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['speaking', 'dialogue', 'conversation', 'practice'],
    description: 'Practice real-life conversations with dialogue simulations.',
    promptText: `Hello ChatGPT,
Create a dialogue simulation for speaking practice.

● Language: [Insert language]
● Level: [A1 / A2 / B1 / B2 / C1]
● Scenario: [Restaurant / Hotel / Job interview / Shopping / Doctor / Airport / Business meeting]
● Role I Play: [Customer / Patient / Employee / Tourist / Student]
● Difficulty Level: [Easy / Medium / Hard]
● Grammar Focus: [Specific tense or structure to practice]

Create:
1. Scenario setup and context
2. Key vocabulary for the scenario (10-15 words)
3. Dialogue script (their lines with blanks for my responses)
4. Response options at each step (correct + common mistakes)
5. Alternative dialogue branch (depending on choices)
6. Cultural notes about the scenario
7. Post-dialogue reflection questions`,
    placeholders: ['[Language]', '[Level]', '[Scenario]', '[My role]', '[Difficulty]', '[Grammar focus]'],
  },
  {
    promptId: 'LANG_009', category: 'Language Learning', subcategory: 'Writing',
    title: 'Writing Practice with Error Correction',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['writing', 'correction', 'feedback', 'essay'],
    description: 'Practice writing in your target language with AI correction.',
    promptText: `Hello ChatGPT,
Help me practice writing in my target language.

● Language: [Insert language]
● My Native Language: [Insert native language]
● Level: [A1 / A2 / B1 / B2 / C1]
● Topic: [Writing prompt or topic]
● Word Count Goal: [X words]
● Grammar Focus: [Specific grammar to practice]
● Writing Type: [Formal / Informal / Persuasive / Descriptive / Narrative]

I will write a text. Then you:
1. Correct my errors (categorize: grammar, vocabulary, spelling, style)
2. Provide corrected version
3. Explain each correction (why the original was wrong)
4. Suggest more natural alternatives
5. Highlight 3 things I did well
6. Give a level assessment
7. Suggest next topics to practice

[START WRITING HERE IN THE TARGET LANGUAGE]`,
    placeholders: ['[Language]', '[Native]', '[Level]', '[Topic]', '[Word count]', '[Focus]', '[Type]'],
  },
  {
    promptId: 'LANG_010', category: 'Language Learning', subcategory: 'Exam Prep',
    title: 'Language Exam Preparation (DELE, DELF, JLPT, etc.)',
    difficulty: 'advanced', estimatedTime: '18 min',
    tags: ['exam', 'preparation', 'dele', 'delf', 'jlpt', 'toefl'],
    description: 'Prepare for standardized language exams with targeted practice.',
    promptText: `Hello ChatGPT,
Prepare me for my language proficiency exam.

● Exam: [DELE / DELF / JLPT / TOEFL / IELTS / HSK / CELI / Other]
● Target Level: [A1 / A2 / B1 / B2 / C1 / C2]
● Exam Sections: [Reading / Writing / Listening / Speaking / Grammar]
● Exam Date: [X months/weeks away]
● Current Practice Materials: [List or "none"]
● Weak Areas: [Which sections are hardest?]
● Study Time Available: [X hours per week]

Create a study plan:
1. Exam breakdown (sections, timing, scoring)
2. Weekly study schedule leading to exam date
3. Practice exercises for each section
4. Test-taking strategies and time management
5. Sample questions with model answers
6. Common mistakes and how to avoid them
7. Resources and practice materials
8. Last week preparation checklist
9. Test day tips`,
    placeholders: ['[Exam]', '[Target level]', '[Sections]', '[Date]', '[Materials]', '[Weak areas]', '[Study time]'],
  },

  // === Batch 3: Additional Logistics Prompts ===
  {
    promptId: 'LOG_007', category: 'Logistics & Supply Chain', subcategory: 'Warehouse',
    title: 'Warehouse Layout & Operations Design',
    difficulty: 'advanced', estimatedTime: '20 min',
    tags: ['warehouse', 'layout', 'operations', 'efficiency'],
    description: 'Design an efficient warehouse layout and operations workflow.',
    promptText: `Hello ChatGPT,
Design a warehouse layout and operations plan.

● Warehouse Size: [X sq ft/m]
● Product Types: [Size, weight, storage requirements]
● SKU Count: [X]
● Order Volume: [X orders/day]
● Picking Method: [Piece / Case / Pallet]
● Current Issues: [Inefficient picking / Congestion / Low accuracy / Space utilization]
● Automation Level: [Manual / Semi-automated / Automated]
● Staff: [X pickers, X packers, X supervisors]

Design:
1. Warehouse zone layout (receiving, storage, picking, packing, shipping)
2. Storage method recommendation (pallet rack, shelving, bin, AS/RS)
3. Picking strategy (zone, wave, batch, or discrete)
4. Slotting optimization (fast movers near shipping)
5. Material handling equipment recommendations
6. Packing station design
7. Shipping and loading dock layout
8. WMS requirements
9. KPIs to track (accuracy, throughput, cost per order)
10. Safety and ergonomics considerations`,
    placeholders: ['[Size]', '[Products]', '[SKUs]', '[Volume]', '[Picking]', '[Issues]', '[Automation]', '[Staff]'],
  },
  {
    promptId: 'LOG_008', category: 'Logistics & Supply Chain', subcategory: 'Last Mile',
    title: 'Last-Mile Delivery Optimization Plan',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['last-mile', 'delivery', 'logistics', 'optimization'],
    description: 'Optimize your last-mile delivery operations for cost and speed.',
    promptText: `Hello ChatGPT,
Optimize my last-mile delivery operations.

● Delivery Volume: [X packages/day]
● Delivery Area: [Urban / Suburban / Rural / Mixed]
● Fleet: [Own vehicles / 3PL / Crowdsourced / Drones / Mixed]
● Average Distance Per Stop: [X miles/km]
● Delivery Windows: [Same day / Next day / Scheduled / All-day]
● Current Issues: [High cost per delivery / Missed windows / Returns / Damages]
● Tech Used: [Route optimization / Tracking / Proof of delivery / None]

Provide:
1. Route optimization strategy
2. Fleet mix recommendation (own vs 3PL vs gig)
3. Delivery window design (customer preference vs efficiency)
4. Failed delivery reduction tactics
5. Returns management (reverse logistics)
6. Real-time tracking and communication
7. Driver incentive structure
8. Sustainability considerations (EV, route density)
9. KPIs (cost per stop, on-time rate, stops per route)
10. Technology stack recommendations`,
    placeholders: ['[Volume]', '[Area]', '[Fleet]', '[Distance]', '[Windows]', '[Issues]', '[Tech]'],
  },
  {
    promptId: 'LOG_009', category: 'Logistics & Supply Chain', subcategory: 'Compliance',
    title: 'Trade Compliance & Customs Documentation Guide',
    difficulty: 'advanced', estimatedTime: '18 min',
    tags: ['customs', 'compliance', 'trade', 'international', 'documentation'],
    description: 'Navigate international trade compliance and customs documentation.',
    promptText: `Hello ChatGPT,
Create a trade compliance and customs guide for my shipments.

● Business Type: [Importer / Exporter / Both]
● Countries Involved: [Origin and destination countries]
● Product Types: [Describe goods being shipped]
● Shipment Frequency: [Daily / Weekly / Monthly / Occasional]
● Current Compliance Knowledge: [None / Basic / Intermediate / Advanced]
● Incoterms Used: [FOB / CIF / DDP / EXW / Other]
● HS Code Status: [Know them / Need classification / Not sure]

Provide:
1. Required documentation checklist per country pair
2. HS code classification guidance
3. Customs valuation methods
4. Duties, taxes, and fee estimation
5. Incoterms explanation and recommendation
6. Restricted/prohibited items check
7. Record-keeping requirements
8. Broker selection criteria
9. Common compliance mistakes and penalties
10. Free trade agreement eligibility`,
    placeholders: ['[Business type]', '[Countries]', '[Products]', '[Frequency]', '[Knowledge]', '[Incoterms]', '[HS codes]'],
  },
  {
    promptId: 'LOG_010', category: 'Logistics & Supply Chain', subcategory: 'Risk',
    title: 'Supply Chain Risk Assessment & Resilience Plan',
    difficulty: 'advanced', estimatedTime: '20 min',
    tags: ['risk', 'resilience', 'disruption', 'contingency'],
    description: 'Identify supply chain risks and build resilience against disruptions.',
    promptText: `Hello ChatGPT,
Create a supply chain risk assessment and resilience plan.

● Industry: [Insert industry]
● Supply Chain Regions: [List key regions]
● Key Suppliers: [Number and locations]
● Single Points of Failure: [Known dependencies]
● Past Disruptions: [Describe previous issues]
● Current Risk Management: [What already exists?]
● Budget for Resilience: [Low / Medium / High]

Provide:
1. Risk identification matrix (by category: supplier, geopolitical, natural, operational, cyber)
2. Risk scoring (likelihood × impact for each)
3. Critical supplier assessment framework
4. Diversification strategy (multi-sourcing, regional)
5. Inventory buffer / safety stock recommendations
6. Alternate transportation routes and modes
7. Technology solutions (visibility, monitoring, AI)
8. Business continuity plan template
9. Insurance coverage review
10. Resilience metrics and monitoring`,
    placeholders: ['[Industry]', '[Regions]', '[Suppliers]', '[SPOFs]', '[Past disruptions]', '[Current approach]', '[Budget]'],
  },
  {
    promptId: 'MKT_024', category: 'Marketing & Social Media', subcategory: 'Video',
    title: 'YouTube Channel Growth Strategy',
    difficulty: 'intermediate', estimatedTime: '18 min',
    tags: ['youtube', 'growth', 'strategy', 'content'],
    description: 'Build a data-driven YouTube growth strategy from scratch.',
    promptText: `Hello ChatGPT,
Create a YouTube channel growth strategy for my niche.

● Channel Topic: [Insert niche]
● Current Subscribers: [X]
● Current Upload Frequency: [X per week/month]
● Average Views Per Video: [X]
● Top Performing Video Type: [Tutorial / Vlog / Review / Educational]
● Goal: [X subscribers, X views, X revenue in X months]

Create a 90-day growth plan:
1. Content strategy (video types, topics, series ideas)
2. Upload schedule optimization
3. Thumbnail and title best practices
4. SEO optimization (tags, descriptions, chapters)
5. Audience engagement tactics (comments, community tab, polls)
6. Collaboration and cross-promotion strategy
7. Analytics review cadence and key metrics
8. Monetization milestones`,
    placeholders: ['[Niche]', '[Subs]', '[Frequency]', '[Avg views]', '[Best format]', '[Goal]'],
  },
  {
    promptId: 'MKT_025', category: 'Marketing & Social Media', subcategory: 'Analytics',
    title: 'Marketing Attribution Model Setup',
    difficulty: 'advanced', estimatedTime: '20 min',
    tags: ['attribution', 'analytics', 'roi', 'tracking'],
    description: 'Set up a marketing attribution model to measure channel performance.',
    promptText: `Hello ChatGPT,
Set up a marketing attribution model for my business.

● Business Type: [SaaS / E-commerce / B2B / B2C / Agency]
● Marketing Channels Used: [Organic / Paid / Social / Email / Referral / Direct / Events]
● Sales Cycle Length: [Short / Medium / Long]
● Tracking Tools: [Google Analytics / HubSpot / Mixpanel / Custom / None]
● Current Attribution: [Last-click / First-click / None / Multi-touch]

Provide:
1. Attribution model recommendation with reasoning
2. UTM parameter strategy (consistent naming convention)
3. Tracking implementation checklist
4. Multi-touch attribution setup (if recommended)
5. Channel value comparison methodology
6. Reporting dashboard design
7. Common attribution pitfalls and how to handle them
8. Incrementality testing approach`,
    placeholders: ['[Business type]', '[Channels]', '[Cycle]', '[Tools]', '[Current model]'],
  },
  {
    promptId: 'SEO_017', category: 'SEO Optimization', subcategory: 'Video',
    title: 'YouTube SEO Optimization Guide',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['youtube-seo', 'video-seo', 'ranking', 'discovery'],
    description: 'Optimize your YouTube videos to rank higher in search.',
    promptText: `Hello ChatGPT,
Optimize my YouTube videos for search discovery.

● Channel Topic: [Insert niche]
● Target Keywords: [Insert main keywords]
● Current Video SEO Practices: [Describe or "none"]
● Average CTR: [X% or "unknown"]
● Average Retention: [X% or "unknown"]

Provide a video SEO checklist:
1. Keyword research for YouTube (tool recommendations)
2. Title optimization (formats, keyword placement, power words)
3. Thumbnail design principles for CTR
4. Description optimization (keyword-rich, timestamped)
5. Tags strategy (primary, secondary, broad)
6. Captions and subtitles (upload .srt or auto-sync)
7. Chapters/timestamps best practices
8. End screen and cards strategy
9. Playlist optimization
10. Audience retention analysis and improvement`,
    placeholders: ['[Niche]', '[Keywords]', '[Current SEO]', '[CTR]', '[Retention]'],
  },
  {
    promptId: 'SALES_013', category: 'Sales & Persuasion', subcategory: 'Prospecting',
    title: 'B2B Prospecting & Lead Generation System',
    difficulty: 'intermediate', estimatedTime: '18 min',
    tags: ['prospecting', 'lead-generation', 'b2b', 'outbound'],
    description: 'Build a repeatable B2B prospecting and lead generation system.',
    promptText: `Hello ChatGPT,
Build a B2B prospecting system for my business.

● My Product/Service: [Insert name]
● Ideal Customer Profile: [Industry, size, role, pain point]
● Target Geography: [City / Country / Global]
● Sales Cycle: [Short / Medium / Long]
● Current Lead Sources: [List or "none"]
● Monthly Lead Target: [X qualified leads]

Create a prospecting system:
1. Lead sourcing channels (LinkedIn, databases, referrals, events, cold outreach)
2. Lead qualification criteria and scoring
3. Prospecting daily routine template
4. Multi-channel outreach sequence (email + LinkedIn + call)
5. Personalization framework at scale
6. CRM tracking and pipeline management
7. Lead magnet / value-first approach
8. Metrics (contacts reached, meetings booked, conversion rate)
9. Tools stack recommendation`,
    placeholders: ['[Product]', '[ICP]', '[Geography]', '[Cycle]', '[Current sources]', '[Target]'],
  },
  {
    promptId: 'CODE_019', category: 'Coding & Development', subcategory: 'Clean Code',
    title: 'Clean Code & Refactoring Principles Guide',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['clean-code', 'refactoring', 'principles', 'quality'],
    description: 'Apply clean code principles and refactor your codebase.',
    promptText: `Hello ChatGPT,
Help me apply clean code principles and refactor my code.

● Language: [Insert language]
● Code Smells Present: [Long methods / Duplicate code / Large classes / Poor naming / Deep nesting / Magic numbers]
● Current Architecture: [Describe or "none"]
● Testing Coverage: [None / Minimal / Good]
● Team Size: [X]
● Refactoring Goal: [Readability / Performance / Maintainability / All]

Provide:
1. Clean code principles checklist for this codebase
2. Naming conventions (variables, functions, classes, files)
3. Function/method design best practices (single responsibility, length, parameters)
4. Comment and documentation standards
5. Error handling patterns
6. Refactoring priority list (quick wins first)
7. Refactoring techniques (extract method, rename, move, etc.)
8. How to refactor without breaking things
9. Code review checklist`,
    placeholders: ['[Language]', '[Smells]', '[Architecture]', '[Test coverage]', '[Team size]', '[Goal]'],
  },
  {
    promptId: 'DATA_010', category: 'Data Analysis', subcategory: 'Presentation',
    title: 'Data Presentation & Executive Summary Writer',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['presentation', 'executive-summary', 'reporting', 'insights'],
    description: 'Turn data analysis into compelling executive summaries and presentations.',
    promptText: `Hello ChatGPT,
Turn my data analysis into an executive presentation.

● Analysis Topic: [What was analysed?]
● Key Findings: [List 3-5 main insights]
● Data Sources: [Where did the data come from?]
● Audience: [C-suite / Management / Team / Client / Board]
● Decision Needed: [What decision does this inform?]
● Recommendation: [Your proposed course of action]

Create:
1. Executive summary (1 page, 5 paragraphs max)
2. Key insight highlights (3-5 with supporting data points)
3. Recommended visualizations for each insight
4. Narrative flow for the presentation (story arc)
5. Speaker notes for each slide
6. Q&A preparation (anticipated questions and answers)
7. Call to action and next steps
8. Appendix structure (detailed data, methodology)`,
    placeholders: ['[Topic]', '[Findings]', '[Sources]', '[Audience]', '[Decision]', '[Recommendation]'],
  },
  {
    promptId: 'CRSE_012', category: 'Online Course Creation', subcategory: 'Content',
    title: 'Course Content Migration & Repurposing Guide',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['migration', 'repurposing', 'content', 'udemy'],
    description: 'Migrate or repurpose existing content into a new course format.',
    promptText: `Hello ChatGPT,
Help me migrate or repurpose existing content into a course.

● Existing Content: [Blog posts / YouTube videos / Podcasts / PDFs / Workshops]
● Volume: [X pieces of content]
● Target Course Topic: [Desired course topic]
● Target Platform: [Udemy / Teachable / Kajabi / Your site]
● Content Gap: [What topics are missing from your existing content?]

Provide:
1. Content audit framework (what maps to course modules)
2. Repurposing workflow (existing → course format)
3. Module and lesson structure based on existing content
4. New content needs assessment (what must be created from scratch)
5. Production timeline
6. Quality control checklist
7. Platform-specific formatting requirements`,
    placeholders: ['[Existing content type]', '[Volume]', '[Course topic]', '[Platform]', '[Gaps]'],
  },
  {
    promptId: 'PM_011', category: 'Project Management', subcategory: 'Productivity',
    title: 'Personal Productivity System for Project Managers',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['productivity', 'time-management', 'gtd', 'focus'],
    description: 'Design a personal productivity system for managing multiple projects.',
    promptText: `Hello ChatGPT,
Design a personal productivity system for me as a project manager.

● Projects Managed: [X projects simultaneously]
● Team Size: [X people across projects]
● Daily Interruptions: [Meetings / Slack / Email / Ad-hoc requests]
● Current System: [Todoist / Notion / Pen and paper / Nothing / Google Calendar]
● Biggest Time Waster: [Context switching / Over-communication / Perfectionism / Lack of priorities]

Design:
1. Daily workflow template (time blocks for deep work, meetings, admin)
2. Weekly planning ritual (Sunday review, priority setting)
3. Task management approach (capture, prioritize, execute, review)
4. Meeting management (batching, agenda requirement, time limits)
5. Email/Slack processing system (inbox zero approach)
6. Context switching reduction strategies
7. Energy management (work when you're most productive)
8. Tools and automation recommendations
9. Weekly review template`,
    placeholders: ['[Project count]', '[Team size]', '[Interruptions]', '[Current system]', '[Biggest time waster]'],
  },
  {
    promptId: 'HLT_012', category: 'Health & Fitness', subcategory: 'Posture',
    title: 'Posture Correction & Desk Ergonomics Guide',
    difficulty: 'beginner', estimatedTime: '8 min',
    tags: ['posture', 'ergonomics', 'desk', 'back-pain'],
    description: 'Fix your posture and set up an ergonomic workstation.',
    promptText: `Hello ChatGPT,
Create a posture correction and desk ergonomics guide.

● Hours at Desk Per Day: [X hours]
● Current Desk Setup: [Laptop / Monitor / Standing desk / Regular desk]
● Pain Areas: [Neck / Shoulders / Lower back / Wrists / Eyes]
● Exercise Frequency: [X times per week]
● Standing Capability: [Can stand / Need sitting accommodation]

Provide:
1. Ideal ergonomic desk setup (monitor height, chair position, keyboard, mouse)
2. Posture checklist (what to check every 30 minutes)
3. 5-minute desk stretch routine (hourly)
4. Strengthening exercises for postural muscles
5. Stretching routine for tight areas (chest, hips, hamstrings)
6. Standing desk usage guide (how long, transitions)
7. Eye strain prevention (20-20-20 rule, blue light, lighting)
8. Habit reminders and tracking approach`,
    placeholders: ['[Desk hours]', '[Setup]', '[Pain]', '[Exercise freq]', '[Standing ability]'],
  },
  {
    promptId: 'PE_013', category: 'Prompt Engineering', subcategory: 'Creative',
    title: 'Creative & Storytelling Prompt Designer',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['creative', 'storytelling', 'fiction', 'writing-prompts'],
    description: 'Design prompts that unlock AI creativity for storytelling and fiction.',
    promptText: `Hello ChatGPT,
Design prompts for creative storytelling and fiction writing.

● Genre: [Fantasy / Sci-fi / Romance / Mystery / Literary / Historical / Horror]
● Story Element to Develop: [Plot / Character / World / Dialogue / Theme / All]
● Tone: [Dark / Light / Epic / Intimate / Humorous / Suspenseful]
● Length Goal: [Flash fiction / Short story / Novel chapter / Series bible]
● Existing Material: [None / Concept / Partial draft / Full draft]

Create prompts for:
1. World-building (setting, history, rules, cultures)
2. Character development (backstory, motivation, arc, voice)
3. Plot structure (3-act, 5-act, or hero's journey)
4. Dialogue writing (character voice, subtext, pacing)
5. Scene description (sensory details, atmosphere)
6. Theme exploration (central ideas, symbolism)
7. Revision and editing (specific feedback areas)
Each with: prompt template, example output, customization tips`,
    placeholders: ['[Genre]', '[Element]', '[Tone]', '[Length]', '[Material]'],
  },
  {
    promptId: 'ECOM_011', category: 'eCommerce & Customer Support', subcategory: 'Retention',
    title: 'Customer Retention & Loyalty Program Design',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['retention', 'loyalty', 'repeat-customers', 'rewards'],
    description: 'Design a customer retention and loyalty program for your business.',
    promptText: `Hello ChatGPT,
Design a customer retention and loyalty program.

● Business Type: [SaaS / E-commerce / Subscription / Service / Retail]
● Average Customer LTV: [X]
● Churn Rate: [X% or "unknown"]
● Repeat Purchase Rate: [X% or "unknown"]
● Current Retention Tactics: [Email / Discounts / Community / None]
● Customer Segments: [New / Regular / VIP / At-risk]

Design:
1. Loyalty program structure (points / tiers / cashback / subscription)
2. Tier benefits and requirements (3-4 tiers)
3. Points earning and redemption mechanics
4. VIP program design (exclusive perks, early access)
5. Retention email sequence (at-risk customer re-engagement)
6. Win-back campaign (lapsed customers)
7. Referral program integration
8. Personalization tactics for retention
9. Metrics (repeat rate, churn, NPS, CLV)
10. Technology stack recommendation`,
    placeholders: ['[Type]', '[LTV]', '[Churn]', '[Repeat rate]', '[Current tactics]', '[Segments]'],
  },
  {
    promptId: 'TRV_011', category: 'Travel & Lifestyle', subcategory: 'Volunteer',
    title: 'Volunteer & Impact Travel Planner',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['volunteer', 'impact-travel', 'responsible', 'giving-back'],
    description: 'Plan a meaningful travel experience that gives back.',
    promptText: `Hello ChatGPT,
Plan a volunteer or impact travel experience.

● Destination Interest: [Region or country]
● Duration: [X weeks/months]
● Skills I Offer: [Teaching / Construction / Medical / Conservation / Tech / English / Other]
● Travel Style: [Group program / Independent / Home stay / Eco-lodge]
● Budget: [Budget / Mid-range / Flexible]
● Causes I Care About: [Education / Environment / Animals / Health / Community development]

Provide:
1. Recommended impact travel programs and organizations
2. Voluntourism red flags (what to avoid)
3. Pre-trip preparation (vaccinations, visas, insurance, training)
4. Packing list for volunteer travel
5. Cultural sensitivity guide
6. Budget breakdown (program fees + travel + living)
7. Post-trip integration (how to continue supporting)
8. Ethical considerations and responsible travel principles`,
    placeholders: ['[Region]', '[Duration]', '[Skills]', '[Style]', '[Budget]', '[Causes]'],
  },
  {
    promptId: 'WEB_011', category: 'Web Design & UX', subcategory: 'Portfolio',
    title: 'UX Portfolio & Case Study Template',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['portfolio', 'case-study', 'ux', 'job-search'],
    description: 'Create a compelling UX portfolio with detailed case studies.',
    promptText: `Hello ChatGPT,
Create a UX portfolio case study template.

● Project Name: [Insert project name]
● My Role: [UX Designer / UX Researcher / Product Designer / UI Designer / Solo]
● Duration: [X weeks/months]
● Tools Used: [Figma / Miro / UsabilityHub / Photoshop / Other]
● Team Size: [X people]
● Project Type: [Mobile app / Website / SaaS / Redesign / New product]

Write a case study with:
1. Project overview (2 sentences)
2. Problem statement and why it mattered
3. My role and responsibilities
4. Research phase (methods, findings, user quotes)
5. Ideation and design (sketches, wireframes, iterations)
6. Final design (key screens with annotations)
7. Results and impact (metrics, before/after)
8. Reflections and learnings
9. Key deliverables list`,
    placeholders: ['[Project]', '[Role]', '[Duration]', '[Tools]', '[Team]', '[Type]'],
  },
  {
    promptId: 'LANG_011', category: 'Language Learning', subcategory: 'Immersion',
    title: 'Language Immersion Environment Setup',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['immersion', 'environment', 'input', 'exposure'],
    description: 'Create a language immersion environment without leaving home.',
    promptText: `Hello ChatGPT,
Create a language immersion environment for my target language.

● Language: [Insert language]
● Current Level: [A1 / A2 / B1 / B2 / C1]
● Time Per Day: [X minutes/hours for immersion]
● Interests: [Movies / Music / Books / News / Sports / Gaming / Cooking]
● Native Language: [Insert native language]
● Tech Available: [Smartphone / Computer / Streaming services / Smart speaker]

Create an immersion plan:
1. Daily immersion schedule (listen, read, speak, write rotations)
2. Media recommendations (YouTube channels, podcasts, movies, shows at my level)
3. Reading materials (news sites, blogs, graded readers, comic books)
4. Music and radio recommendations
5. Social media immersion (follow, engage, comment)
6. Language exchange app recommendations and schedule
7. Device language change guide
8. Environment labeling (sticky notes around the house)
9. Tracking input hours and progress`,
    placeholders: ['[Language]', '[Level]', '[Time]', '[Interests]', '[Native]', '[Tech]'],
  },
  {
    promptId: 'LOG_011', category: 'Logistics & Supply Chain', subcategory: 'Technology',
    title: 'Supply Chain Digital Transformation Roadmap',
    difficulty: 'advanced', estimatedTime: '20 min',
    tags: ['digital-transformation', 'technology', 'automation', 'roadmap'],
    description: 'Plan a digital transformation roadmap for your supply chain.',
    promptText: `Hello ChatGPT,
Create a digital transformation roadmap for my supply chain.

● Company Size: [SME / Mid-market / Enterprise]
● Current Tech Level: [Manual/Spreadsheets / Basic ERP / Advanced WMS / Automated]
● Pain Points: [Visibility / Efficiency / Accuracy / Cost / Compliance / Speed]
● Budget: [Low / Medium / High]
● Timeline: [1-year / 2-year / 3-year plan]
● Key Stakeholders: [Operations / IT / Finance / Sales]

Create a transformation roadmap:
1. Current state assessment framework
2. Technology stack recommendation (phased approach)
3. Phase 1 (quick wins, 0-6 months): low-code, automation, basic visibility
4. Phase 2 (foundation, 6-12 months): WMS/TMS, ERP integration, IoT
5. Phase 3 (advanced, 12-24 months): AI/ML, predictive analytics, robotics
6. Phase 4 (optimization, 24-36 months): autonomous decisions, digital twin
7. Change management approach
8. Vendor selection criteria
9. ROI estimation per phase
10. Risk and mitigation plan`,
    placeholders: ['[Company size]', '[Tech level]', '[Pain points]', '[Budget]', '[Timeline]', '[Stakeholders]'],
  },
  {
    promptId: 'MKT_026', category: 'Marketing & Social Media', subcategory: 'CRM',
    title: 'CRM Marketing Automation Setup',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['crm', 'automation', 'marketing', 'workflow'],
    description: 'Set up CRM marketing automation for lead nurturing and scoring.',
    promptText: `Hello ChatGPT,
Set up CRM marketing automation for my business.

● CRM Platform: [HubSpot / Salesforce / Pipedrive / Zoho / ActiveCampaign / Other]
● Business Type: [B2B / B2C / Both]
● Sales Cycle: [Short / Medium / Long]
● Current Data: [X contacts, X deals, X active lists]
● Automation Needs: [Lead scoring / Nurture emails / Task creation / Alerts / Segmentation]

Provide:
1. CRM setup checklist (fields, pipelines, properties)
2. Lead scoring model (demographic + behavioral scoring)
3. Lead nurturing email sequences by segment
4. Deal stage automation (tasks, reminders, updates)
5. Segmentation strategy (lists, properties, behavior)
6. Integration with other tools (website, email, calendar)
7. Reporting dashboard (pipeline, conversion, velocity)
8. Data hygiene and deduplication process
9. Team training and adoption plan`,
    placeholders: ['[CRM]', '[Type]', '[Cycle]', '[Data size]', '[Needs]'],
  },
  {
    promptId: 'CNT_019', category: 'Content Creation & Copywriting', subcategory: 'SEO',
    title: 'SEO Content Brief Template & Writer\'s Guide',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['content-brief', 'seo', 'writers', 'outline'],
    description: 'Create detailed SEO content briefs for writers and AI tools.',
    promptText: `Hello ChatGPT,
Create an SEO content brief for my target keyword.

● Target Keyword: [Insert keyword]
● Search Intent: [Informational / Commercial / Transactional / Navigational]
● Target Audience: [Describe reader]
● Word Count Target: [X words]
● Competitor URLs to Beat: [Insert URLs]
● Internal Linking Targets: [Insert target pages]

Create a complete content brief:
1. Working title (3 options)
2. Meta description (155 chars, keyword-included)
3. Full outline with H2s and H3s
4. Key points to cover in each section
5. FAQ questions to answer (for featured snippets)
6. Internal link suggestions (anchor text)
7. External authority sources to reference
8. Visual/image recommendations
9. Tone and style guidelines
10. Target reading level`,
    placeholders: ['[Keyword]', '[Intent]', '[Audience]', '[Word count]', '[Competitors]', '[Internal links]'],
  },
  {
    promptId: 'CODE_020', category: 'Coding & Development', subcategory: 'TypeScript',
    title: 'TypeScript Setup & Best Practices Guide',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['typescript', 'setup', 'types', 'configuration'],
    description: 'Set up TypeScript with best practices and strict mode configuration.',
    promptText: `Hello ChatGPT,
Set up TypeScript with best practices for my project.

● Project Type: [Node.js / React / Next.js / Vue / Library / Monorepo]
● Current Setup: [JavaScript / TypeScript basic / TypeScript strict / None]
● Experience Level: [New to TS / Some experience / Advanced]
● Testing Framework: [Jest / Vitest / Playwright / None]
● Linter: [ESLint / Prettier / Both / None]

Provide:
1. TypeScript configuration (tsconfig.json with strict settings)
2. Type definitions strategy (interfaces vs types, generics, utility types)
3. File naming and organization conventions
4. Common patterns (discriminated unions, type guards, branded types)
5. Error handling with typed errors
6. Integration with testing framework
7. Migration guide from JavaScript to TypeScript
8. Linter configuration for TypeScript
9. TypeScript-specific ESLint rules
10. Resources and cheatsheets`,
    placeholders: ['[Project type]', '[Current setup]', '[Experience]', '[Test framework]', '[Linter]'],
  },
  {
    promptId: 'HLT_013', category: 'Health & Fitness', subcategory: 'Running',
    title: 'Couch to 5K & Running Plan Generator',
    difficulty: 'beginner', estimatedTime: '10 min',
    tags: ['running', 'c25k', 'cardio', 'endurance'],
    description: 'Create a personalized running plan from beginner to advanced.',
    promptText: `Hello ChatGPT,
Create a running plan for my fitness level and goals.

● Current Running Experience: [None / Beginner / Intermediate / Advanced]
● Current Weekly Mileage: [X miles/km or "none"]
● Goal: [Complete first 5K / Improve 5K time / Half marathon / Marathon / General fitness]
● Days Available Per Week: [X]
● Running Surface: [Treadmill / Road / Trail / Mixed]
● Injuries/Limitations: [List or "none"]
● Target Race Date (if any): [Insert date]

Create:
1. Weekly running schedule (X days/week)
2. Structure per run (warm-up, main set, cool-down)
3. Week-by-week progression (increasing distance/intensity)
4. Cross-training recommendations
5. Stretching and recovery routine
6. Pacing guide (easy, tempo, interval, race pace)
7. Nutrition and hydration for runners
8. Gear recommendations (shoes, clothes, tracking)
9. Preventing common running injuries
10. Taper and race week plan (if training for event)`,
    placeholders: ['[Experience]', '[Mileage]', '[Goal]', '[Days/week]', '[Surface]', '[Injuries]', '[Race date]'],
  },
  {
    promptId: 'SALES_014', category: 'Sales & Persuasion', subcategory: 'CRM',
    title: 'CRM Sales Pipeline Management Guide',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['crm', 'pipeline', 'sales-management', 'forecasting'],
    description: 'Design and manage a healthy sales pipeline in your CRM.',
    promptText: `Hello ChatGPT,
Design a sales pipeline management system in my CRM.

● CRM: [HubSpot / Salesforce / Pipedrive / Zoho / Other]
● Sales Process Stages: [List current stages or "need help defining"]
● Deal Size Range: [X to Y]
● Sales Cycle: [X days average]
● Team Size: [X sales reps]
● Current Pipeline Issues: [Stagnation / Inaccurate forecasting / Low conversion / Data quality]

Provide:
1. Pipeline stage definitions and criteria for each
2. Deal stage entry/exit criteria
3. Pipeline health metrics (velocity, conversion rates by stage)
4. Weekly pipeline review process
5. Forecasting methodology (weighted pipeline, commit, or custom)
6. CRM automation rules (stage changes, task creation, alerts)
7. Pipeline dashboard design (key views and reports)
8. Common pipeline problems and fixes
9. Sales rep pipeline management best practices`,
    placeholders: ['[CRM]', '[Stages]', '[Deal size]', '[Cycle]', '[Team size]', '[Issues]'],
  },
  {
    promptId: 'ECOM_012', category: 'eCommerce & Customer Support', subcategory: 'Marketplace',
    title: 'Etsy Shop Setup & SEO Optimization',
    difficulty: 'beginner', estimatedTime: '15 min',
    tags: ['etsy', 'shop', 'seo', 'listings'],
    description: 'Set up and optimize your Etsy shop for search and sales.',
    promptText: `Hello ChatGPT,
Set up and optimize my Etsy shop for success.

● Product Type: [Handmade / Vintage / Digital / Supplies / Art]
● Shop Name Idea: [Insert ideas or "need help"]
● Current Shop Status: [Not created / Created but inactive / Active with X sales]
● Product Count: [X products]
● Target Customer: [Describe]
● Competitor Shops: [Insert URLs]

Provide:
1. Shop setup checklist (about, policies, branding, sections)
2. Listing optimization (title, tags, description, photos)
3. Etsy SEO strategy (keywords in titles, tags, categories)
4. Photography tips for Etsy (lighting, backgrounds, angles)
5. Pricing strategy (materials + time + profit + fees)
6. Shipping and returns policy setup
7. Etsy Ads strategy (budget, keywords, bidding)
8. Customer service and review management
9. Shop analytics and improvement
10. Scaling strategies (new products, patterns, bundles)`,
    placeholders: ['[Product type]', '[Shop name]', '[Status]', '[Products]', '[Customer]', '[Competitors]'],
  },
  {
    promptId: 'WEB_012', category: 'Web Design & UX', subcategory: 'Landing Page',
    title: 'SaaS Landing Page Copy & Design Brief',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['saas', 'landing-page', 'copy', 'conversion'],
    description: 'Create a landing page copy and design brief for a SaaS product.',
    promptText: `Hello ChatGPT,
Create a landing page brief for my SaaS product.

● Product Name: [Insert name]
● One-Liner: [What does it do in 10 words?]
● Target Customer: [Describe ICP]
● Key Features: [List 3-5 features]
● Pricing: [Monthly / Annual / Free tier / Enterprise]
● Competitors: [Names and differentiators]
● Primary CTA: [Start free trial / Book demo / Get early access]

Create:
1. Hero section (headline, subheadline, CTA, supporting visual)
2. Feature sections (3-5 USPs with benefits)
3. Social proof (logos, testimonials, metrics)
4. How it works (3-step explainer)
5. Pricing section copy
6. FAQ section (overcoming objections)
7. Final CTA section
8. Design direction (visual style, colour palette, layout preferences)
9. A/B test ideas for launch`,
    placeholders: ['[Name]', '[One-liner]', '[ICP]', '[Features]', '[Pricing]', '[Competitors]', '[CTA]'],
  },
  {
    promptId: 'LANG_012', category: 'Language Learning', subcategory: 'Motivation',
    title: 'Language Learning Motivation & Habit System',
    difficulty: 'beginner', estimatedTime: '8 min',
    tags: ['motivation', 'consistency', 'habits', 'goals'],
    description: 'Build a sustainable language learning habit and stay motivated.',
    promptText: `Hello ChatGPT,
Help me build a sustainable language learning habit.

● Language: [Insert language]
● Goal: [Conversational fluency / Reading / Business / Travel / Exam pass]
● Target Level: [A2 / B1 / B2 / C1]
● Timeline: [X months]
● Current Consistency: [Daily / A few times/week / Inconsistent / Just starting]
● Previous Attempts: [What worked, what didn't?]
● Time Available: [X minutes per day]

Create:
1. Minimum viable daily routine (5-15 minutes that you'll actually do)
2. Habit stacking framework (attach to existing habits)
3. Progress tracking method (visible, motivating)
4. Milestone system (celebrate progress points)
5. Accountability structure (community, partner, coach)
6. Dealing with plateaus (strategies for when you stop progressing)
7. Fun activities that improve language (hobbies in target language)
8. Social motivation (connect with other learners)
9. Rewards system (intrinsic + extrinsic)
10. "Emergency" plan (what to do when you don't feel like studying)`,
    placeholders: ['[Language]', '[Goal]', '[Level]', '[Timeline]', '[Consistency]', '[Attempts]', '[Time]'],
  },
  {
    promptId: 'LOG_012', category: 'Logistics & Supply Chain', subcategory: 'Freight',
    title: 'Freight Broker & 3PL Selection Guide',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['freight', 'broker', '3pl', 'shipping'],
    description: 'Select and evaluate freight brokers and third-party logistics providers.',
    promptText: `Hello ChatGPT,
Help me select and evaluate freight brokers or 3PL providers.

● Business Type: [E-commerce / Manufacturer / Wholesaler / Retailer]
● Shipment Volume: [X shipments per month]
● Freight Types: [FTL / LTL / Parcel / Intermodal / Ocean / Air]
● Regions: [Domestic / International / Specific lanes]
● Current Logistics: [In-house / Broker / Mix / None]
● Pain Points: [Cost / Reliability / Visibility / Damage / Communication]

Create:
1. 3PL vs in-house vs broker decision framework
2. RFQ template (request for quote)
3. Evaluation criteria with scoring weights
4. Due diligence checklist (financial, operational, tech)
5. Contract negotiation points
6. Service level agreement (SLA) template
7. Technology integration requirements
8. Implementation and transition plan
9. Performance review cadence and KPIs
10. Exit strategy (if relationship fails)`,
    placeholders: ['[Business type]', '[Volume]', '[Freight types]', '[Regions]', '[Current setup]', '[Pain points]'],
  },
  {
    promptId: 'MKT_027', category: 'Marketing & Social Media', subcategory: 'Direct Mail',
    title: 'Direct Mail Marketing Campaign Designer',
    difficulty: 'intermediate', estimatedTime: '12 min',
    tags: ['direct-mail', 'offline', 'campaign', 'conversion'],
    description: 'Design a direct mail campaign that drives response and ROI.',
    promptText: `Hello ChatGPT,
Design a direct mail marketing campaign.

● Business Type: [Local business / E-commerce / B2B / Service / Agency]
● Target Audience: [Demographic and geographic]
● Offer: [Discount / Free trial / Consultation / Gift / Event]
● Budget: [X total, X per piece]
● List Source: [Purchased / Own list / Rented / Co-op]
● Campaign Goal: [Leads / Sales / Traffic / Brand awareness]

Design:
1. Mail piece format recommendation (postcard, letter, dimensional)
2. Copy and design brief for the mail piece
3. Offer strategy (what makes people respond)
4. Call-to-action design (phone, URL, QR code, reply card)
5. Landing page matching the mail piece
6. Tracking method (unique URL, promo code, dedicated phone)
7. Follow-up sequence (email and phone after mail)
8. A/B test plan (offer, format, list segment)
9. Timeline from design to drop
10. ROI calculation template`,
    placeholders: ['[Type]', '[Audience]', '[Offer]', '[Budget]', '[List]', '[Goal]'],
  },
  {
    promptId: 'DATA_011', category: 'Data Analysis', subcategory: 'Reporting',
    title: 'Automated Data Report Generator & Scheduler',
    difficulty: 'intermediate', estimatedTime: '15 min',
    tags: ['reporting', 'automation', 'data', 'schedule'],
    description: 'Build automated data reports that deliver insights on a schedule.',
    promptText: `Hello ChatGPT,
Design an automated data reporting system.

● Business Type: [SaaS / E-commerce / Agency / Finance / Operations]
● Data Sources: [Database / API / Google Analytics / CRM / Spreadsheets / CSV exports]
● Report Frequency: [Daily / Weekly / Monthly / Quarterly]
● Audience: [Executive / Management / Team / Clients]
● Distribution: [Email / Slack / Dashboard / PDF]
● Current Reporting: [Manual copy-paste / Existing tool / None]

Provide:
1. Report content structure (what data, what format, what insights)
2. Automation workflow design (ETL → analysis → formatting → delivery)
3. Tool stack recommendation (Python + Jinja + Email / BI tool / Low-code)
4. Key metrics per report type
5. Visualization recommendations for each metric
6. Anomaly/alert triggers
7. Distribution list management
8. Error handling and monitoring
9. Iteration and feedback process
10. Sample report template`,
    placeholders: ['[Type]', '[Sources]', '[Frequency]', '[Audience]', '[Distribution]', '[Current state]'],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing
    await Promise.all([
      Module.deleteMany(),
      Lesson.deleteMany(),
      Prompt.deleteMany(),
      Payment.deleteMany(),
      Waitlist.deleteMany(),
      SystemSetting.deleteMany(),
      Quiz.deleteMany(),
      QuizAttempt.deleteMany(),
    ]);
    console.log('🗑️  Cleared existing data');

    // Insert modules
    const modules = await Module.insertMany(MODULES);
    console.log(`✅ Inserted ${modules.length} modules`);

    // Build moduleOrder → _id map
    const modMap = {};
    modules.forEach((m) => { modMap[m.order] = m._id; });

    // Insert lessons
    const lessonsToInsert = LESSONS_DATA.map((l) => ({
      moduleId: modMap[l.moduleOrder],
      order:    l.order,
      title:    l.title,
      content:  l.content,
      summary:  l.summary,
      duration: l.duration,
      tips:     l.tips || [],
      keyTakeaways: l.keyTakeaways || [],
    }));
    const lessons = await Lesson.insertMany(lessonsToInsert);
    console.log(`✅ Inserted ${lessons.length} lessons`);

    // Enrich prompts with isPublished, toolType, toolName before insertion
    const toolMap = {
      'Marketing & Social Media':     { toolType: 'writing-copy',     toolName: 'ChatGPT' },
      'SEO Optimization':             { toolType: 'writing-copy',     toolName: 'ChatGPT' },
      'Content Creation & Copywriting': { toolType: 'writing-copy',   toolName: 'ChatGPT' },
      'Coding & Development':         { toolType: 'code-generation',  toolName: 'ChatGPT' },
      'Data Analysis':                { toolType: 'research-analysis', toolName: 'ChatGPT' },
      'Online Course Creation':       { toolType: 'writing-copy',     toolName: 'ChatGPT' },
      'Sales & Persuasion':           { toolType: 'writing-copy',     toolName: 'ChatGPT' },
      'HR & Recruitment':             { toolType: 'writing-copy',     toolName: 'ChatGPT' },
      'Project Management':           { toolType: 'automation',       toolName: 'ChatGPT' },
      'Health & Fitness':             { toolType: 'writing-copy',     toolName: 'ChatGPT' },
      'Prompt Engineering':           { toolType: 'writing-copy',     toolName: 'ChatGPT' },
      'eCommerce & Customer Support': { toolType: 'writing-copy',     toolName: 'ChatGPT' },
      'Travel & Lifestyle':           { toolType: 'writing-copy',     toolName: 'ChatGPT' },
      'Web Design & UX':              { toolType: 'presentation',     toolName: 'ChatGPT' },
      'Language Learning':            { toolType: 'research-analysis', toolName: 'ChatGPT' },
      'Logistics & Supply Chain':     { toolType: 'research-analysis', toolName: 'ChatGPT' },
    };

    const promptsToInsert = PROMPTS_DATA.map((p) => {
      const info = toolMap[p.category] || {};
      return {
        ...p,
        isPublished: true,
        toolType: info.toolType || 'writing-copy',
        toolName: info.toolName || 'ChatGPT',
      };
    });

    const prompts = await Prompt.insertMany(promptsToInsert, { ordered: false });
    console.log(`✅ Inserted ${prompts.length} prompts`);

    // Seed system settings
    await SystemSetting.insertMany(SYSTEM_SETTINGS);
    console.log(`✅ Inserted ${SYSTEM_SETTINGS.length} system settings`);

    // Seed waitlist entries
    await Waitlist.insertMany(WAITLIST_DATA);
    console.log(`✅ Inserted ${WAITLIST_DATA.length} waitlist entries`);

    // Seed quizzes
    const quizDocs = await Quiz.insertMany(
      QUIZ_TEMPLATES.map((q) => ({
        ...q,
        moduleId: modMap[q.moduleOrder],
        isPublished: true,
      })),
      { ordered: false }
    );
    console.log(`✅ Inserted ${quizDocs.length} quizzes`);

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@joeailabs.com' });
    const adminUser = adminExists || await User.create({
      username: 'joetechie',
      email: 'admin@joeailabs.com',
      password: 'joeailabs2024',
      fullName: 'Joakim Ngiciri',
      role: 'admin',
      isPremium: true,
      bio: 'Founder & CEO of JOEAILABS. Building the AI economy for everyone.',
    });
    if (!adminExists) console.log('✅ Admin user created: admin@joeailabs.com / joeailabs2024');

    // Demo user
    let demoUser = await User.findOne({ email: 'demo@joeailabs.com' });
    if (!demoUser) {
      demoUser = await User.create({
        username: 'demo_user',
        email: 'demo@joeailabs.com',
        password: 'demo1234',
        fullName: 'Demo User',
        role: 'user',
        isPremium: false,
      });
      console.log('✅ Demo user created: demo@joeailabs.com / demo1234');
    }

    // Demo user progress, bookmarks, and sample payments
    await User.findByIdAndUpdate(demoUser._id, {
      completedLessons: lessons.slice(0, 4).map((lesson) => ({ lessonId: lesson._id, moduleId: lesson.moduleId })),
      bookmarks: prompts.slice(0, 3).map((promptItem) => promptItem._id),
      reputationScore: 40,
    });
    console.log('✅ Seeded demo user progress and bookmarks');

    // Seed payments
    await Payment.insertMany(
      PAYMENT_SEED.map((payment) => ({
        ...payment,
        userId: payment.email === 'admin@joeailabs.com' ? adminUser._id : demoUser._id,
      })),
      { ordered: false }
    );
    console.log(`✅ Inserted ${PAYMENT_SEED.length} payments`);

    // Seed quiz attempts
    const quizAttemptData = [
      {
        userId: demoUser._id,
        quizId: quizDocs[0]._id,
        answers: [
          { questionId: quizDocs[0].questions[0]._id, answer: 'A field of computer science focused on creating systems that can perform tasks typically requiring human intelligence.', isCorrect: true },
          { questionId: quizDocs[0].questions[1]._id, answer: 'False', isCorrect: true },
          { questionId: quizDocs[0].questions[2]._id, answer: 'Generative AI', isCorrect: true },
        ],
        score: 4,
        totalPoints: 4,
        passed: true,
      },
      {
        userId: demoUser._id,
        quizId: quizDocs[1]._id,
        answers: [
          { questionId: quizDocs[1].questions[0]._id, answer: 'Clear role + context', isCorrect: true },
          { questionId: quizDocs[1].questions[1]._id, answer: 'True', isCorrect: true },
          { questionId: quizDocs[1].questions[2]._id, answer: 'A variable field that users replace with specific values.', isCorrect: true },
        ],
        score: 4,
        totalPoints: 4,
        passed: true,
      },
    ];
    await QuizAttempt.insertMany(quizAttemptData);
    console.log(`✅ Inserted ${quizAttemptData.length} quiz attempts`);

    console.log('\n🚀 JOEAILABS database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
