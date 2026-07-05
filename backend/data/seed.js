const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const Prompt = require('../models/Prompt');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Drop collections to remove stale indexes
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const names = collections.map(c => c.name);
    const toDrop = ['lessons', 'modules', 'prompts', 'users', 'bookmarks', 'progresses', 'chatmessages', 'payments', 'quizzes', 'quizresults', 'quizattempts', 'waitlists', 'certificates', 'systemsettings'];
    for (const name of toDrop) {
      if (names.includes(name)) await db.dropCollection(name);
    }
    console.log('Dropped existing collections');

    await User.create({
      username: 'admin', email: 'admin@joeailabs.com', password: 'Admin@123456',
      role: 'admin', isPremium: true, reputationScore: 1000, xp: 1000,
    });
    console.log('Admin created (admin@joeailabs.com / Admin@123456)');

    await User.create({
      username: 'demouser', email: 'demo@joeailabs.com', password: 'Demo@123456',
      role: 'user', reputationScore: 250, xp: 250,
    });
    console.log('Demo user created');

    const modules = await Module.insertMany([
      { title: 'AI for Stunning Visual Art', subtitle: 'Turn your imagination into breathtaking images in seconds.', description: '• Write simple prompts that create professional-quality art\n• Master different artistic styles from cartoon to hyper-realistic\n• Make the same character appear in multiple scenes\n• Remove unwanted objects from photos like magic\n• Turn small blurry pictures into crystal clear HD images', emoji: '📸', color: 'green', order: 1, isPublished: true, published: true, isPremium: false, estimatedHours: 3 },
      { title: 'AI for Logo & Business Design', subtitle: 'Design professional logos and ads without hiring a designer.', description: '• Create transparent logos and icons in minutes\n• Remove backgrounds from any image instantly\n• Turn square photos into wide banners for websites\n• Design repeating patterns for packaging and fabrics\n• Change lighting to make photos look like morning or night', emoji: '🎨', color: 'yellow', order: 2, isPublished: true, published: true, isPremium: false, estimatedHours: 2 },
      { title: 'AI for Full Song Creation', subtitle: 'Make complete songs with singing and music from just your words.', description: '• Describe any song and watch the AI bring it to life\n• Build songs piece by piece (intro, verse, chorus, ending)\n• Write your own lyrics and make the AI sing them\n• Create instrumental background music for videos\n• Pick the best version when the AI gives you multiple choices', emoji: '🎵', color: 'blue', order: 3, isPublished: true, published: true, isPremium: false, estimatedHours: 4 },
      { title: 'AI for Audio Mixing & Mastering', subtitle: 'Make your raw recordings sound like studio-quality hits.', description: '• Fix rough recordings to make them sound professional\n• Split any song into separate parts (drums, vocals, bass)\n• Find the speed and key of any song automatically\n• Get AI suggestions to improve your audio quality\n• Turn a simple hum into a fully produced beat', emoji: '🎧', color: 'green', order: 4, isPublished: true, published: true, isPremium: false, estimatedHours: 3 },
      { title: 'AI for Short Video Creation', subtitle: 'Create jaw-dropping videos for TikTok, Reels, and YouTube in minutes.', description: '• Generate 5-to-15 second video clips from text\n• Control camera movement (zoom, pan, slow motion)\n• Make only one part of a picture move (like flowing water)\n• Turn your AI art into moving videos\n• Combine AI videos with editing apps like CapCut', emoji: '🎬', color: 'yellow', order: 5, isPublished: true, published: true, isPremium: false, estimatedHours: 3 },
      { title: 'AI for Talking Avatars', subtitle: 'Create realistic digital people that speak your words perfectly.', description: '• Build a fake person that lip-syncs to your script\n• Clone your own voice or use professional AI voices\n• Make training videos without using a real camera\n• Turn a single photo into a talking character\n• Translate your videos into 10+ languages automatically', emoji: '👤', color: 'blue', order: 6, isPublished: true, published: true, isPremium: false, estimatedHours: 3 },
      { title: 'AI for 3D Models & Game Assets', subtitle: 'Build 3D objects and game items just by describing them.', description: '• Create 3D models from simple text descriptions\n• Turn real objects into digital 3D versions using photos\n• Add realistic textures like metal, wood, and glass\n• Export models into Unity and Unreal Engine\n• Optimize 3D models for mobile games', emoji: '🧊', color: 'green', order: 7, isPublished: true, published: true, isPremium: true, estimatedHours: 4 },
      { title: 'AI for Lyrics & Scriptwriting', subtitle: 'Never face writer\'s block again. Write songs, poems, and scripts like a pro.', description: '• Build songs with verses, choruses, and bridges\n• Find rhyming words instantly when you are stuck\n• Write in different styles (rap, pop, poetry, or old English)\n• Create video scripts with camera directions and pacing\n• Turn long articles into short punchy scripts', emoji: '✍️', color: 'yellow', order: 8, isPublished: true, published: true, isPremium: true, estimatedHours: 2 },
      { title: 'AI for Voice Cloning & Podcasting', subtitle: 'Clone voices, fix bad audio, and produce professional podcasts easily.', description: '• Copy any voice using just 1 minute of audio\n• Fix echo and background noise in recordings\n• Remove instruments from old songs for sampling\n• Make AI voices sound happy, sad, or serious\n• Create realistic sound effects like rain and footsteps', emoji: '🎙️', color: 'blue', order: 9, isPublished: true, published: true, isPremium: true, estimatedHours: 3 },
      { title: 'AI Orchestration – The Final Project', subtitle: 'Combine every AI tool to create a complete multimedia masterpiece.', description: '• Split one big idea across multiple AI tools\n• Keep characters consistent across images, videos, and 3D\n• Match music perfectly with video timing\n• Know when to stop using AI and edit manually\n• Complete a full 1-minute commercial in under 4 hours', emoji: '🚀', color: 'green', order: 10, isPublished: true, published: true, isPremium: true, estimatedHours: 5 },
      { title: 'AI for Coding & Software Development', subtitle: 'Write code, fix bugs, and build apps faster than ever before.', description: '• Describe any program and watch the AI write the code\n• Clean up old messy code automatically\n• Find and fix errors by pasting error messages\n• Translate code between programming languages\n• Build simple websites and apps without typing much code', emoji: '💻', color: 'yellow', order: 11, isPublished: true, published: true, isPremium: true, estimatedHours: 5 },
      { title: 'AI for Data & Spreadsheets', subtitle: 'Turn messy numbers into clear insights and beautiful charts.', description: '• Clean up messy spreadsheets in one click\n• Find hidden patterns in your business data\n• Create charts and graphs by describing what you want\n• Write complex Excel formulas without memorizing them\n• Predict future trends like next month\'s sales', emoji: '📊', color: 'blue', order: 12, isPublished: true, published: true, isPremium: true, estimatedHours: 3 },
      { title: 'AI for Research & Summarization', subtitle: 'Read 100 pages in 2 minutes and understand everything.', description: '• Upload long PDFs and get short bullet point summaries\n• Ask questions about documents and get instant answers\n• Search the internet using AI and get reliable sources\n• Compare two documents and spot the differences\n• Turn complex research into simple everyday language', emoji: '📚', color: 'green', order: 13, isPublished: true, published: true, isPremium: true, estimatedHours: 3 },
      { title: 'AI for Email & Office Work', subtitle: 'Write professional emails, reports, and documents in record time.', description: '• Draft professional emails in seconds\n• Change the tone of your writing (formal, friendly, urgent)\n• Check grammar, spelling, and punctuation instantly\n• Write meeting notes, proposals, and reports with AI\n• Translate your writing into multiple languages perfectly', emoji: '✉️', color: 'yellow', order: 14, isPublished: true, published: true, isPremium: true, estimatedHours: 2 },
    ]);
    console.log(modules.length + ' modules created');

    const lessonData = [
      {
        title: 'What Is AI Image Generation?',
        summary: 'Understand how AI tools like Midjourney and DALL-E turn your words into pictures using diffusion models.',
        content: `## What Is AI Image Generation?

AI image generation is exactly what it sounds like – you type a description of a picture you have in your head, and the AI draws it for you. In seconds.

These AI tools use something called diffusion models. Think of it like this: the AI starts with a screen full of random TV static (noise). Then, step by step, it removes the noise and adds details based on your description, until a clear image appears. It's like magic, but it's actually math.

The best part? You don't need to know how to draw, paint, or use design software. You just need to know how to describe what you want.`,
        duration: 8, order: 1,
        tips: ['Start simple — generate your first 5 images today', 'Don\'t worry about perfect prompts yet — just experiment'],
        keyTakeaways: ['AI image generation creates pictures from text descriptions', 'Diffusion models work by removing noise step by step', 'No drawing or design skills required'],
      },
      {
        title: 'Step-by-Step: Generate Your First Image',
        summary: 'A complete walkthrough from setting up your account to downloading your first AI-generated picture.',
        content: `## Step-by-Step: How to Generate Your First Image

### Step 1: Choose Your Tool and Set Up

| Tool | How to Access | Cost |
|------|--------------|------|
| Midjourney | Through Discord app | Starts at $10/month |
| DALL-E 3 | Through ChatGPT Plus or Bing Image Creator | Free via Bing, or $20/month via ChatGPT |
| Stable Diffusion | Download and run on your computer | Free (open-source) |
| Adobe Firefly | Through Adobe Creative Cloud | Part of Adobe subscription |

### For Midjourney beginners:
1. Create a free Discord account
2. Join the official Midjourney Discord server
3. Choose a subscription plan (start with the Basic plan at $10/month)
4. Go to any #newbies channel in the server

### For DALL-E 3 beginners (free option):
1. Go to Bing Image Creator
2. Log in with your Microsoft account
3. Select DALL-E 3 as your model
4. Start typing your prompt

### Step 2: Write Your First Prompt
A prompt is simply the text description you give to the AI.

Your first prompt should follow this basic structure:
**[Subject] + [Action/Context] + [Environment] + [Style]**

Example: "A cute orange cat sitting on a wooden chair, in a cozy living room with sunlight, painted in watercolor style."

### Step 3: Generate and Wait
- **Midjourney**: Type /imagine followed by your prompt in the Discord chat and press Enter
- **DALL-E 3**: Type your prompt in the chat box and press Enter
- **Stable Diffusion**: Type your prompt in the text box and click "Generate"

The AI will take 10–30 seconds to create your image.

### Step 4: Review Your Results
Most tools give you a grid of 4 variations of your image. Look at each one and pick your favorite.

### Step 5: Refine and Improve
- **Upscale**: Make your chosen image bigger and clearer
- **Create variations**: Ask the AI to make more versions of your favorite
- **Remix**: Change your prompt slightly and generate again

### Step 6: Download and Save
Click the download button or right-click the image to save it to your device.

That's it! You've just created your first AI artwork.`,
        duration: 12, order: 2,
        tips: ['Start with Bing Image Creator — it\'s free and requires no setup', 'Save your first 10 images to track your progress'],
        keyTakeaways: ['Multiple tools are available at different price points', 'The basic prompt structure is Subject + Context + Environment + Style', 'Always refine and iterate — the first result is rarely the best'],
      },
      {
        title: 'Prompt Engineering – The Secret to Great Images',
        summary: 'Learn the golden formula for writing prompts that consistently produce stunning, accurate results.',
        content: `## Prompt Engineering – The Secret to Great Images

Writing good prompts is a skill. The AI reads your words literally — it cannot read your mind. Vague prompts give vague results. Specific prompts give specific, impressive results.

### The Golden Prompt Formula

Every high-performing prompt follows this structure:

**SUBJECT + CONTEXT + ACTION + VISUAL DETAILS + STYLE + PARAMETERS**

| Element | What It Means | Example |
|---------|--------------|---------|
| Subject | The main focus of the image | "A young woman" |
| Context | Where and when | "standing in a snowy forest at night" |
| Action | What is happening | "looking up at the stars" |
| Visual Details | Colors, lighting, textures | "wearing a long red coat, snow falling, moonlight" |
| Style | Artistic approach | "photorealistic, cinematic, 8K resolution" |
| Parameters | Technical settings | "--ar 16:9" (widescreen format) |

**Put it all together:**
"A young woman standing in a snowy forest at night, looking up at the stars, wearing a long red coat with snow falling around her, moonlight illuminating her face, photorealistic cinematic style, 8K resolution"

### Pro Tips for Better Prompts

1. **Start with the subject first** — Begin with a specific noun, not abstract concepts
2. **Use descriptive adjectives** — Materials, colors, lighting, mood, textures
3. **Talk like a photographer** — "close-up shot", "wide angle", "golden hour", "dramatic lighting"
4. **Add style keywords** — "oil painting", "cyberpunk", "3D render", "in the style of Studio Ghibli"
5. **Use negative prompts** (for Stable Diffusion) — Tell the AI what you don't want
6. **Iterate in small steps** — Change one or two things between generations
7. **Use aspect ratio parameters** — \`--ar 1:1\` (square), \`--ar 16:9\` (widescreen), \`--ar 9:16\` (portrait)

### Prompt Examples: Before and After

| Weak Prompt | Strong Prompt |
|------------|--------------|
| "A dog" | "A golden retriever puppy running through a field of yellow flowers, sunset light, shallow depth of field, photorealistic, 8K" |
| "A castle" | "A medieval stone castle on a cliff overlooking the ocean, dramatic storm clouds, lightning in the distance, moody dark fantasy style" |
| "A person" | "An elderly fisherman with a white beard, wearing a yellow raincoat, holding a wooden fishing rod, standing on a misty dock at dawn, cinematic lighting" |`,
        duration: 18, order: 3,
        tips: ['Save your best prompts in a document for reuse', 'Study prompts from other creators to learn', 'Always put the most important subject FIRST'],
        keyTakeaways: ['The golden formula: Subject + Context + Action + Details + Style + Parameters', 'Specific prompts produce specific results', 'Aspect ratio controls the shape of your image'],
      },
      {
        title: 'Comparing the Top AI Image Tools',
        summary: 'Midjourney vs DALL-E 3 vs Stable Diffusion — which one is right for you?',
        content: `## Comparing the Top AI Image Tools

In 2026, three major platforms dominate the AI image generation market. Each has different strengths.

### Comparison Table

| Feature | Midjourney | DALL-E 3 | Stable Diffusion |
|---------|-----------|---------|-----------------|
| Best For | Artistic, polished results | Ease of use and beginners | Full control and customization |
| Image Quality | Highest artistic quality | Good, consistent quality | Depends on your setup |
| Ease of Use | Moderate (requires Discord) | Very easy (ChatGPT interface) | Hard (technical setup required) |
| Cost | Starts at $10/month | Free via Bing, or $20/month | Free (open-source) |
| Control Level | Medium | Low | Very High |
| Prompt Style | Short, high-signal phrases | Natural language sentences | Structured, weighted keywords |
| Text in Images | Poor | Good | Moderate |
| Where It Runs | Discord only | Web/ChatGPT app | Your own computer |

### Which One Should You Choose?

**Choose Midjourney if:** You want the most beautiful, artistic images and don't mind using Discord. Great for concept art, book covers, fantasy illustrations, and marketing visuals.

**Choose DALL-E 3 if:** You are a beginner, want the easiest experience, or need images with text in them. Perfect for social media posts, quick illustrations, and business content.

**Choose Stable Diffusion if:** You are technically comfortable, want free tools, or need precise control over every detail. Ideal for game assets, specific character designs, and commercial projects where you need consistency.

**Pro Tip:** Many professionals use all three — Midjourney for the first draft, DALL-E for quick edits, and Stable Diffusion for final polishing.`,
        duration: 10, order: 4,
        tips: ['Try all three tools before committing to a subscription', 'Each tool excels in different areas — match the tool to the task'],
        keyTakeaways: ['Midjourney = best artistic quality, requires Discord', 'DALL-E 3 = easiest for beginners, free option available', 'Stable Diffusion = free and fully customizable, requires technical setup'],
      },
      {
        title: 'Common Mistakes and How to Fix Them',
        summary: 'Why do faces look blurry? Why are there extra fingers? Learn how to troubleshoot the most common AI image problems.',
        content: `## Common Mistakes and How to Fix Them

| Problem | Why It Happens | How to Fix |
|---------|---------------|------------|
| Blurry or distorted faces | AI struggles with small details | Generate at higher resolution; use upscaling tools |
| Extra fingers or limbs | Common AI artifact | Add "correct anatomy" to your prompt; use negative prompts |
| Wrong colors | AI misunderstood your description | Be more specific: "deep crimson red" instead of just "red" |
| Image looks fake | AI defaults to artificial look | Use photography terms: "photorealistic, shallow depth of field, natural lighting" |
| Subject is wrong | AI misinterpreted your prompt | Restructure: put the most important thing FIRST in your prompt |
| Style isn't right | You didn't specify style clearly | Add specific style keywords: "oil painting," "cyberpunk," "watercolor" |

### Quick Fixes for Common Issues

- **Blurry faces** → Add "photorealistic, 8K, sharp focus" and use upscaling
- **Extra limbs** → Add "correct anatomy, natural pose" or use negative prompts
- **Wrong colors** → Be hyper-specific: "deep crimson" not "red", "emerald green" not "green"
- **Fake-looking images** → Use "shallow depth of field, natural lighting, candid photography"
- **Missing subject** → Restructure prompt so the main subject is the FIRST word`,
        duration: 14, order: 5,
        tips: ['When something goes wrong, change only ONE thing at a time', 'Use photography terminology for more realistic results'],
        keyTakeaways: ['Most AI image problems have simple fixes', 'Be specific with colors, lighting, and composition', 'Restructure your prompt before abandoning it'],
      },
      {
        title: 'Ethical Use and Copyright',
        summary: 'Understand the rules of using AI art commercially, respecting copyrights, and being transparent with your audience.',
        content: `## Ethical Use and Copyright

Important rules to remember:

- **AI-generated images are generally free to use commercially** — but always check each tool's terms of service
- **Do not generate real people** without their permission, celebrity likenesses, or copyrighted characters
- **Do not generate violent, hateful, or inappropriate content** — all tools have filters that block this
- **Be transparent** — if you use AI images in professional work, it's good practice to disclose it
- **AI watermarks** — some tools add digital watermarks to identify AI-generated content

Always respect the work of human artists and use AI as a tool to enhance your creativity, not to replace or steal from others.`,
        duration: 6, order: 6,
        tips: ['Always check the terms of service for commercial use rights', 'Disclose AI use in professional work'],
        keyTakeaways: ['AI art can be used commercially but check each tool\'s terms', 'Don\'t generate real people or copyrighted characters without permission', 'Be transparent about AI use in professional contexts'],
      },
      {
        title: 'Practice Exercises',
        summary: 'Hands-on exercises to build your skills: iterate on prompts, change styles, and master different aspect ratios.',
        content: `## Practice Exercises

### Exercise 1 – The Basics
Write a prompt for: "A cozy coffee shop on a rainy evening, seen from outside through the window." Generate it and note what worked and what didn't.

### Exercise 2 – Iteration
Generate an image of "a futuristic city at night." Then change ONLY the lighting (e.g., from "neon lights" to "golden sunset") and generate again. Compare the results.

### Exercise 3 – Style Transfer
Take the same subject — "a mountain landscape" — and generate it in three different styles:
- Photorealistic
- Watercolor painting
- Cyberpunk/neon

### Exercise 4 – Aspect Ratio Practice
Generate the same prompt in three different aspect ratios:
- **Square (1:1)** — for Instagram
- **Widescreen (16:9)** — for YouTube
- **Portrait (9:16)** — for TikTok/Reels

### Course Summary
By the end of this module, you should be able to:
- Set up and use at least one AI image generation tool
- Write clear, effective prompts that produce the images you want
- Understand the strengths of Midjourney, DALL-E, and Stable Diffusion
- Use parameters like aspect ratio and style keywords
- Fix common problems like blurry images or wrong colors
- Apply AI image generation ethically and professionally

Next step: Practice! The more you generate, the better you get. Start with 10 images a day, experiment with different styles, and soon you'll be creating professional-quality artwork.`,
        duration: 5, order: 7,
        tips: ['Practice 10 prompts per day to build your skills quickly', 'Compare the same prompt across different tools to understand their strengths'],
        keyTakeaways: ['Iteration and experimentation are key to mastering AI image generation', 'Practice with different styles, subjects, and aspect ratios', 'The skills you build here apply to all AI image tools'],
      },
    ];

    const lessons = lessonData.map(l => ({
      ...l,
      moduleId: modules[0]._id,
      published: true,
      isPublished: true,
      videoUrl: '',
    }));
    await Lesson.insertMany(lessons);
    console.log(lessons.length + ' lessons created for Module 1');

    await Quiz.create({
      moduleId: modules[0]._id,
      title: 'AI for Stunning Visual Art — Final Assessment',
      passingScore: 80,
      published: true,
      questions: [
        {
          question: 'What is the most important thing to put FIRST in your prompt?',
          options: [
            'The style (e.g., watercolor)',
            'The main subject (e.g., a woman)',
            'The lighting (e.g., golden hour)',
            'The background color',
          ],
          correct: 1,
        },
        {
          question: 'Which tool is generally considered the BEST for highly artistic and polished images?',
          options: ['DALL-E 3', 'Stable Diffusion', 'Midjourney', 'MS Paint'],
          correct: 2,
        },
        {
          question: 'What does --ar 16:9 do in a Midjourney prompt?',
          options: [
            'Changes the color temperature',
            'Sets the image to widescreen format',
            'Makes the image black and white',
            'Increases the image quality',
          ],
          correct: 1,
        },
        {
          question: 'When generating images with DALL-E 3, what should you avoid using in your prompt?',
          options: [
            'Color names',
            'Negative words like "not" or "no"',
            'Aspect ratio numbers',
            'Short sentences',
          ],
          correct: 1,
        },
        {
          question: 'If your AI-generated image has blurry faces, what is the BEST fix?',
          options: [
            'Start over with a completely new prompt',
            'Add "photorealistic, 8K, sharp focus" to your prompt',
            'Add more colors to the prompt',
            'Make the image smaller',
          ],
          correct: 1,
        },
      ],
    });
    console.log('Quiz created for Module 1');

    // ── Module 2: AI for Logo & Business Design ───────────────────────
    const lessonData2 = [
      {
        title: 'What Is AI Logo & Brand Design?',
        summary: 'Understand how AI tools can create professional logos, color palettes, fonts, and complete brand identities in minutes.',
        content: `## What Is AI Logo & Brand Design?

AI logo and brand design is the process of using artificial intelligence tools to create professional branding assets — logos, color palettes, typography, business cards, and complete brand identity systems — without needing any graphic design experience.

Instead of spending days or weeks learning design software and iterating through concepts manually, you simply describe your business, your style preferences, and your industry. The AI generates dozens of logo concepts and brand assets in seconds.

### What Can AI Brand Tools Do?

- **Generate logo concepts** — from text descriptions of your business
- **Create complete brand kits** — logos, colors, fonts, and guidelines
- **Design matching assets** — business cards, social media graphics, flyers
- **Suggest color palettes** — based on your industry and style preferences
- **Generate typography pairings** — fonts that work well together`,
        duration: 7, order: 1,
        tips: ['Start with a clear idea of your brand personality before using AI tools', 'Save brand kits you like for inspiration'],
        keyTakeaways: ['AI can generate complete brand identities in minutes', 'No graphic design experience required', 'AI tools handle logos, colors, fonts, and marketing materials'],
      },
      {
        title: 'Step-by-Step: Create Your First Logo with Looka',
        summary: 'A complete walkthrough from entering your business name to downloading your final logo files using Looka.',
        content: `## Step-by-Step: Create Your First Logo with Looka

Looka is one of the easiest AI logo makers. Here's how to create your first logo.

### Step 1: Enter Your Business Name
Go to Looka.com and type in your business name. The AI will use this name to generate logo concepts.

### Step 2: Choose Your Industry
Select your industry so the AI knows what style of logos are appropriate.

### Step 3: Pick Your Styles
Choose logo styles you like — classic, modern, minimal, playful, elegant, etc. The AI learns your taste.

### Step 4: Select Colors
Pick 2-3 colors that represent your brand. Looka will generate logos using these colors.

### Step 5: Browse AI Concepts
The AI generates dozens of logo concepts based on your inputs. Browse and save your favorites.

### Step 6: Customize Your Pick
Edit your chosen logo — change fonts, colors, layout, icon, and spacing until it's perfect.

### Step 7: Download Your Brand Kit
Download your logo in multiple formats (PNG, SVG, PDF) plus a full brand kit with color codes and font names.`,
        duration: 14, order: 2,
        tips: ['Take your time browsing all generated concepts — sometimes the best ones are unexpected', 'You can regenerate as many times as you want'],
        keyTakeaways: ['Looka generates logos based on your business name, industry, and style preferences', 'You can customize every element after generation', 'The brand kit includes everything for a consistent identity'],
      },
      {
        title: 'Creating Logos with Canva AI and Dream Lab',
        summary: 'Learn how to use Canva AI tools including Dream Lab to generate professional logos and brand assets.',
        content: `## Creating Logos with Canva AI and Dream Lab

Canva has powerful AI tools built right in. Here's how to use them for logo design.

### Canva AI Logo Generator
- Open Canva and search for "AI Logo Generator"
- Describe your business and style preferences
- Canva generates multiple logo concepts instantly
- Customize colors, fonts, and layout in the editor

### Dream Lab (Powered by Leonardo.AI)
Dream Lab is Canva's most advanced AI image generator:
- Access it from the Canva editor sidebar
- Write detailed prompts for logo designs
- Get high-fidelity, professional-quality results
- Perfect for unique, custom logo illustrations

### Canva Brand Kit
Once you have your logo, save it to your Brand Kit:
- Your colors, fonts, and logos are stored in one place
- One-click access across all your designs
- Ensures brand consistency`,
        duration: 12, order: 3,
        tips: ['Use Dream Lab for custom illustration-style logos', 'Save all your brand assets in Canva\'s Brand Kit for easy reuse'],
        keyTakeaways: ['Canva AI generates logos from text descriptions', 'Dream Lab creates high-fidelity custom illustrations', 'The Brand Kit ensures consistent branding across all designs'],
      },
      {
        title: 'Professional Brand Design with Adobe Firefly',
        summary: 'Discover how Adobe Firefly can generate logos, brand kits, and design assets with advanced style control.',
        content: `## Professional Brand Design with Adobe Firefly

Adobe Firefly is Adobe's generative AI tool, integrated into the Creative Cloud ecosystem. It offers powerful controls for professional brand design.

### Key Features for Brand Design

**Text-to-Image for Logos**
Type descriptions like "elegant minimalist lotus logo for a spa business" and Firefly generates professional logo concepts.

**Design Intelligence**
Firefly learns your brand's colors, fonts, and style rules. The more you use it, the better it understands your brand.

**Style Controls**
Built-in controls for style, color, composition, and effects without starting a new prompt.

**Commercial Safety**
Adobe Firefly is trained on licensed content, making it safe for commercial use.

### Firefly vs Other Tools
- More professional control than Canva
- Better commercial safety guarantees
- Integrated with Photoshop, Illustrator, and InDesign
- Higher learning curve but more powerful results`,
        duration: 11, order: 4,
        tips: ['Use Firefly for client projects where commercial safety matters', 'Combine Firefly with Photoshop for final polish'],
        keyTakeaways: ['Adobe Firefly offers professional-grade AI brand design', 'Design Intelligence learns and remembers your brand rules', 'Commercial safety makes it ideal for client work'],
      },
      {
        title: 'Comparing the Top AI Logo & Branding Tools',
        summary: 'Looka vs Canva vs Adobe Firefly vs BrandCrowd vs Design.com — which one is right for you?',
        content: `## Comparing the Top AI Logo & Branding Tools

| Tool | Best For | Key Feature | Price |
|------|----------|-------------|-------|
| **Looka** | Complete brand kits | Generates logos + full brand identity | Starts at $20 one-time |
| **Canva AI** | Ease of use & templates | Dream Lab (Leonardo.AI) for high-fidelity logos | Free / Pro $13/month |
| **Adobe Firefly** | Professional quality | Design Intelligence learns your brand rules | Included with Creative Cloud |
| **BrandCrowd** | Template variety | AI-assisted suggestions + designer templates | $10 one-time |
| **Design.com** | All-in-one branding | Logos, business cards, flyers, websites | Starts at $20 |
| **VistaPrint** | Print-ready files | Generative AI for small business logos | Varies |
| **Zawa** | SMB branding | All-in-one AI design platform | Free / Paid plans |

### Which One Should You Choose?

**Choose Looka if:** You want a complete brand kit (logos, colors, fonts) in one place.

**Choose Canva AI if:** You want an easy, all-in-one design tool that also handles social media and marketing materials.

**Choose Adobe Firefly if:** You need professional-grade results and commercial safety for client work.

**Choose BrandCrowd if:** You prefer browsing templates and want the most affordable one-time payment.

**Choose Design.com if:** You need a full branding ecosystem including business cards and websites.`,
        duration: 15, order: 5,
        tips: ['Try the free versions before committing to a paid plan', 'Each tool has strengths — match the tool to the specific task'],
        keyTakeaways: ['Looka is best for complete brand kits', 'Canva is best for ease of use and versatility', 'Adobe Firefly is best for professional commercial work'],
      },
      {
        title: 'Designing Business Cards and Marketing Materials',
        summary: 'Learn how to use AI to create matching business cards, social media graphics, flyers, and posters.',
        content: `## Designing Business Cards and Marketing Materials

Once you have your logo and brand colors, the next step is creating marketing materials that match.

### Business Cards
- Use Canva or Design.com with your brand kit
- AI suggests layouts based on your logo and colors
- Export print-ready PDF files

### Social Media Graphics
- Create consistent posts for Instagram, Facebook, LinkedIn
- Use your brand kit colors and fonts automatically
- AI generates post templates that match your brand

### Flyers and Posters
- AI designs promotional materials that align with your brand
- Add your own images or use AI-generated visuals
- Download in print-ready formats

### Pro Tip
Always start with your Brand Kit loaded in your design tool. This ensures every piece of content looks like it belongs to your brand.`,
        duration: 10, order: 6,
        tips: ['Design business cards, flyers, and social posts in one sitting using your brand kit', 'Export everything in both digital and print formats'],
        keyTakeaways: ['AI can create a full set of matching marketing materials', 'A brand kit ensures consistency across all assets', 'Design your marketing materials as a complete set, not one at a time'],
      },
      {
        title: 'Building a Complete Brand Kit with AI',
        summary: 'Learn how AI can generate a complete brand kit including logos, color palettes, typography, and brand guidelines.',
        content: `## Building a Complete Brand Kit with AI

A brand kit is a collection of all the visual elements that make up your brand identity. AI can generate a complete brand kit in minutes.

### What's in a Brand Kit?

- **Primary Logo** — Main logo for most uses
- **Secondary Logo** — Alternate version for different contexts
- **Color Palette** — Primary, secondary, and accent colors with hex codes
- **Typography** — Font pairings for headings and body text
- **Brand Guidelines** — Rules for using the brand elements
- **Usage Examples** — How the brand looks on business cards, websites, social media

### How AI Builds a Brand Kit
1. You describe your business and style preferences
2. AI generates logos and brand elements
3. AI suggests a color palette based on your industry
4. AI recommends font pairings
5. Everything is packaged into a downloadable brand kit`,
        duration: 13, order: 7,
        tips: ['A complete brand kit makes your business look professional and established', 'Keep your brand kit file accessible whenever creating new content'],
        keyTakeaways: ['A brand kit includes logos, colors, fonts, and guidelines', 'AI can generate everything in one session', 'Consistent branding builds trust with your audience'],
      },
      {
        title: 'Common Mistakes and How to Fix Them',
        summary: 'Why do logos look generic? How to avoid common AI logo design pitfalls and create unique, memorable brands.',
        content: `## Common Mistakes and How to Fix Them

| Problem | Why It Happens | How to Fix |
|---------|---------------|------------|
| Logo looks generic | AI defaults to common patterns | Add specific style keywords: "minimalist", "hand-drawn", "geometric" |
| Wrong colors | Vague color descriptions | Use specific hex codes or color names |
| Text is blurry | AI struggles with text rendering | Use tools that specialize in text (Looka, Canva) |
| Icon doesn't match business | Generic icons over specific ones | Be very specific in your prompt about what the icon should represent |
| Too complex for a logo | AI generates detailed illustrations | Use "simple, clean, scalable logo" in your prompt |
| Font doesn't fit brand | Default font choices | Manually select fonts that match your brand personality |

### Tips for Unique Branding
- Combine AI-generated elements with manual customization
- Use specific, detailed prompts (not "a tech logo" but "a futuristic tech logo with circuit patterns in cyan and dark blue")
- Always customize at least 3 things after AI generation
- Get feedback from real people before finalizing`,
        duration: 9, order: 8,
        tips: ['Always customize AI-generated logos — the best results come from human + AI collaboration', 'Show your logo to 5 people and ask what it makes them think of'],
        keyTakeaways: ['Generic prompts produce generic logos', 'Always customize AI outputs for uniqueness', 'Specific, detailed prompts produce better results'],
      },
      {
        title: 'Ethical Use, Copyright, and Trademarks',
        summary: 'Understand the legal side of AI-generated logos — can you trademark them? What are the copyright rules?',
        content: `## Ethical Use, Copyright, and Trademarks

### Copyright Rules
- AI-generated logos may have different copyright rules depending on the tool
- Some tools give you full ownership, others retain certain rights
- Always read the terms of service for commercial use

### Trademarking AI Logos
- You can trademark an AI-generated logo if it's unique enough
- Adding manual customization strengthens your trademark claim
- The more you modify the AI output, the more legally protectable it is

### Best Practices
- Always check trademark databases before finalizing a logo
- Keep records of your design process
- Add your own creative input to AI designs
- Use tools with commercial-safe training data (Adobe Firefly, Canva)

### What to Avoid
- Don't copy existing brand logos
- Don't use trademarked characters or symbols
- Don't claim AI-generated work as purely human-made in professional contexts`,
        duration: 8, order: 9,
        tips: ['Add manual customization to AI logos for stronger trademark protection', 'Keep screenshots of your design process as proof of original work'],
        keyTakeaways: ['AI logos can be trademarked but customization helps', 'Always check terms of service for commercial use rights', 'Add human creative input for legal protection'],
      },
      {
        title: 'Practice Exercises',
        summary: 'Hands-on exercises: create a logo for a coffee shop, design a business card, build a complete brand kit, and more.',
        content: `## Practice Exercises

### Exercise 1 – Logo for a Local Business
Create a logo for "Sunrise Café" — a cozy breakfast café targeting morning commuters. Generate at least 3 different style options.

### Exercise 2 – Business Card Design
Using the Sunrise Café logo, design a matching business card. Include the logo, business name, tagline, phone number, and address.

### Exercise 3 – Complete Brand Kit
Build a full brand kit for a fictional tech startup called "NovaTech":
- Primary and secondary logos
- Color palette (5 colors)
- Font pairings
- Brand guidelines (1 paragraph)
- Social media profile picture and cover photo

### Exercise 4 – Style Transfer
Take the same business name and generate logos in 3 different styles:
- Modern minimalist
- Playful and colorful
- Luxury and elegant

### Exercise 5 – Real-World Project
Choose a real business you know (or your own) and create a complete brand identity:
- Logo with variations
- Business card
- Social media graphics (Instagram post, LinkedIn banner)
- Flyer or poster`,
        duration: 6, order: 10,
        tips: ['Start with a fictional business before working on real brands', 'Show your designs to friends and ask for honest feedback'],
        keyTakeaways: ['Practice with different industries and styles to build your skills', 'A complete brand identity includes many assets beyond just the logo', 'Real-world projects teach you the most'],
      },
    ];

    const lessons2 = lessonData2.map(l => ({
      ...l,
      moduleId: modules[1]._id,
      published: true,
      isPublished: true,
      videoUrl: '',
    }));
    await Lesson.insertMany(lessons2);
    console.log(lessons2.length + ' lessons created for Module 2');

    await Quiz.create({
      moduleId: modules[1]._id,
      title: 'AI for Logo & Business Design — Final Assessment',
      passingScore: 80,
      published: true,
      questions: [
        {
          question: 'What is included in a complete brand kit?',
          options: ['Only a logo', 'Logos, colors, fonts, and brand guidelines', 'Only business cards', 'Only a website'],
          correct: 1,
        },
        {
          question: 'Which AI tool is known for generating complete brand kits along with logos?',
          options: ['Looka', 'Microsoft Paint', 'Google Docs', 'Excel'],
          correct: 0,
        },
        {
          question: 'What does Adobe Firefly\'s Design Intelligence feature do?',
          options: ['It deletes your designs', 'It learns your brand\'s colors, fonts, and style rules', 'It only generates text', 'It only works with videos'],
          correct: 1,
        },
        {
          question: 'Which tool offers an AI business card generator as part of its branding ecosystem?',
          options: ['Design.com', 'Spotify', 'Netflix', 'Amazon'],
          correct: 0,
        },
        {
          question: 'What is the FIRST step when creating a logo with Looka?',
          options: ['Download the logo', 'Enter your business name and industry', 'Choose fonts', 'Pick colors'],
          correct: 1,
        },
      ],
    });
    console.log('Quiz created for Module 2');

    // ── Module 3: AI for Full Song Creation ───────────────────────
    const lessonData3 = [
      {
        title: 'What Is AI Music Generation?',
        summary: 'Understand how AI tools turn your text descriptions, lyrics, and even humming into complete songs with vocals, instruments, and professional structure.',
        content: `## What Is AI Music Generation?
        
AI music generation is the process of using artificial intelligence to create complete songs from simple text descriptions. You type a description like "upbeat pop song about summer road trips" and the AI generates vocals, instruments, melody, and structure — a fully produced track.

These AI models are trained on millions of songs across every genre imaginable. They learn the patterns of music: how verses lead to choruses, how different instruments blend together, how rhythms and melodies work. When you give them a prompt, they use this knowledge to create something entirely new.

The best part? You don't need to know how to play an instrument, read sheet music, or understand music theory. You just need to know how to describe the song you want to hear.`,
        duration: 8, order: 1,
        tips: ['Listen to AI-generated songs in different genres to understand what the tool can do', 'Start with simple prompts and gradually add more detail'],
        keyTakeaways: ['AI music generation creates complete songs from text descriptions', 'No music theory or instrument skills required', 'AI models learn from millions of songs across all genres'],
      },
      {
        title: 'Step-by-Step: Create Your First Song with Suno AI',
        summary: 'A complete walkthrough from signing up to generating your first full song with vocals, lyrics, and instruments using Suno, the most popular AI music tool.',
        content: `## Step-by-Step: Create Your First Song with Suno AI

### Step 1: Sign Up
Go to suno.com and create a free account. You get 50 free credits per day, enough to generate many songs.

### Step 2: Choose Your Mode
Click "Create" and select between two modes:
- **Simple Mode**: Just describe the song you want in natural language
- **Custom Mode**: Write your own lyrics and specify the style

### Step 3: Write Your Prompt (Simple Mode)
Type a description like: "upbeat pop song about summer road trips with female vocals and catchy chorus"

### Step 4: Write Your Lyrics (Custom Mode)
If using Custom Mode, write your lyrics following standard song structure (verse, chorus, verse, chorus, bridge, chorus). Add a style prompt at the top.

### Step 5: Generate
Click "Generate" and wait 20-40 seconds. Suno creates two versions of your song.

### Step 6: Listen and Refine
Preview both versions. Pick your favorite and either:
- Regenerate to get more variations
- Extend the song to make it longer
- Download the audio or video file

### Step 7: Download
Suno lets you download your song as an audio file (MP3) or a video file with a waveform visualizer and cover art.`,
        duration: 15, order: 2,
        tips: ['Start with Simple Mode to learn the basics before trying Custom Mode', 'Use your 50 free daily credits to experiment with different genres'],
        keyTakeaways: ['Suno generates complete songs from text prompts or custom lyrics', 'Two modes: Simple (describe) and Custom (write your own lyrics)', 'You can regenerate, extend, and download your songs'],
      },
      {
        title: 'Writing Music Prompts That Actually Work',
        summary: 'Learn the secret formula for writing music prompts that produce professional, radio-quality songs every time.',
        content: `## Writing Music Prompts That Actually Work

The quality of your AI song depends almost entirely on the quality of your prompt. Follow this formula.

### The 5 Elements of a Perfect Music Prompt

1. **Genre** — The style of music (pop, rock, lo-fi, orchestral, indie folk, K-pop, etc.)
2. **Mood** — The emotional feeling (uplifting, melancholic, energetic, dreamy, aggressive)
3. **Tempo** — How fast or slow (BPM or descriptive: "slow", "upbeat", "chill")
4. **Instruments** — What instruments you want (acoustic guitar, piano, 808 drums, synth pads)
5. **Vocals** — Voice type and style (male/female, soft, powerful, raspy, choir)

### Prompt Examples

| Weak Prompt | Strong Prompt |
|-------------|---------------|
| "A sad song" | "A melancholic indie folk ballad with acoustic guitar, soft piano, and emotional male vocals, 80 BPM" |
| "A party song" | "An energetic EDM track with powerful female vocals, heavy bass drops, synth leads, and a driving 128 BPM beat" |
| "Lo-fi music" | "A chill lo-fi hip hop beat with vinyl crackle, mellow piano chords, soft drums, and a warm nostalgic mood" |

### Pro Tips
1. Start with the genre first — it tells the AI what universe to work in
2. Be specific about vocal style — "raspy male vocals" vs "smooth female vocals" makes a huge difference
3. Use tempo to control energy — lower BPM for ballads, higher BPM for dance tracks
4. Mention specific instruments to guide the arrangement`,
        duration: 14, order: 3,
        tips: ['Save your best prompts in a document for reuse', 'Study successful prompts shared by other users', 'Always put the genre FIRST in your prompt'],
        keyTakeaways: ['The formula: Genre + Mood + Tempo + Instruments + Vocals', 'Specific prompts produce specific, high-quality results', 'Genre is the most important element — put it first'],
      },
      {
        title: 'Writing Lyrics That AI Can Sing Beautifully',
        summary: 'Discover how to write lyrics that flow naturally, rhyme well, and sound amazing when sung by AI voices.',
        content: `## Writing Lyrics That AI Can Sing Beautifully

Writing lyrics for AI singing requires understanding how AI vocal models interpret text. Here is what works best.

### Classic Song Structure

Most successful songs follow this structure:

**Verse 1** — Sets up the story (4-8 lines)
**Chorus** — The main hook, repeated (4-8 lines)
**Verse 2** — Continues the story
**Chorus** — Repeat
**Bridge** — A change in perspective (4-8 lines)
**Chorus** — Final repeat, often with more energy

### Tips for AI-Friendly Lyrics

1. **Use simple rhyme schemes** — AABB or ABAB patterns work best
2. **Keep lines roughly equal length** — Consistent syllable counts help the AI sing smoothly
3. **Use concrete imagery** — "Golden sunset over rusty cars" works better than abstract concepts
4. **Repeat key phrases** — Repetition helps the AI understand emphasis points
5. **Add syllable hints** — If a word needs to be stretched, the AI usually figures it out, but clear phrasing helps

### Example: Good AI Lyrics

(Verse 1)
"Driving down the highway with the windows down
Summer sun is setting on this sleepy town
Radio is playing our favorite song
Been waiting all week for this moment to come along"

(Chorus)
"We are young and free tonight
Everything is gonna be alright
Stars are shining bright above
This is what we dream of"

### What to Avoid
- Overly complex vocabulary — the AI may not pronounce it correctly
- Run-on sentences — keep each line as a complete thought
- Too many syllables per line — aim for 8-12 syllables per line`,
        duration: 12, order: 4,
        tips: ['Use a lyric template to structure your writing', 'Read your lyrics aloud — if they flow well spoken, they will flow well sung'],
        keyTakeaways: ['Classic song structure: Verse → Chorus → Verse → Chorus → Bridge → Chorus', 'Simple rhyme schemes and consistent syllable counts work best', 'Concrete imagery produces better results than abstract concepts'],
      },
      {
        title: 'Comparing the Top AI Music Tools',
        summary: 'Suno vs Udio vs MiniMax Music vs Google Lyria 3 vs ElevenLabs Music v2 — which one is right for you?',
        content: `## Comparing the Top AI Music Tools

| Tool | Best For | Key Feature | Price |
|------|----------|-------------|-------|
| **Suno** | Complete songs with vocals | Generates up to 8 min, voice cloning, 12-stem export | Free 50 credits/day, Pro $8-10/month |
| **Udio** | Precise clip-by-clip editing | Inpainting, 30-second clips you extend and remix | Free 10 credits/day, Standard $10/month |
| **Google Lyria 3** | Image-guided generation | Generate from text or photos, negative prompts | Free via Gemini app |
| **MiniMax Music** | Professional studio quality | 100+ instruments, 14 structural tags | Via API |
| **ElevenLabs Music v2** | Licensed, rights-cleared music | Section-by-section building, inpainting | Pay-per-use |

### Which One Should You Choose?

**Choose Suno if:** You want complete songs with vocals, lyrics, and instruments in seconds. Best for beginners and quick song creation.

**Choose Udio if:** You want precise control over each section of your song. Best for producers who want to edit clip by clip.

**Choose Google Lyria 3 if:** You want a free tool or want to generate music from images. Best for experimentation.

**Choose MiniMax Music if:** You need professional studio-quality instrumentals with maximum control.

**Choose ElevenLabs Music v2 if:** You need commercial rights and section-by-section building for professional projects.`,
        duration: 18, order: 5,
        tips: ['Try the free tiers of Suno and Udio before committing to a paid plan', 'Each tool excels in different areas — match the tool to the task'],
        keyTakeaways: ['Suno is best for complete songs with vocals', 'Udio offers precise clip-by-clip editing with inpainting', 'Different tools for different needs — try multiple options'],
      },
      {
        title: 'Advanced Features: Voice Cloning, Stems, and Inpainting',
        summary: 'Learn how to clone your own voice for AI singing, export individual instrument tracks (stems), and fix specific parts of a song without regenerating the whole thing.',
        content: `## Advanced Features: Voice Cloning, Stems, and Inpainting

### Voice Cloning
Suno's Pro and Premier plans let you upload a sample of your own singing voice. The AI learns your vocal characteristics and generates new songs that sound like you singing. This is incredible for artists who want to demo songs in their own voice.

### Stem Export
Stems are individual instrument tracks extracted from a full song. Suno supports up to 12-stem export:
- Vocals
- Drums
- Bass
- Guitar
- Keys
- Other instruments

This allows you to remix the song in a DAW (Digital Audio Workstation) like Ableton or FL Studio.

### Inpainting (Udio)
Inpainting lets you select a specific section of your track — for example, 10 seconds in the middle — and regenerate just that part. This is perfect for fixing a wrong note, changing a lyric line, or adjusting the arrangement without starting over.`,
        duration: 16, order: 6,
        tips: ['Voice cloning requires at least 30 seconds of clean vocal recording', 'Use stem export when you want to remix or professionally produce your AI song'],
        keyTakeaways: ['Voice cloning lets the AI sing in your own voice', 'Stem export extracts individual instrument tracks for remixing', 'Inpainting lets you fix specific sections without regenerating the whole song'],
      },
      {
        title: 'Using AI Music for Videos, Podcasts, and Commercial Projects',
        summary: 'Learn how to use AI-generated music for YouTube videos, TikTok Reels, podcasts, commercials, and other commercial projects.',
        content: `## Using AI Music for Videos, Podcasts, and Commercial Projects

### For YouTube Videos
AI-generated music works great as background music for tutorials, vlogs, and gaming content. Make sure to check the tool's commercial license — most paid plans allow commercial use.

### For TikTok and Reels
Short-form video platforms are perfect for AI songs. Generate 30-60 second clips and use them as:
- Background music
- Original soundtracks
- Song previews

### For Podcasts
Use AI music for intro/outro themes, background music during segments, and transition sounds. Adobe Podcast and LANDR can help clean up the audio further.

### For Commercial Projects
If you are creating music for a business, advertisement, or client project:
1. Always use a paid plan with commercial licensing
2. Check the specific terms of each tool
3. Keep records of your license

### Licensing Overview
- **Suno Free**: Non-commercial only
- **Suno Pro/Premier**: Commercial use allowed
- **Udio Free**: Non-commercial
- **Udio Standard**: Commercial use allowed
- **ElevenLabs Music**: Commercial rights included`,
        duration: 10, order: 7,
        tips: ['Always upgrade to a paid plan before using AI music commercially', 'Keep screenshots of your license and terms of service'],
        keyTakeaways: ['AI music can be used for videos, podcasts, and commercials', 'Commercial use requires a paid plan', 'Always check and save the licensing terms'],
      },
      {
        title: 'Common Mistakes and How to Fix Them',
        summary: 'Why do vocals sound robotic? Why is the structure weird? How to avoid common AI music pitfalls and get professional results.',
        content: `## Common Mistakes and How to Fix Them

| Problem | Why It Happens | How to Fix |
|---------|---------------|------------|
| Vocals sound robotic | Prompt lacked vocal style details | Add "emotional", "natural", or specific voice descriptions |
| Structure is weird | No structural guidance in prompt | Use song structure keywords: "verse, chorus, bridge" |
| Audio sounds muddy | Too many instruments competing | Specify fewer instruments or use "clean mix" |
| Wrong genre | Genre not specified or vague | Always put genre FIRST in your prompt |
| Lyrics don't fit | Lyric syllables don't match melody | Adjust syllable count, use simpler phrasing |
| Too short | Default generation length | Use extend feature or specify desired duration |

### Quick Fixes

- **Robotic vocals** → Add "natural, expressive vocals with emotion"
- **Bad structure** → Write "verse, chorus, verse, chorus, bridge, chorus" in your prompt
- **Muddy audio** → Use "clean production, clear mix, professional mastering"
- **Wrong style** → Be more specific: "90s rock ballad" not just "rock"
- **Short song** → Use the extend feature to add more sections`,
        duration: 9, order: 8,
        tips: ['When something sounds wrong, change only ONE element of your prompt at a time', 'Listen to professional songs in your target genre for reference'],
        keyTakeaways: ['Most AI music problems are caused by vague prompts', 'Add vocal style details to avoid robotic voices', 'Specify song structure explicitly for better results'],
      },
      {
        title: 'Ethical Use, Copyright, and Licensing',
        summary: 'Understand the legal side of AI-generated music — can you use it commercially? What are the copyright risks?',
        content: `## Ethical Use, Copyright, and Licensing

### Copyright Rules
- AI-generated music has complex copyright status depending on your jurisdiction
- In general, AI-generated content cannot be copyrighted in the US (no human authorship)
- However, if you significantly modify the output, you may have a copyright claim
- Always check each tool's terms of service

### Commercial Use
- Free tiers typically allow only non-commercial use
- Paid plans generally include commercial licenses
- Some tools (ElevenLabs Music) include full commercial rights
- Read the fine print — some tools claim ownership of your generated content

### Ethical Guidelines
1. Do not generate songs that imitate specific artists without permission
2. Do not claim AI-generated songs as purely human-created
3. Be transparent about using AI tools
4. Do not use AI to create misleading content (fake songs by real artists)
5. Respect the work of human musicians

### Best Practices
- Use AI music as a creative tool, not a replacement for human artists
- Add your own creative input to AI outputs
- Disclose AI use when publishing professionally
- Keep records of your generation process for legal protection`,
        duration: 8, order: 9,
        tips: ['When in doubt, check the specific terms of service for the tool you are using', 'Add significant human creative input to strengthen any copyright claims'],
        keyTakeaways: ['AI music copyright is complex — check your jurisdiction and tool terms', 'Commercial use requires a paid plan with commercial licensing', 'Be transparent about AI use and respect human artists'],
      },
      {
        title: 'Practice Exercises',
        summary: 'Hands-on exercises: generate a pop song, create an instrumental track, write your own lyrics and make AI sing them, and more.',
        content: `## Practice Exercises

### Exercise 1 – Your First Song
Generate a song in Simple Mode: "upbeat pop song about weekend adventures with female vocals". Generate at least 2 versions.

### Exercise 2 – Custom Lyrics
Write your own 16-line song following the verse-chorus structure. Use Custom Mode in Suno to generate it with your lyrics.

### Exercise 3 – Genre Exploration
Take the same set of lyrics and generate them in 3 different genres:
- Pop
- Rock
- Lo-fi hip hop

Compare how the same lyrics sound in different musical contexts.

### Exercise 4 – Instrumental Only
Create an instrumental track with no vocals. Describe it in detail: "cinematic orchestral piece with strings, brass, and timpani, building from soft to epic, 120 BPM"

### Exercise 5 – Voice Cloning (if available)
Record 30 seconds of yourself humming or singing. Use the voice cloning feature to create a song in your own voice.

### Course Summary
By the end of this module, you should be able to:
- Generate complete songs using AI tools
- Write effective music prompts
- Create and input custom lyrics
- Compare and choose between different AI music tools
- Understand licensing and ethical considerations`,
        duration: 6, order: 10,
        tips: ['Practice generating at least 5 songs per day to build your skills', 'Save your best prompts and reuse them with modifications'],
        keyTakeaways: ['Practice with different genres, structures, and styles', 'Custom lyrics give you more creative control', 'Voice cloning and stem export are advanced features to master'],
      },
    ];

    const lessons3 = lessonData3.map(l => ({
      ...l,
      moduleId: modules[2]._id,
      published: true,
      isPublished: true,
      videoUrl: '',
    }));
    await Lesson.insertMany(lessons3);
    console.log(lessons3.length + ' lessons created for Module 3');

    await Quiz.create({
      moduleId: modules[2]._id,
      title: 'AI for Full Song Creation — Final Assessment',
      passingScore: 80,
      published: true,
      questions: [
        {
          question: 'Which AI music tool is known as the "consumer favorite" and generates songs up to 8 minutes long?',
          options: ['Udio', 'Suno', 'Google Lyria 3', 'ElevenLabs'],
          correct: 1,
        },
        {
          question: 'What does the "Inpainting" feature in Udio allow you to do?',
          options: [
            'Add more instruments to the whole song',
            'Select a specific section of a track and regenerate just that part',
            'Change the tempo of the entire song',
            'Remove vocals completely',
          ],
          correct: 1,
        },
        {
          question: 'What is the FIRST thing you should put in a music prompt?',
          options: ['The tempo (BPM)', 'The genre (e.g., pop, rock, lo-fi)', 'The vocal style', 'The instruments'],
          correct: 1,
        },
        {
          question: 'Which AI music tool offers voice cloning, allowing you to upload your own singing voice?',
          options: ['Udio', 'Google Lyria 3', 'Suno (Pro/Premier)', 'Mubert'],
          correct: 2,
        },
        {
          question: 'What does "stem export" allow you to do?',
          options: [
            'Export the song as a video file',
            'Export individual instrument tracks (vocals, drums, bass, etc.)',
            'Export only the lyrics',
            'Export the song as a PDF',
          ],
          correct: 1,
        },
      ],
    });
    console.log('Quiz created for Module 3');

    // ── Module 4: AI for Audio Mixing & Mastering ──────────────────
    const lessonData4 = [
      {
        title: 'What Is AI Audio Mixing and Mastering?',
        summary: 'Understand the difference between mixing and mastering, and how AI tools can automate these processes to give you studio-quality sound in minutes.',
        content: `## What Is AI Audio Mixing and Mastering?

Audio mixing and mastering are the two final steps in music production — the processes that turn rough recordings into polished, professional tracks.

**Mixing** is the process of balancing individual tracks (vocals, drums, guitars, keyboards) so they sound great together. You adjust volume levels, pan instruments left or right, add effects like reverb and delay, and use EQ to make each instrument fit in its own frequency space.

**Mastering** is the final polish on the complete stereo mix. You make the track sound consistent across all playback systems (headphones, car speakers, club sound systems), adjust overall volume, and prepare the final file for distribution.

AI tools now automate both processes. You upload your raw recordings, the AI analyzes them, and applies professional-grade processing automatically. In minutes, your track sounds like it was produced in a million-dollar studio.`,
        duration: 8, order: 1,
        tips: ['Listen to your raw recording before AI processing so you can appreciate the difference', 'Think of mixing as "balancing ingredients" and mastering as "the final presentation"'],
        keyTakeaways: ['Mixing balances individual tracks together', 'Mastering polishes the final stereo mix', 'AI tools automate both processes for professional results'],
      },
      {
        title: 'Step-by-Step: Master Your First Track with LANDR',
        summary: 'A complete walkthrough from uploading your raw track to downloading a professionally mastered version using LANDR.',
        content: `## Step-by-Step: Master Your First Track with LANDR

### Step 1: Create an Account
Go to landr.com and sign up for a free account. The free plan gives you basic mastering with limited exports.

### Step 2: Upload Your Track
Click "Upload" and select your audio file. LANDR supports WAV, MP3, FLAC, and other common formats. For best results, upload a WAV file at 44.1kHz / 16-bit or higher.

### Step 3: Choose Your Style
LANDR offers several mastering styles:
- **Loud** — Maximized volume, great for competitive genres
- **Balanced** — A nice middle ground
- **Warm** — Emphasizes low-end and richness
- **Open** — More dynamic range, less compression
- **Punchy** — Emphasized transients for impact

### Step 4: Let AI Analyze
The AI analyzes your track's frequency balance, dynamic range, and loudness. It applies EQ, compression, limiting, and stereo enhancement automatically.

### Step 5: Preview and Compare
LANDR lets you toggle between your original and the mastered version. Listen on headphones, speakers, and even a phone speaker to check consistency.

### Step 6: Download
Download your mastered track in high quality (WAV or MP3). Free users get limited downloads — upgrade to Pro for unlimited.`,
        duration: 14, order: 2,
        tips: ['Upload the highest quality WAV file you have for best results', 'Compare your mastered track on multiple playback systems before finalizing'],
        keyTakeaways: ['LANDR provides automated AI mastering with style presets', 'Choose a style that matches your genre', 'Always preview on multiple systems before downloading'],
      },
      {
        title: 'Professional Mastering with iZotope Ozone 11',
        summary: 'Learn how to use Ozone 11\'s AI-powered Master Assistant to get professional, genre-specific mastering suggestions with full control over every parameter.',
        content: `## Professional Mastering with iZotope Ozone 11

iZotope Ozone 11 is the industry standard for AI-assisted mastering. It combines powerful machine learning with full manual control.

### Master Assistant
Ozone's Master Assistant listens to your track and analyzes:
- Genre characteristics
- Frequency balance
- Dynamic range
- Loudness levels

It then suggests tailored EQ, compression, limiting, and stereo imaging settings. You can accept them as-is or tweak every parameter.

### Key Modules in Ozone 11

**EQ (Equalizer)** — Shape the frequency balance of your track. The AI suggests cuts and boosts based on genre targets.

**Compressor** — Control dynamic range. The AI sets attack, release, ratio, and threshold automatically.

**Limiter** — Maximize loudness without distortion. True Peak limiting prevents digital clipping.

**Stem Focus** — A revolutionary feature that applies Ozone's processing to isolated stems (vocals, drums, bass) within the full mix.

**Clarity Module** — Enhances definition and punch. Makes your master sound clearer and more detailed.

### Genre Targets
Ozone includes genre-specific targets for pop, rock, hip hop, classical, jazz, EDM, and more. The AI adjusts its suggestions based on the target genre.`,
        duration: 16, order: 3,
        tips: ['Start with Master Assistant and then tweak manually — it gives you a great starting point', 'Use Stem Focus for surgical corrections on specific elements'],
        keyTakeaways: ['Ozone 11 combines AI assistance with full manual control', 'Master Assistant analyzes your track and suggests genre-specific settings', 'Stem Focus allows processing isolated elements within the full mix'],
      },
      {
        title: 'Stem Splitting: Isolate Vocals and Instruments with Moises',
        summary: 'Discover how to use Moises to split any song into separate stems (vocals, drums, bass, guitar, and more) for remixing, practicing, or creating backing tracks.',
        content: `## Stem Splitting: Isolate Vocals and Instruments with Moises

Moises is an AI-powered audio tool that separates any song into individual stems — isolated tracks for vocals, drums, bass, guitar, and other instruments.

### How It Works
1. Upload any audio file to Moises
2. AI analyzes the track and identifies different sound sources
3. Moises separates them into independent stems
4. Download individual stems or create a custom mix

### What You Can Do with Stems

**For Musicians:**
- Remove vocals to create karaoke tracks
- Isolate bass lines to learn them
- Create backing tracks for live performance

**For Producers:**
- Get acapellas for remixes
- Extract drum loops for new tracks
- Isolate specific elements for sampling

**For Content Creators:**
- Create instrumental versions for videos
- Adjust volume balance for better audio
- Remove unwanted elements

### Moises Features
- Separates up to 5 stems (vocals, drums, bass, guitar, other)
- Real-time processing (30-60 seconds per song)
- Web app and mobile app available
- Free tier with limited usage`,
        duration: 12, order: 4,
        tips: ['Use high-quality MP3 or WAV files for best separation results', 'Try the free version first to see if the quality meets your needs'],
        keyTakeaways: ['Moises splits songs into individual stems using AI', 'Stems are useful for remixing, practicing, and content creation', 'The tool separates vocals, drums, bass, guitar, and other instruments'],
      },
      {
        title: 'Fixing Bad Audio: Adobe Podcast Enhance Speech',
        summary: 'Learn how to use Adobe Podcast\'s free AI tool to remove background noise, echo, and microphone artifacts — turning laptop recordings into studio-quality voiceovers.',
        content: `## Fixing Bad Audio: Adobe Podcast Enhance Speech

Adobe Podcast Enhance Speech is a free web-based AI tool that transforms poor-quality voice recordings into clear, professional audio.

### What It Fixes
- **Background noise** — Fans, AC, traffic, room hum
- **Echo and reverb** — Bathroom or empty room sound
- **Plosives** — "P" and "B" pops from close microphone use
- **Sibilance** — Harsh "S" sounds
- **Volume inconsistency** — Quiet and loud sections balanced
- **Microphone artifacts** — Built-in laptop mic quality improved

### How to Use It
1. Go to podcast.adobe.com/enhance
2. Upload your audio file (MP3, WAV, M4A, or AAC)
3. The AI processes your file automatically (takes 1-3x the file length)
4. Preview the enhanced version
5. Download the cleaned audio

### Best Results
- Voice-only recordings work best (not full music mixes)
- Clear speech with minimal background noise processes best
- Files under 1 hour recommended
- The tool is completely free — no Adobe account required`,
        duration: 10, order: 5,
        tips: ['Record in the quietest room available — AI can only fix so much', 'Adobe Podcast Enhance Speech is free and requires no account — use it for all your voice recordings'],
        keyTakeaways: ['Adobe Podcast Enhance Speech removes noise, echo, and artifacts', 'It is completely free and works in your browser', 'Best results with voice-only recordings'],
      },
      {
        title: 'Comparing the Top AI Audio Tools',
        summary: 'LANDR vs iZotope Ozone vs Moises vs Adobe Podcast vs Sonible — which tool is right for your needs?',
        content: `## Comparing the Top AI Audio Tools

| Tool | Best For | Key Feature | Price |
|------|----------|-------------|-------|
| **LANDR** | Fast automated mastering | AI mastering with style presets, unlimited revisions | Free (limited), Pro from $8/month |
| **iZotope Ozone 11** | Professional mastering with full control | Master Assistant, Stem Focus, Clarity Module | Elements $50, Standard $200, Advanced $400 |
| **Moises** | Stem separation and remixing | Isolate vocals, drums, bass, guitar | Free (limited), Pro from $4/month |
| **Adobe Podcast** | Voice enhancement and noise removal | Enhance Speech removes noise, echo, plosives | Free |
| **Sonible** | Smart mixing plugins | smart:EQ, smart:comp, smart:reverb | Varies per plugin |
| **RoEx** | AI mixing and mastering | Submit multitrack stems for professional AI mixing | Pay-per-use |

### Which One Should You Choose?

**Choose LANDR if:** You want fast, automated mastering with no learning curve.

**Choose iZotope Ozone 11 if:** You want professional control with AI assistance as a starting point.

**Choose Moises if:** You need stem separation for remixing or practice.

**Choose Adobe Podcast if:** You need to clean up voice recordings for free.

**Choose Sonible if:** You want smart AI plugins for mixing individual tracks.`,
        duration: 15, order: 6,
        tips: ['Use Adobe Podcast Enhance Speech for all your voice recordings — it is free and excellent', 'For music, start with LANDR for simplicity, graduate to Ozone for control'],
        keyTakeaways: ['LANDR is best for quick automated mastering', 'Ozone 11 provides professional control with AI guidance', 'Adobe Podcast is a free essential tool for voice cleanup'],
      },
      {
        title: 'AI-Powered Mixing: Neutron and Smart EQ Plugins',
        summary: 'Discover how AI mixing tools like iZotope Neutron and Sonible smart:EQ can analyze your tracks and suggest EQ, compression, and balance adjustments automatically.',
        content: `## AI-Powered Mixing: Neutron and Smart EQ Plugins

### iZotope Neutron
Neutron is an AI-powered mixing plugin suite. Its Mix Assistant listens to all your tracks and automatically suggests:
- Volume balance between instruments
- EQ settings for each track
- Compression settings
- Panning positions

**Track Assistant** analyzes each individual track and suggests a starting chain of processing plugins. You can accept the suggestions or tweak them.

**Relay** is a plugin you put on every track. It communicates with Neutron's Mix Assistant so the AI knows what every instrument is doing.

### Sonible smart:EQ
Sonible smart:EQ uses AI to analyze your audio and identify frequency problems:
- It highlights muddy frequencies (too much low-mid)
- It suggests cuts for resonant peaks
- It recommends boosts for clarity
- It learns from your adjustments over time

### How AI Mixing Helps
- Eliminates guesswork — AI gives you a great starting point
- Speed — get 80% of the way there in seconds
- Learning tool — see what the AI does and understand why
- Consistency — get reliable results across multiple tracks`,
        duration: 13, order: 7,
        tips: ['Use AI mixing suggestions as a starting point, not the final mix', 'Learn from what the AI does — it is a teaching tool as much as a production tool'],
        keyTakeaways: ['Neutron\'s Mix Assistant suggests EQ, compression, and balance', 'Sonible smart:EQ highlights frequency problems automatically', 'AI mixing tools are great starting points and learning tools'],
      },
      {
        title: 'Using AI Audio for Podcasts, Videos, and Commercial Projects',
        summary: 'Learn how to use AI-enhanced audio for YouTube videos, podcasts, commercials, and professional projects.',
        content: `## Using AI Audio for Podcasts, Videos, and Commercial Projects

### For Podcasts
1. Record your voice (even on a laptop microphone)
2. Use Adobe Podcast Enhance Speech to clean up the audio
3. Use LANDR or Ozone to master the final mix
4. Publish on Spotify, Apple Podcasts, or YouTube

### For YouTube Videos
1. Record voiceover or dialogue
2. Enhance with Adobe Podcast
3. Add background music (AI-generated or licensed)
4. Master the full mix with LANDR
5. Export and sync with video

### For Commercial Projects
- Always use licensed tools with commercial terms
- Adobe Podcast is free for any use
- LANDR Pro includes commercial licensing
- iZotope products include commercial use

### Distribution
- LANDR offers distribution to Spotify, Apple Music, and TikTok
- Use DistroKid, TuneCore, or CD Baby for wider distribution
- AI-mastered tracks are accepted by all major platforms`,
        duration: 10, order: 8,
        tips: ['Clean up voice recordings with Adobe Podcast BEFORE adding music', 'Master your final mix after all editing is complete'],
        keyTakeaways: ['AI audio tools work for podcasts, videos, and commercial music', 'Enhance first, then master — this order produces the best results', 'AI-mastered tracks are accepted by all major distribution platforms'],
      },
      {
        title: 'Common Mistakes and How to Fix Them',
        summary: 'Why does my master sound too loud? Why are vocals still muddy? How to avoid common AI audio pitfalls.',
        content: `## Common Mistakes and How to Fix Them

| Problem | Why It Happens | How to Fix |
|---------|---------------|------------|
| Master is too loud/distorted | Too much limiting | Lower the master volume target or use a less aggressive style |
| Vocals sound muddy | Low-mid frequency buildup | Use EQ to cut around 200-400Hz on vocals |
| Master sounds dull | Too much low-end or excessive compression | Use a more open mastering style or reduce compression |
| Harsh high frequencies | Over-emphasized highs | Use a gentle high-frequency cut around 8-10kHz |
| No stereo width | Too much mono summing | Use stereo imaging tools sparingly |
| Background noise still audible | Poor source recording | Re-record in a quieter space or use noise reduction first |

### Quick Fixes

- **Too loud** → Choose "Balanced" or "Open" style instead of "Loud"
- **Muddy vocals** → Apply EQ with a cut at 250Hz (high-pass filter)
- **Dull sound** → Choose "Open" mastering style, reduce compression
- **Harsh sound** → Apply gentle low-pass filter around 12kHz
- **Quiet on phone speakers** → Check mono compatibility in your master`,
        duration: 9, order: 9,
        tips: ['Always listen to your master on at least 3 different systems (headphones, speakers, phone)', 'Fix issues at the mixing stage — mastering cannot fix a bad mix'],
        keyTakeaways: ['Most mastering issues come from the source recording or mix', 'Choose the right mastering style for your genre', 'Listen on multiple systems before finalizing'],
      },
      {
        title: 'Ethical Use, Copyright, and Licensing',
        summary: 'Understand the legal side of AI-processed audio — can you use AI-mastered tracks commercially? What about stem-splitting?',
        content: `## Ethical Use, Copyright, and Licensing

### AI Mastering
- AI-mastered tracks are fully yours to use commercially
- Mastering is considered a processing tool, not content generation
- No special licensing required beyond your original rights

### Stem Splitting
- Splitting stems from existing songs for personal use is generally fine
- Using stems for commercial remixes requires permission from the copyright holder
- Do not distribute isolated stems of copyrighted songs
- Use stem splitting for practice, learning, and personal projects

### Voice Enhancement
- Enhanced voice recordings are your property
- Adobe Podcast does not claim ownership of processed files
- Safe for commercial use

### General Guidelines
1. Always own or have license to the original material
2. Be transparent about using AI tools in professional work
3. Respect copyright of other artists' work
4. Do not use AI audio processing to deceive or misrepresent`,
        duration: 8, order: 10,
        tips: ['AI-mastered versions of your own music are fully yours', 'Stem splitting for personal use is fine — distributing stems requires permission'],
        keyTakeaways: ['AI-mastered tracks are fully yours to use commercially', 'Stem splitting for personal use is acceptable, distribution requires permission', 'Voice enhancement tools do not claim ownership of your files'],
      },
      {
        title: 'Practice Exercises',
        summary: 'Hands-on exercises: master a demo track with LANDR, split stems with Moises, enhance a podcast recording with Adobe Podcast, and more.',
        content: `## Practice Exercises

### Exercise 1 – Master a Track with LANDR
Upload any audio file to LANDR and master it in 3 different styles (Loud, Balanced, Warm). Compare the results and pick your favorite.

### Exercise 2 – Split Stems with Moises
Upload a full song to Moises and split it into stems. Listen to each stem individually to understand what each instrument contributes to the mix.

### Exercise 3 – Enhance a Voice Recording
Record your voice on your phone or laptop microphone. Upload it to Adobe Podcast Enhance Speech. Compare the before and after.

### Exercise 4 – Full Podcast Workflow
1. Record a 2-minute voice clip
2. Enhance with Adobe Podcast
3. Add background music
4. Master the final mix with LANDR
5. Export and prepare for publishing

### Exercise 5 – Compare AI Mastering Tools
Master the same raw track with both LANDR and Ozone 11 (trial). Compare the results. Which do you prefer and why?

### Course Summary
By the end of this module, you should be able to:
- Master tracks using LANDR and iZotope Ozone 11
- Split songs into stems with Moises
- Clean up voice recordings with Adobe Podcast
- Understand the difference between mixing and mastering
- Choose the right AI audio tool for each task`,
        duration: 6, order: 11,
        tips: ['Practice on different genres of music to understand how AI tools adapt', 'The before/after comparison is the best way to learn what processing does'],
        keyTakeaways: ['Practice with different tools on the same source material to understand their strengths', 'Always compare before and after to hear what the AI changed', 'Each tool excels at different parts of the audio production workflow'],
      },
    ];

    const lessons4 = lessonData4.map(l => ({
      ...l,
      moduleId: modules[3]._id,
      published: true,
      isPublished: true,
      videoUrl: '',
    }));
    await Lesson.insertMany(lessons4);
    console.log(lessons4.length + ' lessons created for Module 4');

    await Quiz.create({
      moduleId: modules[3]._id,
      title: 'AI for Audio Mixing & Mastering — Final Assessment',
      passingScore: 80,
      published: true,
      questions: [
        {
          question: 'What is the difference between mixing and mastering?',
          options: [
            'Mixing is for vocals, mastering is for instruments',
            'Mixing balances individual tracks; mastering polishes the final stereo mix',
            'There is no difference',
            'Mixing is done by AI, mastering is done by humans',
          ],
          correct: 1,
        },
        {
          question: 'Which AI tool is known for its Master Assistant that analyzes your track and suggests genre-specific mastering settings?',
          options: ['LANDR', 'iZotope Ozone 11', 'Moises', 'Adobe Podcast'],
          correct: 1,
        },
        {
          question: 'What does Moises do?',
          options: [
            'It masters your track automatically',
            'It splits songs into individual stems like vocals, drums, and bass',
            'It removes background noise from podcasts',
            'It generates new songs from text prompts',
          ],
          correct: 1,
        },
        {
          question: 'Which free tool is best for removing background noise and echo from voice recordings?',
          options: ['iZotope Ozone 11', 'LANDR', 'Adobe Podcast Enhance Speech', 'Moises'],
          correct: 2,
        },
        {
          question: 'What does "Stem Focus" in Ozone 11 allow you to do?',
          options: [
            'Add more instruments to your track',
            'Apply Ozone\'s processing to isolated stems like vocals and drums',
            'Remove vocals completely',
            'Change the tempo of your track',
          ],
          correct: 1,
        },
      ],
    });
    console.log('Quiz created for Module 4');

    // ── Module 5: AI for Short Video Creation ──────────────────────
    const lessonData5 = [
      {
        title: 'What Is AI Video Generation?',
        summary: 'Understand how AI tools turn your text descriptions and images into short, high-quality video clips using advanced diffusion and transformer models.',
        content: `## What Is AI Video Generation?

AI video generation is the process of creating short video clips from text descriptions or still images. You type something like "a golden retriever puppy running through a sunny meadow, cinematic slow motion" and the AI generates a 5-15 second video clip matching your description.

These AI models are built on advanced diffusion and transformer architectures similar to image generators, but extended to understand motion and time. The models learn from millions of video clips how objects move, how cameras behave, and how scenes unfold naturally.

You don't need any video editing skills, camera equipment, or production experience. You just need to describe the scene you want to see.`,
        duration: 8, order: 1,
        tips: ['Watch AI-generated video examples to understand what styles are possible', 'Start with simple scenes and gradually add complexity'],
        keyTakeaways: ['AI video generation creates short clips from text or images', 'No video editing or camera skills required', 'AI models learn motion and timing from millions of video clips'],
      },
      {
        title: 'Step-by-Step: Create Your First Video with Runway Gen-3',
        summary: 'A complete walkthrough from signing up to generating your first high-quality AI video using Runway Gen-3 Alpha.',
        content: `## Step-by-Step: Create Your First Video with Runway Gen-3

### Step 1: Create an Account
Go to runwayml.com and sign up for a free account. The free plan includes limited credits to start generating.

### Step 2: Start Gen-3 Alpha
Click "Start with Gen-3 Alpha" and select "Text to Video" mode.

### Step 3: Write Your Prompt
Type a detailed description of your scene. Include the subject, action, environment, camera movement, and style.

Example: "Aerial view of a lone wolf walking through a snowy pine forest at sunrise, golden light, misty, cinematic, 4K quality"

### Step 4: Configure Settings
Set your desired duration (5 or 10 seconds) and aspect ratio (16:9, 9:16, or 1:1).

### Step 5: Generate
Click "Generate" and wait 30-60 seconds. Runway creates your video clip.

### Step 6: Preview and Refine
Watch your video. If it is not quite right, adjust your prompt and generate again. Small changes to the prompt can produce dramatically different results.

### Step 7: Download
Click download to save your video as an MP4 file.`,
        duration: 15, order: 2,
        tips: ['Write prompts in the "Subject + Action + Environment + Camera + Style" format', 'Generate multiple versions and pick the best one'],
        keyTakeaways: ['Runway Gen-3 produces professional-quality AI videos', 'Prompts should include subject, action, environment, camera, and style', 'Generate and iterate — the first result is rarely the best'],
      },
      {
        title: 'Creating Videos with Pika: The Fun and Easy Way',
        summary: 'Learn how to use Pika, the beginner-friendly AI video maker that understands natural language and lets you create fun videos in seconds.',
        content: `## Creating Videos with Pika: The Fun and Easy Way

Pika is designed to be the most accessible AI video tool. It understands natural language descriptions and generates videos in under 30 seconds.

### Getting Started with Pika

1. Go to pika.art and create a free account
2. Choose your input mode: text-to-video, image-to-video, or audio-driven generation
3. Type your prompt in plain English
4. Click generate and watch your video come to life

### Pika's Key Features

**Natural Language Understanding** — You can describe scenes conversationally: "A cat wearing a tiny wizard hat casting a spell with glowing blue magic"

**Image-to-Video** — Upload a photo or AI-generated image and animate it

**Audio-Driven** — Upload a music clip or sound effect and Pika generates a video that matches the audio

### Pika vs Runway
- Pika is faster (under 30 seconds vs 30-60 seconds)
- Pika understands casual language better
- Runway produces higher overall quality
- Both tools have free tiers to experiment`,
        duration: 12, order: 3,
        tips: ['Use Pika for quick experimentation and Runway for final production', 'Pika\'s natural language understanding means you can use casual descriptions'],
        keyTakeaways: ['Pika generates videos in under 30 seconds with natural language', 'Supports text-to-video, image-to-video, and audio-driven modes', 'Best tool for beginners and quick experimentation'],
      },
      {
        title: 'Advanced Video Creation with Kling AI',
        summary: "Discover Kling AI's powerful features including Motion Brush for controlling movement, multi-shot storyboarding, and native audio generation.",
        content: `## Advanced Video Creation with Kling AI

Kling AI offers some of the most advanced controls in AI video generation.

### Motion Brush
Motion Brush lets you select specific areas of an image and make only those parts move. For example, you can paint over a waterfall in a photo and only the water flows, while the rocks and trees stay perfectly still.

### Multi-Shot Storyboarding
Plan complete video sequences with up to 6 connected shots. Each shot maintains consistency and flows naturally into the next.

### Native Audio Generation
Kling can generate sound effects and even lip-synced dialogue alongside your video. This means you get audio and video in a single generation step.

### Key Strengths of Kling
- Best-in-class Motion Brush for selective animation
- Multi-shot storyboarding for complete scenes
- Native audio generation including dialogue
- 4K video output

Kling is ideal when you need precise control over exactly what moves in your video.`,
        duration: 14, order: 4,
        tips: ['Use Motion Brush when you only want specific elements to move', 'Plan your storyboard before generating multi-shot sequences'],
        keyTakeaways: ['Motion Brush lets you control exactly which parts of an image move', 'Multi-shot storyboarding creates consistent multi-clip sequences', 'Kling generates native audio including sound effects and dialogue'],
      },
      {
        title: 'Writing Video Prompts That Actually Work',
        summary: 'Learn the formula for writing video prompts that produce exactly the scene you imagine — not what the AI guesses.',
        content: `## Writing Video Prompts That Actually Work

Video prompts are different from image prompts. You need to describe not just what the scene looks like, but how it moves.

### The 6 Elements of a Perfect Video Prompt

1. **Subject** — The main focus (person, animal, object)
2. **Action** — What the subject is doing (running, flying, dancing)
3. **Environment** — Where the scene takes place (beach, forest, city)
4. **Camera Movement** — How the camera moves (zoom, pan, follow, aerial)
5. **Style** — Visual style (cinematic, cartoon, realistic, 8K)
6. **Duration** — How long the clip should be (5 or 10 seconds)

### Examples

| Weak Prompt | Strong Prompt |
|-------------|---------------|
| "A car driving" | "A red sports car speeding down a coastal highway at sunset, camera follows from behind, cinematic slow motion, 10 seconds" |
| "A person walking" | "A woman in a flowing red dress walking through a rainy Tokyo street at night, neon reflections, camera pans slowly, moody cinematic style" |
| "A bird flying" | "A bald eagle soaring over a mountain range, dramatic clouds, camera tracks alongside, nature documentary style, 4K" |

### Camera Movement Keywords
- Dolly zoom, pan left/right, tilt up/down
- Follow, track, aerial, bird's eye view
- Slow motion, time-lapse, hyperlapse
- First-person, third-person, orbiting`,
        duration: 13, order: 5,
        tips: ['Always specify camera movement — it makes the biggest difference in video quality', 'Use "cinematic" and "slow motion" keywords for professional-looking results'],
        keyTakeaways: ['The formula: Subject + Action + Environment + Camera + Style + Duration', 'Camera movement is the most important element for professional results', 'Be specific about every element for predictable outputs'],
      },
      {
        title: 'Controlling Camera Movement and Motion',
        summary: 'Master camera controls like zoom, pan, and slow motion, and learn how to use Motion Brush to animate specific parts of an image.',
        content: `## Controlling Camera Movement and Motion

### Camera Movement Keywords

| Keyword | What It Does |
|---------|-------------|
| Dolly zoom | Camera moves toward subject while zooming out (dramatic effect) |
| Pan left/right | Camera rotates horizontally |
| Tilt up/down | Camera rotates vertically |
| Follow | Camera tracks alongside a moving subject |
| Aerial | Bird's-eye view from above |
| Slow motion | Dramatically slowed movement |
| Orbiting | Camera circles around the subject |

### Using Motion Brush (Kling AI)

Motion Brush gives you pixel-level control over movement. Here is how to use it:

1. Upload a still image
2. Select the Motion Brush tool
3. Paint over the areas you want to animate
4. Set the direction and intensity of movement
5. Generate — only the painted areas will move

### Common Motion Settings
- **Intensity**: Low (subtle movement) to High (dramatic motion)
- **Direction**: Up, down, left, right, or custom
- **Speed**: Slow, medium, or fast`,
        duration: 11, order: 6,
        tips: ['Use subtle motion for realistic results and strong motion for stylized effects', 'Motion Brush is perfect for animating water, hair, clouds, and flags'],
        keyTakeaways: ['Camera movement keywords dramatically change video feel', 'Motion Brush allows precise control over which elements move', 'Start with subtle motion and increase for stylized effects'],
      },
      {
        title: 'Image-to-Video: Bringing Still Images to Life',
        summary: 'Learn how to upload your AI art, photos, or drawings and turn them into animated videos with natural movement.',
        content: `## Image-to-Video: Bringing Still Images to Life

Image-to-Video (img2vid) is one of the most exciting features of AI video tools. You upload a still image — a photo, AI artwork, or drawing — and the AI brings it to life with natural motion.

### How It Works

1. Upload your image (PNG, JPG, or WEBP)
2. Write a prompt describing the motion you want
3. The AI analyzes the image and adds realistic movement
4. A short video is generated with your image animated

### What You Can Animate

**Portraits** — Add subtle head movements, blinking, and hair flow
**Landscapes** — Make clouds drift, water flow, trees sway
**Animals** — Add breathing, walking, or running motion
**Fantasy Art** — Bring dragons, magic spells, and mythical scenes to life
**Product Photos** — Show products rotating or in use

### Best Tools for Image-to-Video

| Tool | Best For |
|------|----------|
| Runway Gen-3 | Highest quality, most realistic motion |
| Pika | Fast results, fun effects |
| Kling AI | Motion Brush for selective animation |
| D-ID | Specifically for animating faces and portraits |

### Pro Tip
The quality of your input image directly affects the quality of your output video. Use high-resolution, well-composed images for best results.`,
        duration: 10, order: 7,
        tips: ['Use high-resolution images (1024x1024 or higher) for best results', 'Write prompts that describe the specific motion you want, not a new scene'],
        keyTakeaways: ['Image-to-Video animates still images with natural motion', 'Works with photos, AI art, drawings, and portraits', 'The better your input image, the better your output video'],
      },
      {
        title: 'Comparing the Top AI Video Tools',
        summary: 'Runway vs Pika vs Kling vs Luma Dream Machine — which one is right for you?',
        content: `## Comparing the Top AI Video Tools

| Tool | Best For | Key Feature | Price |
|------|----------|-------------|-------|
| **Runway Gen-3** | Professional cinematic quality | Industry-leading quality, 4K, Motion Control | Free (limited), Standard from $15/month |
| **Pika** | Fast, fun, beginner-friendly | Natural language, generates in under 30s | Free (limited), Pro from $10/month |
| **Kling AI** | Advanced control and audio | Motion Brush, storyboarding, native audio | Free (limited), Standard available |
| **Luma Dream Machine** | Spatial realism, 3D scenes | Strong spatial realism, 3D-like scenes | Free (limited) |

### Which One Should You Choose?

**Choose Runway Gen-3 if:** You want professional, cinematic quality for serious projects.

**Choose Pika if:** You are a beginner or want fast, fun results with minimal effort.

**Choose Kling AI if:** You need precise control over movement and want native audio.

**Choose Luma Dream Machine if:** You want 3D-like spatial scenes and realistic depth.`,
        duration: 16, order: 8,
        tips: ['Use Runway for final production, Pika for quick drafts', 'Each tool has unique strengths — use the right tool for each task'],
        keyTakeaways: ['Runway is best for professional quality', 'Pika is best for beginners and speed', 'Kling offers the most control with Motion Brush and audio'],
      },
      {
        title: 'Using AI Videos for Social Media and Marketing',
        summary: 'Learn how to create videos optimized for TikTok, Instagram Reels, YouTube Shorts, and other social platforms.',
        content: `## Using AI Videos for Social Media and Marketing

### Aspect Ratios by Platform

| Platform | Aspect Ratio | Orientation |
|----------|-------------|-------------|
| TikTok | 9:16 | Vertical |
| Instagram Reels | 9:16 | Vertical |
| YouTube Shorts | 9:16 | Vertical |
| YouTube Videos | 16:9 | Horizontal |
| Instagram Feed | 1:1 | Square |
| Facebook Feed | 16:9 or 1:1 | Horizontal or Square |

### Optimal Duration
- **TikTok**: 7-15 seconds (short), 30-60 seconds (long)
- **Reels**: 15-30 seconds
- **Shorts**: 15-60 seconds
- **YouTube**: 1-3 minutes for AI-generated content

### Tips for Social Media Success

1. **Hook in the first 2 seconds** — Start with the most visually striking moment
2. **Use trending styles** — Match your video style to current platform trends
3. **Add captions** — Most users watch without sound
4. **Test different aspect ratios** — 9:16 for vertical platforms, 16:9 for YouTube
5. **Keep it short** — Shorter videos have higher completion rates`,
        duration: 10, order: 9,
        tips: ['Always export in 9:16 aspect ratio for TikTok and Reels', 'Add captions to your videos for viewers watching without sound'],
        keyTakeaways: ['Different platforms require different aspect ratios', 'Shorter videos perform better on social media', 'The first 2 seconds are the most important for engagement'],
      },
      {
        title: 'Common Mistakes and How to Fix Them',
        summary: 'Why do videos look weird? Why is the motion unnatural? How to avoid common AI video pitfalls.',
        content: `## Common Mistakes and How to Fix Them

| Problem | Why It Happens | How to Fix |
|---------|---------------|------------|
| Motion is unnatural | No camera movement specified | Add camera keywords like "smooth pan" or "cinematic tracking" |
| Face warping | AI struggles with facial consistency | Use close-up shots, add "stable face" to prompt |
| Choppy animation | Too much happening in one clip | Simplify the scene — one subject, one action |
| Wrong style | Style not specified | Add style keywords: "cinematic", "cartoon", "realistic" |
| Subject disappears | Complex scene confuses the AI | Keep the subject centered and prominent |
| Video too short | Default duration is short | Use extend feature or specify desired length |

### Quick Fixes

- **Unnatural motion** → Add camera direction: "smooth dolly zoom, slow motion"
- **Warped faces** → Use "close-up, stable face, consistent character"
- **Choppy animation** → Keep it simple: one main subject with one clear action
- **Wrong feel** → Add style: "cinematic lighting, Hollywood production quality"
- **Subject lost** → "Center frame, subject prominently in focus"`,
        duration: 9, order: 10,
        tips: ['Always specify camera movement — static videos look unnatural', 'Keep scenes simple — one subject with one clear action works best'],
        keyTakeaways: ['Most video problems come from lack of camera direction', 'Simplify scenes for better results', 'Face warping needs close-up shots and stability keywords'],
      },
      {
        title: 'Ethical Use, Copyright, and Licensing',
        summary: 'Understand the legal side of AI-generated videos — can you use them commercially? What are the rules?',
        content: `## Ethical Use, Copyright, and Licensing

### Commercial Use
- AI-generated videos can generally be used commercially
- Check each tool's terms — most paid plans include commercial rights
- Free tiers often restrict commercial use

### Copyright Considerations
- AI-generated video copyright is complex and varies by jurisdiction
- Adding significant human editing strengthens any copyright claim
- Keep records of your generation process

### Ethical Guidelines
1. Do not generate misleading or deceptive videos
2. Do not create videos of real people without permission
3. Disclose AI-generated content when publishing
4. Do not use AI to create harmful or misleading content
5. Respect platform-specific AI content policies

### Platform Policies
- TikTok requires labeling AI-generated content
- YouTube requires disclosure for realistic AI content
- Instagram allows AI content with proper labeling`,
        duration: 8, order: 11,
        tips: ['Always disclose AI-generated video content on social platforms', 'Check platform-specific AI content policies before publishing'],
        keyTakeaways: ['AI videos can be used commercially with paid plans', 'Disclose AI-generated content on social platforms', 'Do not create misleading or deceptive AI videos'],
      },
      {
        title: 'Practice Exercises',
        summary: 'Hands-on exercises: generate a 10-second cinematic clip, animate a still image, create a TikTok-style video, and more.',
        content: `## Practice Exercises

### Exercise 1 – Your First AI Video
Create a 10-second video using Runway Gen-3: "A cinematic aerial shot of a lighthouse on a rocky cliff during a storm, dramatic waves crashing, moody lighting, 4K"

### Exercise 2 – Image-to-Video
Generate an AI image in your favorite tool, then animate it using Runway or Pika. Describe the motion you want to see.

### Exercise 3 – Social Media Video
Create a 9:16 vertical video for TikTok: "A time-lapse of a flower blooming in a sunlit garden, soft colors, peaceful mood, 15 seconds"

### Exercise 4 – Camera Movement Comparison
Generate the same scene with three different camera movements:
- Dolly zoom
- Slow pan
- Aerial tracking

Compare how each feels.

### Exercise 5 – Motion Brush (Kling)
Create an image with a static background and a moving element (like a waterfall or flag). Use Kling's Motion Brush to animate only that element.

### Course Summary
By the end of this module, you should be able to:
- Generate AI videos from text prompts and images
- Write effective video prompts
- Control camera movement and motion
- Use Image-to-Video to animate still images
- Create platform-optimized social media videos
- Understand licensing and ethical considerations`,
        duration: 6, order: 12,
        tips: ['Practice with different camera movements to understand their effect', 'Compare the same prompt across different tools to find your favorite'],
        keyTakeaways: ['Practice with different subjects, styles, and camera movements', 'Image-to-Video is a powerful technique for animating AI art', 'Each AI video tool has unique strengths worth exploring'],
      },
    ];

    const lessons5 = lessonData5.map(l => ({
      ...l,
      moduleId: modules[4]._id,
      published: true,
      isPublished: true,
      videoUrl: '',
    }));
    await Lesson.insertMany(lessons5);
    console.log(lessons5.length + ' lessons created for Module 5');

    await Quiz.create({
      moduleId: modules[4]._id,
      title: 'AI for Short Video Creation — Final Assessment',
      passingScore: 80,
      published: true,
      questions: [
        {
          question: 'Which AI video tool is known for its Motion Brush feature that lets you control which parts of an image move?',
          options: ['Runway Gen-3', 'Pika', 'Kling AI', 'Luma Dream Machine'],
          correct: 2,
        },
        {
          question: 'What is the FIRST thing you should include in a video prompt?',
          options: ['The camera movement', 'The main subject', 'The video duration', 'The color palette'],
          correct: 1,
        },
        {
          question: 'Which tool is known for being the most beginner-friendly and understanding natural language easily?',
          options: ['Runway Gen-3', 'Pika', 'Kling AI', 'All of the above'],
          correct: 1,
        },
        {
          question: 'What aspect ratio should you use for TikTok and Instagram Reels?',
          options: ['16:9', '1:1', '9:16', '4:3'],
          correct: 2,
        },
        {
          question: 'What does Image-to-Video allow you to do?',
          options: [
            'Turn a video into an image',
            'Upload a still image and turn it into an animated video',
            'Generate images from text',
            'Edit existing videos',
          ],
          correct: 1,
        },
      ],
    });
    console.log('Quiz created for Module 5');

    // ── Module 6: AI for Making Talking Avatars ────────────────────
    const lessonData6 = [
      {
        title: 'What Are AI Avatars and Talking Heads?',
        summary: 'Understand how AI tools create realistic digital people that can speak any text you type, with natural lip movements and expressions.',
        content: `## What Are AI Avatars and Talking Heads?

AI avatars are digital characters — realistic or stylized — that can speak any text you give them. They lip-sync perfectly to the audio, blink naturally, and show appropriate facial expressions.

The way it works is simple: you type a script, choose a voice, and the AI generates a video of a digital person speaking your words. The avatar's mouth movements are synchronized to every syllable, and the overall effect is remarkably natural.

You do not need a camera, a studio, actors, or any video production equipment. One person can create an entire video channel with AI avatars.`,
        duration: 8, order: 1,
        tips: ['Watch examples of different avatar styles to see what fits your brand', 'Start with ready-made avatars before trying custom photo avatars'],
        keyTakeaways: ['AI avatars are digital people that speak your text with lip-sync', 'No camera, studio, or actors needed', 'Avatars come in realistic and stylized styles'],
      },
      {
        title: 'Step-by-Step: Create Your First Avatar with HeyGen',
        summary: 'A complete walkthrough from signing up to generating your first talking avatar video using HeyGen.',
        content: `## Step-by-Step: Create Your First Avatar with HeyGen

### Step 1: Create an Account
Go to heygen.com and sign up for a free account. The free plan includes limited credits.

### Step 2: Choose Your Avatar
Click "Create Video" and browse the avatar library. HeyGen offers 100+ avatars in different styles:
- Professional presenters
- Casual personalities
- Diverse ethnicities and ages
- Different clothing styles

### Step 3: Write Your Script
Type or paste your script in the text box. Keep your sentences natural and conversational for best results.

### Step 4: Choose a Voice
Select from HeyGen's voice library:
- Male and female voices
- Different accents (American, British, Australian, etc.)
- Multiple languages (English, Spanish, French, German, Japanese, and more)

### Step 5: Customize Background
Choose a background:
- Solid colors
- Professional office settings
- Upload your own image or video background

### Step 6: Generate
Click "Submit" and wait 1-2 minutes. HeyGen processes your video.

### Step 7: Preview and Download
Watch your avatar video, make adjustments if needed, and download as MP4.`,
        duration: 16, order: 2,
        tips: ['Write scripts in a conversational tone for the most natural avatar delivery', 'Browse the avatar library before writing your script to match the avatar style'],
        keyTakeaways: ['HeyGen offers 100+ ready-made avatars in various styles', 'Scripts should be conversational for natural delivery', 'Generation takes 1-2 minutes for a complete avatar video'],
      },
      {
        title: 'Creating Professional Videos with Synthesia',
        summary: 'Learn how to use Synthesia, the enterprise-grade AI avatar platform used by Fortune 500 companies for training and corporate videos.',
        content: `## Creating Professional Videos with Synthesia

Synthesia is the leading enterprise AI avatar platform, trusted by companies like Amazon, Google, and Nestlé for their corporate video production.

### Key Features

**140+ Avatars** — The largest library of professional AI avatars, including diverse ethnicities, ages, and styles.

**120+ Languages** — Create videos in any major language with native accents.

**Professional Templates** — Start with pre-built templates for training, sales, marketing, and internal communications.

**Enterprise Security** — SSO, data encryption, and compliance with enterprise security standards.

### Creating a Video in Synthesia

1. Select a template or start from scratch
2. Choose your avatar from the library
3. Write or paste your script
4. Select a voice and language
5. Add slides, images, or screen recordings as visual aids
6. Generate and download

### Synthesia vs HeyGen
- Synthesia has more professional avatars and enterprise features
- HeyGen has more creative avatars and is easier for beginners
- Both support multiple languages and voice cloning
- Synthesia is better for corporate training; HeyGen is better for marketing`,
        duration: 14, order: 3,
        tips: ['Use Synthesia for professional corporate and training videos', 'Start with a template to save time on common video formats'],
        keyTakeaways: ['Synthesia is the enterprise standard for AI avatar videos', '140+ avatars and 120+ languages available', 'Professional templates make video creation fast and consistent'],
      },
      {
        title: 'Photo to Avatar: Bring Still Photos to Life with D-ID',
        summary: 'Discover how to upload a single photo of a person and make it talk, blink, and express emotions using D-ID.',
        content: `## Photo to Avatar: Bring Still Photos to Life with D-ID

D-ID specializes in face animation technology. You upload a single photo — real person or AI-generated — and the AI brings it to life.

### How It Works

1. Upload a photo of a person (face should be clearly visible)
2. Type or paste your script
3. Choose a voice
4. D-ID animates the face to speak your words

### What D-ID Can Do

**Realistic Animation** — Natural eye blinking, head movements, and lip-sync
**Emotional Expressions** — The avatar can show happiness, seriousness, or warmth
**Multiple Styles** — Realistic, cartoon, and painting-style avatars
**Background Support** — Add custom backgrounds or keep the original photo background

### Best Uses for D-ID
- Turning a profile photo into a greeting video
- Animating historical photos for educational content
- Creating personalized video messages
- Bringing AI-generated character art to life

### Requirements for Best Results
- Front-facing or near-front-facing photo
- Good lighting on the face
- High resolution (at least 512x512)
- No obstructions (glasses are OK, but avoid masks)`,
        duration: 12, order: 4,
        tips: ['Use a high-quality front-facing photo for the best animation results', 'D-ID works with both real photos and AI-generated portraits'],
        keyTakeaways: ['D-ID animates any photo into a talking avatar', 'Natural eye blinking, head movement, and emotional expressions', 'Great for personalized video messages and educational content'],
      },
      {
        title: 'Voice Cloning: Make Your Avatar Sound Like You',
        summary: 'Learn how to clone your own voice or any voice using just 1 minute of audio, and make your avatar speak in that voice.',
        content: `## Voice Cloning: Make Your Avatar Sound Like You

Voice cloning lets you use any voice for your avatar — your own voice, a custom voice, or a professional voice actor.

### How to Clone a Voice with ElevenLabs

1. Record 1-2 minutes of clear, clean audio
2. Upload to ElevenLabs
3. AI analyzes the voice characteristics
4. A digital voice clone is created in minutes
5. Use this voice with your avatar in HeyGen or Synthesia

### Tips for Recording Voice Samples

- Record in a quiet room with no background noise
- Use a good microphone if possible
- Speak naturally — do not force your voice
- Include different tones and emotions
- Read a script with varied content

### Supported Voices

**HeyGen** — Built-in voice cloning, supports multiple languages
**ElevenLabs** — Industry-leading voice cloning quality
**Synthesia** — Professional voice cloning for enterprise
**D-ID** — Voice cloning with face animation

### Voice Cloning Ethics
- Only clone voices with permission
- Do not use voice cloning to impersonate without consent
- Disclose when using a cloned voice`,
        duration: 13, order: 5,
        tips: ['Record your voice sample in the quietest environment possible for best quality', 'Only clone voices with explicit permission from the owner'],
        keyTakeaways: ['Voice cloning needs just 1-2 minutes of clear audio', 'Cloned voices can be used with any avatar tool', 'Always get permission before cloning someone\'s voice'],
      },
      {
        title: 'Translating Videos into Multiple Languages',
        summary: 'Discover how to take one video and translate it into 10+ languages with perfect lip-sync, reaching a global audience.',
        content: `## Translating Videos into Multiple Languages

One of the most powerful features of AI avatar tools is video translation — taking a single video and generating versions in multiple languages with perfect lip-sync.

### How Video Translation Works

1. Create your original video in your primary language
2. Select the languages you want to translate into
3. AI translates the script
4. AI adjusts the avatar's lip movements to match the new language
5. AI generates voices in each target language
6. Download each translated version

### Languages Supported

| Tool | Languages Supported |
|------|-------------------|
| HeyGen | 30+ languages |
| Synthesia | 120+ languages |
| D-ID | 20+ languages |

### Best Uses for Video Translation
- YouTube content for global audiences
- Corporate training in multiple languages
- Marketing videos for international markets
- Educational content for diverse students
- Customer support videos

### Pro Tips
- Review translated scripts for cultural appropriateness
- Some languages may need manual script adjustments
- Keep original video backgrounds simple for best translation results`,
        duration: 10, order: 6,
        tips: ['Start with the most common languages for your target audience', 'Review translated scripts for cultural nuance before generating'],
        keyTakeaways: ['AI video translation creates lip-synced versions in multiple languages', 'Synthesia supports 120+ languages for translation', 'Perfect for reaching global audiences with a single video production'],
      },
      {
        title: 'Comparing the Top AI Avatar Tools',
        summary: 'HeyGen vs Synthesia vs D-ID vs ElevenLabs — which one is right for you?',
        content: `## Comparing the Top AI Avatar Tools

| Tool | Best For | Key Feature | Price |
|------|----------|-------------|-------|
| **HeyGen** | Ease of use and beginners | 100+ avatars, voice cloning, video translation | Free (limited), Pro from $29/month |
| **Synthesia** | Enterprise, professional | 140+ avatars, 120+ languages, templates | Starts at $30/month (annual) |
| **D-ID** | Photo to avatar | Upload any photo and make it talk | Free (limited), Pro from $10/month |
| **ElevenLabs** | Voice cloning, text-to-speech | Clone voice with 1 min of audio, 30+ languages | Free (limited), Pro from $5/month |

### Which One Should You Choose?

**Choose HeyGen if:** You are a beginner or want the easiest, most versatile avatar tool.

**Choose Synthesia if:** You need professional corporate videos with enterprise features.

**Choose D-ID if:** You want to animate a specific photo into a talking avatar.

**Choose ElevenLabs if:** You need the highest quality voice cloning and text-to-speech.`,
        duration: 15, order: 7,
        tips: ['Use HeyGen for general avatar creation, Synthesia for corporate', 'Combine multiple tools — use ElevenLabs for voice, HeyGen for avatar'],
        keyTakeaways: ['HeyGen is best for beginners and versatility', 'Synthesia is the enterprise standard', 'D-ID specializes in photo-to-avatar animation'],
      },
      {
        title: 'Using Avatars for Training, YouTube, and Marketing',
        summary: 'Learn how to use AI avatars for corporate training videos, YouTube explainers, product demos, and marketing campaigns.',
        content: `## Using Avatars for Training, YouTube, and Marketing

### Corporate Training
AI avatars excel at training videos:
- Consistent delivery every time
- Easy to update content
- Available in multiple languages
- No need to schedule actors or presenters

### YouTube Content
Avatars work great for:
- Educational explainers
- News and commentary channels
- Product reviews
- Channel updates and announcements

### Marketing Videos
AI avatars can create:
- Product demos and tutorials
- Testimonial-style videos
- Social media ads
- Email marketing videos
- Landing page videos

### Best Practices

1. Match the avatar style to your brand personality
2. Keep scripts conversational — avatars sound best when speaking naturally
3. Use visual aids (slides, images, screen recordings) alongside the avatar
4. Add captions for viewers watching without sound
5. Test different avatars to find the best fit for your content`,
        duration: 10, order: 8,
        tips: ['Match your avatar\'s appearance and style to your brand identity', 'Test multiple avatars with the same script to find the best fit'],
        keyTakeaways: ['AI avatars work for training, YouTube, and marketing', 'Consistent delivery and easy updates make avatars ideal for training', 'Match avatar style to your brand for authentic-looking content'],
      },
      {
        title: 'Common Mistakes and How to Fix Them',
        summary: 'Why does the avatar look weird? Why is the lip-sync off? How to get natural, realistic results.',
        content: `## Common Mistakes and How to Fix Them

| Problem | Why It Happens | How to Fix |
|---------|---------------|------------|
| Avatar looks stiff | Default expression settings | Add "natural expressions" or use emotional tone settings |
| Lip-sync is off | Complex words or fast speech | Simplify script, speak slower, avoid tongue twisters |
| Voice sounds robotic | Low-quality text-to-speech | Upgrade to premium voice, use voice cloning |
| Wrong facial expressions | No emotional direction in script | Add tone indicators: "(happy)", "(serious)", "(warm)" |
| Avatar blinks too much | Default animation settings | Reduce blink frequency in advanced settings |
| Background looks fake | Default AI background | Upload custom background image or video |

### Quick Fixes

- **Stiff avatar** → Enable "natural gestures" and "automatic expressions"  
- **Bad lip-sync** → Shorten sentences, use simpler words  
- **Robotic voice** → Use premium voices or voice cloning  
- **Wrong tone** → Add emotional cues to your script  
- **Fake background** → Upload a real photo or video as background`,
        duration: 9, order: 9,
        tips: ['Watch your avatar video on mute first — the visual quality should be good even without audio', 'Add emotional cues in your script for more natural expressions'],
        keyTakeaways: ['Most avatar problems are fixable with simple adjustments', 'Premium voices and cloning produce the most natural results', 'Custom backgrounds look much more professional than defaults'],
      },
      {
        title: 'Ethical Use, Deepfakes, and Trust',
        summary: 'Understand the ethical rules of using AI avatars — how to avoid misuse, disclose AI-generated content, and build trust.',
        content: `## Ethical Use, Deepfakes, and Trust

### The Most Important Rule
**Always disclose when content is AI-generated.** Transparency builds trust with your audience and protects you legally.

### What to Avoid
- Creating avatars of real people without permission
- Using avatars to deceive or impersonate
- Creating misleading political or news content
- Generating harmful or inappropriate avatar content

### Deepfake Risks
AI avatars can be used to create deepfakes — realistic videos of people saying things they never said. Always:
- Never create deepfakes without explicit consent
- Report deepfake content when you see it
- Use watermarks to identify AI-generated content
- Educate your audience about AI content

### Building Trust
1. Label AI-generated videos clearly
2. Be transparent about your production process
3. Use AI avatars ethically and responsibly
4. Encourage questions about your content creation
5. Follow platform-specific AI content guidelines

### Platform Policies
- YouTube: Must label realistic AI content
- TikTok: AI-generated content must be labeled
- Instagram: AI labels required for certain content`,
        duration: 10, order: 10,
        tips: ['Add a clear disclosure like "This video features an AI avatar" in your video description', 'Never create avatar videos of real people without their written permission'],
        keyTakeaways: ['Always disclose AI-generated avatar content', 'Never create avatars of real people without permission', 'Transparency builds trust and protects you legally'],
      },
      {
        title: 'Practice Exercises',
        summary: 'Hands-on exercises: create a talking avatar with your script, clone your voice, translate a video into another language, and more.',
        content: `## Practice Exercises

### Exercise 1 – Your First Avatar
Create a 30-second avatar video using HeyGen introducing yourself. Write a natural script and choose an appropriate avatar style.

### Exercise 2 – Voice Cloning
Record 2 minutes of your voice reading a script. Clone it using ElevenLabs and use it with an avatar in HeyGen.

### Exercise 3 – Video Translation
Take the avatar video from Exercise 1 and translate it into 2 other languages using HeyGen's video translation feature.

### Exercise 4 – Photo to Avatar
Find or generate a photo and animate it using D-ID. Write a short script that the photo-avatar will speak.

### Exercise 5 – Full Production
Create a complete 1-minute promotional video using an AI avatar:
1. Write a script for a product or idea
2. Choose or create the right avatar
3. Add background and visual elements
4. Generate and download the final video

### Course Summary
By the end of this module, you should be able to:
- Create talking avatar videos with HeyGen, Synthesia, and D-ID
- Clone voices for custom avatar speech
- Translate avatar videos into multiple languages
- Use avatars for training, YouTube, and marketing
- Understand ethical guidelines for AI avatars`,
        duration: 6, order: 11,
        tips: ['Practice with different avatar styles to find what looks most natural', 'Combine voice cloning with avatars for the most personalized results'],
        keyTakeaways: ['Create avatars with multiple tools to understand their differences', 'Voice cloning makes avatars sound more authentic', 'Practice with translation to reach global audiences'],
      },
    ];

    const lessons6 = lessonData6.map(l => ({
      ...l,
      moduleId: modules[5]._id,
      published: true,
      isPublished: true,
      videoUrl: '',
    }));
    await Lesson.insertMany(lessons6);
    console.log(lessons6.length + ' lessons created for Module 6');

    await Quiz.create({
      moduleId: modules[5]._id,
      title: 'AI for Making Talking Avatars — Final Assessment',
      passingScore: 80,
      published: true,
      questions: [
        {
          question: 'Which AI avatar tool is known for being the easiest and most beginner-friendly?',
          options: ['Synthesia', 'HeyGen', 'D-ID', 'ElevenLabs'],
          correct: 1,
        },
        {
          question: 'What does D-ID allow you to do that other avatar tools specialize in?',
          options: [
            'Create 3D avatars from scratch',
            'Make a single photo of a person talk and express emotions',
            'Clone voices',
            'Translate videos into 50 languages',
          ],
          correct: 1,
        },
        {
          question: 'What do you need to clone a voice with ElevenLabs?',
          options: [
            'A full song recording',
            'Just 1-2 minutes of clear audio',
            'A video of the person talking',
            'A written script',
          ],
          correct: 1,
        },
        {
          question: 'Which tool is used by Fortune 500 companies for professional training videos?',
          options: ['HeyGen', 'D-ID', 'Synthesia', 'Runway'],
          correct: 2,
        },
        {
          question: 'What is the MOST important ethical rule when using AI avatars?',
          options: [
            'Always use a paid tool',
            'Disclose that the content is AI-generated',
            'Only use avatars for personal use',
            'Never use voice cloning',
          ],
          correct: 1,
        },
      ],
    });
    console.log('Quiz created for Module 6');

    // ── Module 8: AI for Lyrics, Poems & Scriptwriting ────────────
    const lessonData8 = [
      {
        title: 'What Is AI Creative Writing?',
        summary: 'Understand how AI tools can help you write lyrics, poems, and scripts — from generating ideas to polishing your final words.',
        content: `## What Is AI Creative Writing?

AI creative writing is the process of using artificial intelligence to help you write song lyrics, poems, video scripts, and other creative content. Instead of starting with a blank page, you give the AI a topic, style, or structure, and it generates text that you can use, edit, and build upon.

These AI writing models are trained on millions of examples of creative writing — songs, poems, scripts, novels, and more. They learn the patterns of language: how verses flow into choruses, how rhyme schemes work, how dialogue sounds natural, and how stories build tension.

The best part is you don't need to be a professional writer. The AI handles the hard part of generating ideas and drafting text. Your job is to guide it and polish the results.`,
        duration: 8, order: 1,
        tips: ['Start by telling the AI exactly what you want — genre, topic, mood, and structure', 'Think of AI as a co-writer, not a replacement'],
        keyTakeaways: ['AI creative writing generates lyrics, poems, and scripts from your descriptions', 'No professional writing experience needed', 'AI is a co-writer — you guide and polish the output'],
      },
      {
        title: 'Step-by-Step: Write Your First Song Lyric with ChatGPT',
        summary: 'A complete walkthrough from signing up to generating your first set of song lyrics using ChatGPT.',
        content: `## Step-by-Step: Write Your First Song Lyric with ChatGPT

### Step 1: Create an Account
Go to chat.openai.com and sign up for a free account. The free version includes GPT-3.5 or GPT-4o mini.

### Step 2: Write Your First Prompt
Type a clear prompt describing what you want. The more specific, the better.

Example prompt: "Write a pop song about summer love. Include two verses, a chorus, and a bridge. Make it upbeat and catchy."

### Step 3: Review the Output
ChatGPT will generate lyrics following your structure. Read through them and note:
- Does the rhythm feel right?
- Are the rhymes natural?
- Does the mood match your intent?

### Step 4: Refine with Feedback
Give ChatGPT specific feedback to improve the lyrics:

❌ "Make it better"
✅ "Make the chorus more energetic and repeat the title phrase three times"

### Step 5: Iterate
Keep refining until you are happy with the result. Each iteration should change one or two things.

### Step 6: Save and Use
Copy your final lyrics into a document. You can now use them with Suno or Udio to generate the actual song.`,
        duration: 14, order: 2,
        tips: ['Write specific prompts — "pop song about summer love" is better than "write a song"', 'Iterate with specific feedback rather than starting over'],
        keyTakeaways: ['ChatGPT writes lyrics from clear, specific prompts', 'Refine through iteration with targeted feedback', 'Final lyrics can be used with AI music tools to create the actual song'],
      },
      {
        title: 'Structuring Songs: Verses, Choruses, and Bridges',
        summary: 'Learn the classic song structure and how to use AI to build songs that flow naturally from verse to chorus to bridge.',
        content: `## Structuring Songs: Verses, Choruses, and Bridges

Most successful songs follow a proven structure. Here is the classic format.

### The Standard Song Structure

**Verse 1** — Sets up the story, introduces characters and setting (4-8 lines)
**Chorus** — The main hook, repeated multiple times (4-8 lines)
**Verse 2** — Continues or develops the story
**Chorus** — Repeat, often with more energy
**Bridge** — A change in perspective or musical departure (4-8 lines)
**Chorus** — Final repeat, often with added intensity

### How to Prompt AI for Structure

Tell the AI exactly which structure you want:

"Write a pop song about overcoming challenges. Use this structure: Verse 1 (4 lines), Chorus (4 lines), Verse 2 (4 lines), Chorus (4 lines), Bridge (4 lines), Chorus (4 lines). Make the chorus powerful and uplifting."

### Variation: Simple Structure (for beginners)

Verse → Chorus → Verse → Chorus → Chorus

This works great for short songs, TikTok clips, and simple pop tunes.

### Pro Tips
- Verses should tell a story or build a scene
- The chorus should be memorable and repeatable
- The bridge should feel different from verses and chorus
- Each verse can advance the story or explore a different angle`,
        duration: 12, order: 3,
        tips: ['Use the standard structure for your first few songs before experimenting', 'The chorus is the most important part — spend the most time on it'],
        keyTakeaways: ['Classic structure: Verse 1 → Chorus → Verse 2 → Chorus → Bridge → Chorus', 'Verses tell the story, chorus delivers the hook', 'Tell the AI the exact structure you want in your prompt'],
      },
      {
        title: 'Finding Rhymes and Overcoming Writer\'s Block',
        summary: 'Discover how AI rhyming tools and thesauruses can help you find the perfect word every time and never get stuck again.',
        content: `## Finding Rhymes and Overcoming Writer's Block

Even professional songwriters get stuck. Here is how AI helps you keep moving.

### AI Rhyming Tools

**MasterWriter** — The industry standard for professional songwriters. Includes:
- Rhyming dictionary (perfect, near, and multi-syllable rhymes)
- Thesaurus with songwriting-focused synonyms
- Phrase and idiom finder
- Song structure templates

**RhymeZone** — Free tool for quick rhyme lookups
**AI Chat (ChatGPT, Claude)** — Ask for rhymes in context: "Give me 10 words that rhyme with 'forever' that would work in a love song"

### Beating Writer's Block with AI

When you are stuck, try these AI prompts:

- "Suggest 5 different directions for the second verse of this song about heartbreak"
- "Give me 3 alternative lines for 'I miss you every day' that sound more creative"
- "Write a bridge that changes the mood from sad to hopeful"

### The Golden Rule
If you are stuck on one line, ask the AI for 5 alternatives. One of them will almost certainly spark something.`,
        duration: 10, order: 4,
        tips: ['When stuck, ask AI for alternatives rather than trying to force one line', 'Bookmark RhymeZone for quick free rhyme lookups'],
        keyTakeaways: ['MasterWriter is the professional standard for rhyming and songwriting tools', 'AI can suggest alternative lines when you are stuck', 'Ask for multiple options and pick the best one'],
      },
      {
        title: 'Writing in Different Styles: Rap, Pop, Poetry, and More',
        summary: 'Learn how to adapt your writing to any genre — from Shakespearean sonnets to modern rap verses — using simple prompts.',
        content: `## Writing in Different Styles: Rap, Pop, Poetry, and More

One of AI's superpowers is adapting to any writing style. Here is how to switch genres.

### Style Prompt Examples

| Style | Prompt |
|-------|--------|
| Pop | "Write an upbeat pop chorus about Friday night freedom" |
| Rap | "Write a rap verse with a strong 4/4 rhythm about rising from hardship" |
| Poetry | "Write a sonnet about autumn leaves, use Shakespearean rhyme scheme" |
| Country | "Write a country song about a truck, a dog, and a broken heart" |
| R&B | "Write a smooth R&B verse about late-night conversations" |
| Rock | "Write an anthemic rock chorus about standing up for what you believe" |

### What to Specify in Your Prompt

1. **Genre** — Pop, rap, country, R&B, rock, folk, etc.
2. **Mood** — Upbeat, melancholic, angry, romantic
3. **Perspective** — First person, second person, storytelling
4. **Rhyme style** — Simple AABB, complex ABAB, or free verse
5. **Vocabulary level** — Simple and accessible, or poetic and complex

### Example: Same Topic, Different Styles

Topic: "Morning"

**Pop:** "Waking up to golden light / Everything is gonna be alright"
**Rap:** "Sunrise creeping through the blinds I'm on my grind / Another day another dollar gotta get mine"
**Poetry:** "The dawn doth break with gentle hand / And paints her colors o'er the land"`,
        duration: 11, order: 5,
        tips: ['Study the lyrics of your favorite genre to understand what makes them work', 'Tell the AI the genre, mood, and perspective for best results'],
        keyTakeaways: ['AI can write in any genre with the right prompt', 'Specify genre, mood, perspective, and rhyme style', 'The same topic sounds completely different across genres'],
      },
      {
        title: 'Writing Video Scripts with Camera Directions',
        summary: 'Discover how to write full video scripts that include camera angles, scene descriptions, and dialogue — perfect for YouTube, TikTok, and commercials.',
        content: `## Writing Video Scripts with Camera Directions

A great video script includes not just what people say, but what the audience sees.

### Standard Video Script Format

**Scene 1 — INT. COFFEE SHOP — MORNING**

[Camera: Wide shot of a cozy coffee shop. Slow pan across the room]

**NARRATOR (V.O.)**
Every great idea starts with a single step.

[Camera: Close-up of a hand picking up a coffee cup]

**NARRATOR (V.O.)**
But taking that step is the hardest part.

### Key Elements

1. **Scene heading** — Location and time of day
2. **Camera direction** — Shot type and movement (in brackets)
3. **Dialogue** — Character name and what they say
4. **Visual description** — What happens on screen (in brackets)

### Prompting AI for Scripts

"Write a 60-second video script for a product launch. Include:
- 3 scenes
- Camera directions (close-up, wide shot, tracking shot)
- Voiceover narration
- A clear call to action at the end"

### Types of Scripts You Can Create
- YouTube video scripts
- TikTok/Reels scripts
- Commercials and ads
- Explainer videos
- Tutorial scripts`,
        duration: 13, order: 6,
        tips: ['Use brackets for camera directions — it makes scripts easy to read', 'Write visually — describe what the audience will SEE, not just hear'],
        keyTakeaways: ['Video scripts need camera directions and scene descriptions, not just dialogue', 'Format: Scene heading, Camera direction, Dialogue', 'AI can generate complete script drafts from a simple prompt'],
      },
      {
        title: 'Turning Long Content into Short Punchy Scripts',
        summary: 'Learn how to take a long blog post, article, or report and turn it into a short, engaging video or podcast script using AI.',
        content: `## Turning Long Content into Short Punchy Scripts

One of the most valuable AI writing skills is condensing long content into short, engaging scripts.

### The Process

1. **Paste your long content** into ChatGPT or Claude
2. **Ask for a summary**: "Summarize this 2000-word article into 5 key points"
3. **Turn it into a script**: "Turn these 5 points into a 60-second video script with an engaging hook and call to action"
4. **Refine**: Shorten sentences, add energy, make it conversational

### Sample Prompt

"I have a 3000-word blog post about productivity. Turn it into a 90-second YouTube script. Use:
- A hook in the first 5 seconds
- 3 main tips explained quickly
- A call to action at the end
- Conversational tone"

### What Makes a Good Short Script

- **Hook** — First 5 seconds must grab attention
- **Simple language** — Short sentences, everyday words
- **One main idea** — Don't try to cover everything
- **Clear structure** — Problem → Solution → Result
- **Call to action** — Tell viewers what to do next

### Example Lengths
- TikTok/Reels: 15-30 seconds (40-80 words)
- YouTube Shorts: 30-60 seconds (80-160 words)
- YouTube video: 3-10 minutes (500-2000 words)
- Podcast intro: 30-60 seconds`,
        duration: 10, order: 7,
        tips: ['The hook is everything — spend 30% of your time on the first 5 seconds', 'Short scripts need shorter sentences — aim for 10-15 words per sentence'],
        keyTakeaways: ['AI can condense long content into short engaging scripts', 'Follow the process: summarize → script → refine', 'Short scripts need a hook, simple language, and clear structure'],
      },
      {
        title: 'Comparing the Top AI Writing Tools',
        summary: 'ChatGPT vs Claude vs MasterWriter vs Jasper — which one is right for you?',
        content: `## Comparing the Top AI Writing Tools

| Tool | Best For | Key Feature | Price |
|------|----------|-------------|-------|
| **ChatGPT** | General writing, brainstorming | Versatile, natural language, all types of writing | Free (limited), Plus $20/month |
| **Claude** | Creative writing, long-form | Excellent creative writing, long context, human-like tone | Free (limited), Pro $20/month |
| **MasterWriter** | Professional songwriting | Rhyming dictionary, thesaurus, song templates | Starts at $79/year |
| **Jasper** | Marketing copy, commercial | Templates for ads, blogs, social media | Starts at $39/month |

### Which One Should You Choose?

**Choose ChatGPT if:** You want a versatile all-rounder for all types of writing.

**Choose Claude if:** You want the best creative writing quality, especially for longer pieces.

**Choose MasterWriter if:** You are a serious songwriter who needs professional rhyming tools.

**Choose Jasper if:** You need marketing copy and commercial writing templates.`,
        duration: 14, order: 8,
        tips: ['ChatGPT and Claude are great free starting points', 'MasterWriter is worth the investment if you write songs regularly'],
        keyTakeaways: ['ChatGPT is the best all-rounder', 'Claude excels at creative writing', 'MasterWriter is designed specifically for songwriters'],
      },
      {
        title: 'Common Mistakes and How to Fix Them',
        summary: 'Why do AI lyrics sound cheesy? Why is the script boring? How to fix common writing problems.',
        content: `## Common Mistakes and How to Fix Them

| Problem | Why It Happens | How to Fix |
|---------|---------------|------------|
| Lyrics sound cheesy | AI defaults to generic romantic phrases | Add "avoid clichés, be original and specific" to your prompt |
| Rhymes feel forced | AI prioritizes rhyme over meaning | Ask for natural rhymes: "rhyme should feel effortless" |
| Script is boring | No structure or hook | Start with a hook, follow problem → solution → result |
| Too wordy | AI tends to be verbose | Specify "short sentences, conversational tone, under 30 seconds" |
| Wrong tone | No tone specified | Add tone: "professional", "funny", "serious", "inspirational" |
| No emotional impact | AI writes flat text | Ask for "emotional, powerful, moving language with vivid imagery" |

### Quick Fixes

- **Cheesy lyrics** → "Avoid clichés, be original and specific"
- **Forced rhymes** → "Natural rhymes that don't sacrifice meaning"
- **Boring script** → "Start with a strong hook that grabs attention"
- **Too long** → "Shorten to 45 seconds, cut unnecessary words"
- **Wrong tone** → "Rewrite this in [professional/funny/serious] tone"
- **Flat writing** → "Make this more emotional with vivid imagery and strong verbs"`,
        duration: 9, order: 9,
        tips: ['Add style instructions at the end of your prompt: "avoid clichés, be original"', 'Read AI writing aloud — if it sounds awkward spoken, it needs editing'],
        keyTakeaways: ['Most writing problems are fixed by adding specific style instructions', 'Cheesy lyrics come from generic prompts — be specific', 'Read AI output aloud to catch awkward phrasing'],
      },
      {
        title: 'Ethical Use: Plagiarism, Copyright, and Originality',
        summary: 'Understand the legal and ethical rules of using AI for writing — can you copyright AI-generated lyrics? How to avoid plagiarism.',
        content: `## Ethical Use: Plagiarism, Copyright, and Originality

### Copyright Rules
- AI-generated text generally cannot be copyrighted (no human authorship)
- If you significantly edit and transform AI output, you may have a copyright claim
- The more human creative input you add, the stronger your claim

### Avoiding Plagiarism
- AI can sometimes reproduce phrases from its training data
- Always check AI output for accidental similarity to existing works
- Use plagiarism checkers for important work
- Treat AI output as a first draft, not a final product

### Best Practices
1. Always edit and personalize AI-generated content
2. Add your own creative voice and perspective
3. Check for accidental plagiarism
4. Be transparent about AI use in professional writing
5. Keep records of your editing process

### What to Avoid
- Copying AI output word-for-word and claiming it as entirely your own
- Publishing AI content without review
- Using AI to create misleading or deceptive content
- Violating platform terms of service about AI content`,
        duration: 8, order: 10,
        tips: ['Treat AI as a brainstorming partner, not a ghostwriter', 'Always add significant human editing before publishing'],
        keyTakeaways: ['AI-generated text may not be copyrightable — human editing is essential', 'Always check AI output for plagiarism', 'Be transparent about AI use in professional writing'],
      },
      {
        title: 'Practice Exercises',
        summary: 'Hands-on exercises: write a pop song, create a rap verse, write a 60-second video script, and turn a blog post into a script.',
        content: `## Practice Exercises

### Exercise 1 – Pop Song
Write a complete pop song with ChatGPT. Use the structure: Verse 1 → Chorus → Verse 2 → Chorus → Bridge → Chorus. Topic: "new beginnings."

### Exercise 2 – Rap Verse
Write a rap verse with a strong rhythm. Topic: "overcoming obstacles." Use an AABB rhyme scheme.

### Exercise 3 – Video Script
Write a 60-second video script for a product you love. Include camera directions, voiceover, and a call to action.

### Exercise 4 – Long to Short
Find a 1000+ word blog post. Use AI to condense it into a 60-second video script with a hook and CTA.

### Exercise 5 – Style Comparison
Write the same topic in 3 different styles:
- Pop song lyrics
- Rap verse
- Shakespearean sonnet

Compare how the same idea sounds in different formats.

### Course Summary
By the end of this module, you should be able to:
- Write song lyrics in multiple genres using AI
- Structure songs with verses, choruses, and bridges
- Create video scripts with camera directions
- Condense long content into short scripts
- Choose the right AI writing tool for each task`,
        duration: 6, order: 11,
        tips: ['Practice writing the same topic in different styles', 'Save your best prompts for reuse'],
        keyTakeaways: ['Practice with different styles and formats', 'AI is a tool that amplifies your creativity', 'Editing and refining AI output is where the real skill develops'],
      },
    ];

    const lessons8 = lessonData8.map(l => ({
      ...l,
      moduleId: modules[7]._id,
      published: true,
      isPublished: true,
      videoUrl: '',
    }));
    await Lesson.insertMany(lessons8);
    console.log(lessons8.length + ' lessons created for Module 8');

    await Quiz.create({
      moduleId: modules[7]._id,
      title: 'AI for Lyrics, Poems & Scriptwriting — Final Assessment',
      passingScore: 80,
      published: true,
      questions: [
        {
          question: 'What is the FIRST thing you should tell the AI when writing a song?',
          options: ['The title of the song', 'The genre and topic (e.g., pop song about love)', 'The rhyming scheme', 'The length of the song'],
          correct: 1,
        },
        {
          question: 'What is the correct structure of a classic song?',
          options: ['Chorus → Verse → Chorus → Bridge', 'Verse 1 → Chorus → Verse 2 → Chorus → Bridge → Chorus', 'Bridge → Verse → Chorus → Verse', 'Chorus → Bridge → Verse → Chorus'],
          correct: 1,
        },
        {
          question: 'Which tool is known for being the BEST for songwriters with its rhyming dictionary and thesaurus?',
          options: ['ChatGPT', 'MasterWriter', 'Claude', 'Jasper'],
          correct: 1,
        },
        {
          question: 'What should a video script include besides dialogue?',
          options: ['Only the dialogue', 'Camera directions and scene descriptions', "The actor's name", 'The budget'],
          correct: 1,
        },
        {
          question: 'What is the MOST important ethical rule when using AI for writing?',
          options: ['Always use a paid tool', 'Always edit and review AI-generated content before using it', 'Only write poems with AI', 'Never share what you write'],
          correct: 1,
        },
      ],
    });
    console.log('Quiz created for Module 8');

    // ── Module 9: AI for Voice Cloning & Podcasting ───────────────
    const lessonData9 = [
      {
        title: 'What Is AI Voice Cloning and Podcast Enhancement?',
        summary: 'Understand how AI tools can copy any voice using just a short audio sample, and how they can clean up recordings to make them sound professional.',
        content: `## What Is AI Voice Cloning and Podcast Enhancement?

AI voice cloning is the process of creating a digital copy of a human voice using a short audio sample. With just 1-2 minutes of recording, AI can analyze the unique characteristics of a voice — pitch, tone, rhythm, and accent — and generate new speech that sounds exactly like that person.

Podcast enhancement is the process of using AI to clean up audio recordings. Tools like Adobe Podcast Enhance Speech can remove background noise, echo, and microphone artifacts, turning recordings made on a laptop or phone into studio-quality audio.

Together, these technologies let you create professional audio content without a studio, expensive microphones, or audio engineering skills.`,
        duration: 8, order: 1,
        tips: ['Record your voice sample in the quietest room possible for best cloning results', 'Compare a raw phone recording with the enhanced version to hear the power of AI'],
        keyTakeaways: ['AI voice cloning creates a digital copy of a voice from 1-2 minutes of audio', 'AI podcast enhancement removes noise and echo from any recording', 'No studio or audio engineering experience needed'],
      },
      {
        title: 'Step-by-Step: Clone Your Own Voice with ElevenLabs',
        summary: 'A complete walkthrough from recording your voice sample to generating new speech in your cloned voice using ElevenLabs.',
        content: `## Step-by-Step: Clone Your Own Voice with ElevenLabs

### Step 1: Create an Account
Go to elevenlabs.io and create a free account. The free plan gives you limited characters per month.

### Step 2: Record Your Voice Sample
Record 1-2 minutes of clear audio. Read a script with varied content — different emotions, sentence lengths, and topics.

### Step 3: Upload to ElevenLabs
Go to Voice Lab → Add Voice → Instant Voice Cloning. Upload your audio file.

### Step 4: Name Your Voice
Give your cloned voice a name so you can find it later.

### Step 5: Wait for Processing
ElevenLabs analyzes your voice. This takes 1-2 minutes.

### Step 6: Generate Speech
Type a script and select your cloned voice from the dropdown. Click Generate.

### Step 7: Adjust Settings
Fine-tune your voice with two key settings:
- **Stability** — Lower = more emotional variation, Higher = more consistent
- **Clarity + Similarity** — Higher = more like original, but may add artifacts

### Step 8: Download
Download your generated audio as MP3 or WAV.`,
        duration: 16, order: 2,
        tips: ['Record your sample with a good microphone if possible — quality in = quality out', 'Use moderate stability (50-70%) for the most natural-sounding speech'],
        keyTakeaways: ['ElevenLabs clones a voice from 1-2 minutes of audio', 'Stability and Clarity settings control naturalness and accuracy', 'Generate unlimited speech in your cloned voice'],
      },
      {
        title: 'Fixing Bad Audio: Adobe Podcast Enhance Speech',
        summary: "Learn how to use Adobe's free Enhance Speech tool to remove background noise, echo, and microphone artifacts from any voice recording.",
        content: `## Fixing Bad Audio: Adobe Podcast Enhance Speech

Adobe Podcast Enhance Speech is a free AI tool that transforms poor-quality voice recordings into clear, professional audio.

### What It Fixes
- Background noise (fans, AC, traffic, room hum)
- Echo and reverb (bathroom or empty room sound)
- Plosives ("P" and "B" pops from close mic use)
- Sibilance (harsh "S" sounds)
- Volume inconsistency (quiet and loud sections)
- Microphone artifacts (built-in laptop mic quality)

### How to Use It
1. Go to podcast.adobe.com/enhance
2. Upload your audio file (MP3, WAV, M4A, AAC)
3. AI processes the file automatically (takes 1-3x the file length)
4. Preview the enhanced version
5. Download the cleaned audio

### Best Results
- Voice-only recordings work best
- Files under 1 hour recommended
- Completely free — no Adobe account required`,
        duration: 12, order: 3,
        tips: ['Always run voice recordings through Adobe Podcast Enhance Speech — it is free and excellent', 'For best results, record in the quietest room available'],
        keyTakeaways: ['Adobe Podcast Enhance Speech is a free tool that removes noise and echo', 'Works best on voice-only recordings', 'No account required — completely free to use'],
      },
      {
        title: 'Removing Noise and Echo with Descript and Other Tools',
        summary: 'Discover how to use Descript\'s AI tools and other free options to remove background hum, echo, and unwanted noises from recordings.',
        content: `## Removing Noise and Echo with Descript and Other Tools

### Descript — All-in-One Podcast Editor
Descript combines transcription, editing, and audio enhancement in one tool.

**Studio Sound** — Descript's one-click audio enhancement removes background noise, echo, and reverb. It works on any recording, from phone voice memos to professional microphone recordings.

**How to use Descript Studio Sound:**
1. Import your audio into Descript
2. Select the audio track
3. Click "Studio Sound" in the toolbar
4. Choose your setting: "Studio Quality" or "Remove Background Noise"
5. Descript processes the audio instantly

### Free Alternatives

**Audacity** — Free, open-source audio editor with noise reduction:
1. Select a few seconds of background noise (no speaking)
2. Effect → Noise Reduction → Get Noise Profile
3. Select the entire recording
4. Effect → Noise Reduction → OK

**Krisp AI** — Free real-time noise cancellation for calls and recordings.

### Which Tool Should You Use?
- **Adobe Podcast** — Best free option for quick enhancement
- **Descript** — Best if you also need transcription and editing
- **Audacity** — Best for detailed manual control
- **Krisp** — Best for real-time noise removal during calls`,
        duration: 11, order: 4,
        tips: ['For quick results, use Adobe Podcast Enhance Speech', 'For full podcast production, use Descript — it combines editing, transcription, and enhancement'],
        keyTakeaways: ['Descript\'s Studio Sound removes noise with one click', 'Audacity offers free manual noise reduction', 'Each tool excels in different situations'],
      },
      {
        title: 'Adding Emotion and Inflection to AI Voices',
        summary: 'Learn how to make AI voices sound happy, sad, serious, or excited using advanced settings and prompt tags.',
        content: `## Adding Emotion and Inflection to AI Voices

AI voices can sound flat and robotic by default. Here is how to add emotion and natural inflection.

### ElevenLabs Settings

**Stability** (1-100%)
- Low (20-40%): More emotional variation, natural ups and downs
- Medium (50-70%): Balanced — good for most use cases
- High (80-100%): Consistent but less emotional

**Clarity + Similarity** (1-100%)
- Higher values make the voice more accurate to the original
- But too high can introduce artifacts

**Style Exaggeration** (1-100%)
- Low: Natural, subtle expression
- High: Dramatic, theatrical performance

### Emotion Tags in Scripts

Add tags directly in your script to cue specific emotions:

[happy] "I can't believe we actually did it!"
[sad] "It's over. I don't know what to say."
[whisper] "We need to be quiet. They're right outside."
[angry] "How could you do this? After everything?"
[excited] "This is the greatest day of my life!"`,
        duration: 10, order: 5,
        tips: ['Use moderate stability (50-60%) for the most natural everyday speech', 'Add emotion tags in your script for specific vocal inflections'],
        keyTakeaways: ['Stability controls emotional variation — lower is more emotional', 'Style Exaggeration controls overall expressiveness', 'Emotion tags in scripts cue specific vocal performances'],
      },
      {
        title: 'Creating Realistic Sound Effects with Text-to-Audio',
        summary: 'Discover how to generate sound effects like rain, footsteps, door slams, and crowd noises using text-to-audio AI tools.',
        content: `## Creating Realistic Sound Effects with Text-to-Audio

AI can now generate realistic sound effects from text descriptions. This is perfect for adding production value to your podcasts and videos.

### Tools for Sound Effect Generation

**ElevenLabs Sound Effects** — Generate any sound effect by describing it:
"rain falling on a tin roof", "footsteps on wooden floor", "car engine starting"

**How It Works:**
1. Type a description of the sound you want
2. AI generates 5-15 seconds of audio
3. Download and use in your project

### Common Sound Effects You Can Generate

| Sound | Description |
|-------|-------------|
| Rain | "Gentle rain falling on leaves with distant thunder" |
| Footsteps | "Footsteps approaching on gravel, then stopping" |
| Door | "Creaky wooden door slowly opening" |
| Crowd | "Large crowd cheering with applause" |
| Nature | "Birds chirping in a forest with gentle wind" |
| Urban | "City street with traffic and distant sirens" |
| Kitchen | "Sizzling pan and chopping sounds" |

### Free Alternatives
- **Freesound.org** — Massive library of free sound effects
- **BBC Sound Effects** — Free for educational and personal use
- **YouTube Audio Library** — Free for creators`,
        duration: 10, order: 6,
        tips: ['Be specific in your sound descriptions for better results', 'Layer multiple sound effects for richer audio scenes'],
        keyTakeaways: ['AI generates sound effects from text descriptions', 'ElevenLabs can create any sound effect you describe', 'Combine generated SFX with free libraries for best results'],
      },
      {
        title: 'Stem Splitting for Podcasts and Remixing',
        summary: 'Learn how to use Moises and other stem-splitting tools to separate vocals, music, and sound effects from any audio file.',
        content: `## Stem Splitting for Podcasts and Remixing

Stem splitting uses AI to separate mixed audio into individual tracks. This is incredibly useful for podcast production and music remixing.

### For Podcasts
- Separate multiple speakers into individual tracks
- Remove background music from interview recordings
- Isolate a specific speaker for editing
- Clean up conference call recordings

### For Music
- Extract vocals for remixing
- Isolate drums for sampling
- Remove vocals for karaoke versions
- Create instrumental versions

### How to Use Moises

1. Upload your audio file
2. Select how many stems you want (2, 4, or 5 stems)
3. Wait 30-60 seconds for processing
4. Download individual stems or create a custom mix

### What You Can Separate
- Vocals (lead and backing)
- Drums and percussion
- Bass guitar
- Guitar (acoustic and electric)
- Other instruments (keys, strings, etc.)`,
        duration: 11, order: 7,
        tips: ['Use stem splitting to clean up interview recordings with multiple speakers', 'For best separation quality, use high-quality source files'],
        keyTakeaways: ['Stem splitting separates mixed audio into individual tracks', 'Moises can separate up to 5 stems per track', 'Useful for podcast editing, remixing, and creating karaoke tracks'],
      },
      {
        title: 'Comparing the Top Voice and Audio Tools',
        summary: 'ElevenLabs vs Descript vs Adobe Podcast vs Kits AI — which one is right for you?',
        content: `## Comparing the Top Voice and Audio Tools

| Tool | Best For | Key Feature | Price |
|------|----------|-------------|-------|
| **ElevenLabs** | Voice cloning and TTS | Clone with 1 min audio, 30+ languages, emotional control | Free (limited), Pro from $5/month |
| **Adobe Podcast** | Audio enhancement | Remove noise, echo, plosives for free | Free |
| **Descript** | Podcast editing | All-in-one: edit, transcribe, enhance, generate | Free (limited), Pro from $12/month |
| **Kits AI** | Singing voice cloning | Clone singing voices, vocal models for music | Free (limited), Pro from $10/month |
| **Moises** | Stem splitting | Separate vocals, drums, bass, guitar | Free (limited), Pro from $4/month |
| **Krisp** | Real-time noise removal | Remove noise during calls and recordings | Free (limited), Pro from $8/month |

### Which One Should You Choose?

**Choose ElevenLabs if:** You need the highest quality voice cloning and text-to-speech.

**Choose Adobe Podcast if:** You need a free, quick audio enhancement tool.

**Choose Descript if:** You want an all-in-one podcast production platform.

**Choose Kits AI if:** You need singing voice cloning for music production.

**Choose Moises if:** You need stem splitting for remixing or podcast cleanup.`,
        duration: 14, order: 8,
        tips: ['Use Adobe Podcast for quick voice cleanup — it is free and excellent', 'Use Descript for full podcast production with transcription and editing'],
        keyTakeaways: ['ElevenLabs is best for voice cloning', 'Adobe Podcast is the best free audio enhancer', 'Descript is the best all-in-one podcast production tool'],
      },
      {
        title: 'Using AI Voices for Audiobooks, Commercials, and YouTube',
        summary: 'Learn how to use cloned voices and AI narration for audiobooks, voiceovers, commercials, and YouTube channels.',
        content: `## Using AI Voices for Audiobooks, Commercials, and YouTube

### Audiobooks
AI voices can narrate entire audiobooks. ElevenLabs supports long-form narration with consistent voice quality across hours of content.

**Tips for AI audiobook narration:**
- Use moderate stability (50-60%) for natural variation
- Add SSR (Syllable-level Speech Rate) control for pacing
- Review generated chapters for pronunciation errors
- Use different voices for different characters

### Commercials and Voiceovers
Create professional voiceovers for:
- TV and radio commercials
- Online video ads
- Corporate presentations
- E-learning courses
- Phone system greetings

### YouTube Channels
Many successful YouTube channels use AI voices:
- Educational and explainer videos
- News and commentary channels
- Top 10 and list videos
- Storytelling and narration channels

### Best Practices
1. Match the voice style to your content type
2. Use moderate emotion settings for professional content
3. Always disclose AI voice use in commercial content
4. Test your content on multiple devices before publishing`,
        duration: 10, order: 9,
        tips: ['For audiobooks, generate in chapters and review each before moving on', 'For commercials, use higher Clarity settings for professional polish'],
        keyTakeaways: ['AI voices can narrate full audiobooks', 'AI voiceovers work for commercials, corporate, and e-learning', 'Many YouTube channels use AI voices successfully'],
      },
      {
        title: 'Common Mistakes and How to Fix Them',
        summary: 'Why does the cloned voice sound robotic? Why is the audio still noisy? How to avoid common pitfalls and get natural, clear results.',
        content: `## Common Mistakes and How to Fix Them

| Problem | Why It Happens | How to Fix |
|---------|---------------|------------|
| Voice sounds robotic | Stability too high | Lower stability to 40-60% for more natural variation |
| Audio still has noise | Source was too noisy | Use Adobe Podcast first, then Descript for additional cleanup |
| Cloned voice sounds wrong | Poor quality sample | Re-record sample: quiet room, good mic, 2+ minutes |
| Plosives (P pops) | Too close to microphone | Use a pop filter or speak slightly off-axis |
| Echo remains | Large room recording | Use Adobe Podcast or Descript Studio Sound |
| Inconsistent volume | No compression applied | Use a compressor or normalize audio in editing |

### Quick Fixes

- **Robotic voice** → Lower stability to 50%, add emotion tags
- **Noisy audio** → Run through Adobe Podcast Enhance Speech first
- **Bad clone** → Re-record with better microphone in quiet room
- **Plosives** → Add pop filter, speak 6 inches from mic
- **Echo** → Descript Studio Sound or Adobe Podcast
- **Quiet audio** → Normalize to -14 LUFS (standard for podcasts)`,
        duration: 9, order: 10,
        tips: ['Always start with a high-quality voice sample for best cloning results', 'Use Adobe Podcast Enhance Speech as your first cleanup step for any recording'],
        keyTakeaways: ['Most cloning issues come from poor source recordings', 'Stability settings dramatically affect naturalness', 'Layer multiple tools for the best results'],
      },
      {
        title: 'Ethical Use: Deepfakes, Consent, and Transparency',
        summary: 'Understand the serious ethics of voice cloning — always get consent, disclose AI-generated voices, and never use voice cloning to deceive.',
        content: `## Ethical Use: Deepfakes, Consent, and Transparency

Voice cloning is a powerful technology that must be used responsibly.

### The Golden Rules

1. **Always get explicit consent** before cloning someone's voice
2. **Always disclose** when audio is AI-generated
3. **Never use** voice cloning to impersonate without permission
4. **Never create** misleading or deceptive audio content

### What Constitutes Consent

✅ Recording your own voice
✅ Having someone record a sample specifically for cloning
✅ Using professional voice actors who agree to AI cloning
✅ Using public figures' voices for commentary (with disclosure)

❌ Recording someone without their knowledge
❌ Using found audio (YouTube, podcasts) to clone without permission
❌ Creating content that makes it seem like someone said something they didn't

### Legal Risks
- Voice cloning without consent can violate privacy laws
- Impersonation for fraud is a crime
- Some jurisdictions have specific AI voice laws
- Platforms may ban accounts that misuse voice cloning`,
        duration: 10, order: 11,
        tips: ['When in doubt, get written permission before cloning any voice', 'Always add disclosure labels to AI-generated audio content'],
        keyTakeaways: ['Always get explicit consent before cloning a voice', 'Always disclose AI-generated audio to your audience', 'Voice cloning for deception is illegal and unethical'],
      },
      {
        title: 'Practice Exercises',
        summary: 'Hands-on exercises: clone your own voice, fix a noisy recording, add emotion to an AI voice, and create a 2-minute podcast intro.',
        content: `## Practice Exercises

### Exercise 1 – Clone Your Voice
Record 2 minutes of your voice. Upload to ElevenLabs and clone it. Generate a 30-second script in your cloned voice.

### Exercise 2 – Fix a Noisy Recording
Record your voice on your phone in a noisy room. Run it through Adobe Podcast Enhance Speech. Compare before and after.

### Exercise 3 – Add Emotion
Take a neutral script and generate it with 3 different emotion settings:
- Low stability (30%) for emotional reading
- Medium stability (60%) for balanced reading
- High stability (90%) for consistent reading

### Exercise 4 – Podcast Intro
Create a 2-minute podcast intro using AI:
1. Write a script introducing yourself and your podcast
2. Generate it with your cloned voice
3. Add background music (from AI or free library)
4. Master the final mix

### Exercise 5 – Sound Effects
Generate three sound effects using ElevenLabs:
- Rain on a window
- Coffee shop ambiance
- Door opening

Layer them together to create a scene.

### Course Summary
By the end of this module, you should be able to:
- Clone a voice using ElevenLabs
- Fix bad audio with Adobe Podcast and Descript
- Add emotion and inflection to AI voices
- Create sound effects with text-to-audio
- Understand the ethics of voice cloning`,
        duration: 6, order: 12,
        tips: ['Practice with your own voice before attempting to work with others', 'Keep your voice samples organized for easy reuse'],
        keyTakeaways: ['Voice cloning and enhancement are powerful tools for content creation', 'Practice with different settings to understand their effects', 'Always prioritize ethics and transparency when using voice cloning'],
      },
    ];

    const lessons9 = lessonData9.map(l => ({
      ...l,
      moduleId: modules[8]._id,
      published: true,
      isPublished: true,
      videoUrl: '',
    }));
    await Lesson.insertMany(lessons9);
    console.log(lessons9.length + ' lessons created for Module 9');

    await Quiz.create({
      moduleId: modules[8]._id,
      title: 'AI for Voice Cloning & Podcasting — Final Assessment',
      passingScore: 80,
      published: true,
      questions: [
        {
          question: 'How much audio do you need to clone a voice with ElevenLabs?',
          options: ['5 seconds', '1-2 minutes of clear audio', '30 minutes', 'A full hour'],
          correct: 1,
        },
        {
          question: 'Which free tool is BEST for removing background noise and echo from voice recordings?',
          options: ['ElevenLabs', 'Adobe Podcast Enhance Speech', 'Kits AI', 'Moises'],
          correct: 1,
        },
        {
          question: 'What do the "Stability" and "Clarity" settings in ElevenLabs control?',
          options: ['The volume of the audio', 'How emotional and natural the voice sounds', 'The speed of the voice', 'The language of the voice'],
          correct: 1,
        },
        {
          question: 'What is stem splitting used for?',
          options: ['Generating new music', 'Separating vocals, drums, bass, and other instruments from a mixed audio file', 'Cloning voices', 'Adding reverb to audio'],
          correct: 1,
        },
        {
          question: 'What is the MOST important ethical rule when cloning a voice?',
          options: ['Always use the voice for commercial purposes', 'Always get consent from the person whose voice you are cloning', 'Only clone celebrity voices', 'Never change the emotion of the voice'],
          correct: 1,
        },
      ],
    });
    console.log('Quiz created for Module 9');

    await Prompt.insertMany([
      { title: 'Explain Like I am 5', content: 'Explain {{topic}} simply.', category: 'general', toolType: 'writing-copy', difficulty: 'beginner', tags: ['explain'], featured: true, isFeatured: true, copyCount: 42 },
      { title: 'Code Review', content: 'Review {{language}} code.', category: 'coding', toolType: 'code-generation', difficulty: 'intermediate', tags: ['code'], featured: true, isFeatured: true, copyCount: 38 },
      { title: 'Lesson Plan', content: 'Create lesson plan for {{topic}}.', category: 'education', toolType: 'writing-copy', difficulty: 'intermediate', tags: ['teaching'], featured: true, isFeatured: true, copyCount: 27 },
      { title: 'Blog Outline', content: 'Blog outline about {{topic}}.', category: 'writing', toolType: 'writing-copy', difficulty: 'beginner', tags: ['blog'], featured: false, isFeatured: false, copyCount: 19 },
      { title: 'Debug Helper', content: 'Fix error: {{error}}.', category: 'coding', toolType: 'code-generation', difficulty: 'intermediate', tags: ['debug'], featured: true, isFeatured: true, copyCount: 55 },
    ]);
    console.log('5 prompts created');

    const SystemSetting = require('../models/SystemSetting');
    await SystemSetting.insertMany([
      { key: 'maintenance', value: false },
      { key: 'announcement', value: { text: 'Welcome to JOEAILABS', isActive: true } },
      { key: 'paymentMethods', value: ['binance'] },
      { key: 'communityLinks', value: { discord: '', twitter: '', github: '', telegram: 'https://t.me/joeailabs', whatsapp: '' } },
      { key: 'premiumPricing', value: { monthly: 15, yearly: 150 } },
    ]);
    console.log('Settings created');

    console.log('\nSeed complete!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
