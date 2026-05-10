require('dotenv').config();
const mongoose = require('mongoose');
const Module  = require('../models/Module');
const Lesson  = require('../models/Lesson');
const Prompt  = require('../models/Prompt');
const User    = require('../models/User');

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
    order: 2, isPremium: false, color: 'green', emoji: '⚡',
    title: 'PROMPT ENGINEERING',
    subtitle: 'Master-Level Prompting',
    description: 'Learn to communicate with AI effectively. Discover frameworks, techniques, and structures that transform vague requests into powerful, precise outputs.',
    estimatedHours: 3,
    tags: ['prompts', 'chatgpt', 'beginner'],
  },
  {
    order: 3, isPremium: false, color: 'green', emoji: '🔥',
    title: 'PRODUCTIVITY WITH AI',
    subtitle: 'Save Hours Every Day',
    description: 'Integrate AI into your daily workflow. From email drafting to scheduling to research — discover tools and systems that multiply your output without extra effort.',
    estimatedHours: 3,
    tags: ['productivity', 'tools', 'workflow'],
  },
  {
    order: 4, isPremium: true, color: 'yellow', emoji: '✍️',
    title: 'CONTENT CREATION',
    subtitle: '10x Faster Output',
    description: 'Create blogs, social media posts, scripts, emails, and sales copy at 10× the speed using AI tools. Learn platform-specific strategies for maximum engagement.',
    estimatedHours: 4,
    tags: ['content', 'copywriting', 'premium'],
  },
  {
    order: 5, isPremium: true, color: 'yellow', emoji: '🛠️',
    title: 'AI TOOLS MASTERY',
    subtitle: 'Best Tools Today',
    description: 'Deep-dive into the most powerful AI tools — Midjourney, ElevenLabs, Runway, HeyGen, Zapier, and more. Learn when and how to use each for maximum ROI.',
    estimatedHours: 5,
    tags: ['tools', 'midjourney', 'automation', 'premium'],
  },
  {
    order: 6, isPremium: true, color: 'yellow', emoji: '💰',
    title: 'MAKING MONEY WITH AI',
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
  // Module 2 — Prompt Engineering
  {
    moduleOrder: 2, order: 1,
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
    moduleOrder: 2, order: 2,
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
    moduleOrder: 2, order: 3,
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
  // Module 3 — Productivity
  {
    moduleOrder: 3, order: 1,
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
];

// 30 prompts from the A-Z ChatGPT PDF (representative sample across all categories)
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
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing
    await Promise.all([Module.deleteMany(), Lesson.deleteMany(), Prompt.deleteMany()]);
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

    // Insert prompts
    const prompts = await Prompt.insertMany(PROMPTS_DATA);

    // Classify prompts with toolType and toolName based on category
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

    for (const prompt of prompts) {
      const info = toolMap[prompt.category];
      if (info) {
        await Prompt.findByIdAndUpdate(prompt._id, { toolType: info.toolType, toolName: info.toolName });
      }
    }
    console.log(`✅ Inserted ${prompts.length} prompts`);

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@joeailabs.com' });
    if (!adminExists) {
      await User.create({
        username: 'joetechie',
        email: 'admin@joeailabs.com',
        password: 'joeailabs2024',
        fullName: 'Joakim Ngiciri',
        role: 'admin',
        isPremium: true,
        bio: 'Founder & CEO of JOEAILABS. Building the AI economy for everyone.',
      });
      console.log('✅ Admin user created: admin@joeailabs.com / joeailabs2024');
    }

    // Demo user
    const demoExists = await User.findOne({ email: 'demo@joeailabs.com' });
    if (!demoExists) {
      await User.create({
        username: 'demo_user',
        email: 'demo@joeailabs.com',
        password: 'demo1234',
        fullName: 'Demo User',
        role: 'user',
        isPremium: false,
      });
      console.log('✅ Demo user created: demo@joeailabs.com / demo1234');
    }

    console.log('\n🚀 JOEAILABS database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
