require('dotenv').config();
const mongoose = require('mongoose');
const Prompt = require('../models/Prompt');

function genPrompts() {
  const prompts = [];
  let id = 0;
  const n = (a) => a[Math.floor(Math.random() * a.length)];
  const copy = () => Math.floor(Math.random() * 60);
  const diff = () => n(['beginner','beginner','intermediate','intermediate','advanced']);
  const time = () => n(['5 min','5 min','10 min','10 min','15 min','20 min','30 min']);
  const tags = (...t) => t;
  const ph = (...p) => p;

  const imgCats = ['Product Photography','Logo Design','Character Creation','Backgrounds & Textures','Social Media Graphics','Book Covers','Marketing Materials','Concept Art','Architectural Visualization','Fashion Design','Food Photography','Nature Scenes','Abstract Art','Portraits','Fantasy Illustrations','UI Mockups','Tattoo Designs','Album Covers','Real Estate','Gaming Assets'];

  // ── 50 Image Generation ──
  const imgTools = ['Midjourney','DALL-E','Stable Diffusion','Leonardo'];
  const imgSub = ['Product Shot','Logo','Character','Background','Social Graphic','Cover','Marketing','Concept','Architecture','Fashion','Food','Nature','Abstract','Portrait','Fantasy','UI','Tattoo','Album','Real Estate','Game Asset'];
  for (let i = 0; i < 50; i++) {
    const tool = i < 15 ? 'Midjourney' : i < 27 ? 'DALL-E' : i < 39 ? 'Stable Diffusion' : 'Leonardo';
    const cat = imgCats[i % imgCats.length];
    const sub = imgSub[i % imgSub.length];
    prompts.push({
      promptId: `IMG-${String(i+1).padStart(3,'0')}`,
      toolType: 'image-generation', toolName: tool, category: cat, subcategory: sub,
      title: `${sub} — ${cat}`,
      difficulty: diff(), estimatedTime: time(),
      tags: tags(cat.toLowerCase().replace(/ & /g,'-').replace(/ /g,'-'), tool.toLowerCase().replace(/ /g,'-'), sub.toLowerCase()),
      description: `Generate a ${cat.toLowerCase()} image of a ${sub.toLowerCase()} using ${tool} with detailed parameters.`,
      promptText: `Create a stunning ${cat.toLowerCase()} image of [${sub.toLowerCase()}] with [style:${n(['cinematic','minimalist','vibrant','dark','ethereal'])}] lighting. Use [${n(['8K','4K','ultra-detailed'])}] resolution, [${n(['Canon EOS R5','35mm lens','wide-angle','macro lens'])}] perspective. The mood should be [${n(['dramatic','peaceful','mysterious','energetic','serene'])}] with a color palette of [${n(['warm tones','cool blues','neon accents','pastel gradients','monochrome'])}]. Add [${n(['depth of field','motion blur','soft focus','sharp details'])}] for realism.`,
      placeholders: ph(sub.toLowerCase(), 'lighting style', 'resolution', 'camera perspective', 'mood', 'color palette', 'effect style'),
      sampleOutput: { type: 'image', url: '', thumbnail: '', caption: `A ${cat.toLowerCase()} image featuring a ${sub.toLowerCase()} rendered in ${tool} with professional lighting and composition.` },
      copyCount: copy(), featured: i < 5,
    });
  }

  // ── 30 Video Generation ──
  const vidTools = ['Runway','Pika','Kling','HeyGen'];
  const vidCats = ['Product Teasers','Explainer Videos','Background Loops','Text-to-Video','Image-to-Video','Cinematic Shots','Social Media Clips','Title Sequences','Nature Scenes','Urban Environments','Character Movement','Abstract Motion','Brand Assets','Event Highlights','Tutorial Videos'];
  const vidSub = ['Teaser','Explainer','Loop','Text-to-Vid','Img-to-Vid','Cinematic','Clip','Title','Nature','Urban','Movement','Abstract','Brand','Event','Tutorial'];
  for (let i = 0; i < 30; i++) {
    const tool = i < 10 ? 'Runway' : i < 18 ? 'Pika' : i < 24 ? 'Kling' : 'HeyGen';
    const cat = vidCats[i % vidCats.length];
    const sub = vidSub[i % vidSub.length];
    prompts.push({
      promptId: `VID-${String(i+1).padStart(3,'0')}`,
      toolType: 'video-generation', toolName: tool, category: cat, subcategory: sub,
      title: `${sub} Video — ${cat}`,
      difficulty: diff(), estimatedTime: time(),
      tags: tags(cat.toLowerCase().replace(/ /g,'-'), tool.toLowerCase(), 'video-generation'),
      description: `Create an engaging ${cat.toLowerCase()} video for ${sub.toLowerCase()} using ${tool}.`,
      promptText: `Generate a [${n(['4-second','6-second','8-second'])}] ${cat.toLowerCase()} video of [${sub.toLowerCase()}] with [${n(['smooth camera pan','slow zoom in','dolly tracking shot','orbit around subject'])}]. Style: [${n(['cinematic','realistic','anime','3D render','stop-motion'])}]. Lighting: [${n(['natural daylight','neon glow','golden hour','dramatic shadows'])}]. Add [${n(['particle effects','lens flare','gentle fog','sparkles'])}] for atmosphere. Output: [${n(['1920x1080','1080x1920','square 1:1'])}].`,
      placeholders: ph('duration', 'subject', 'camera movement', 'visual style', 'lighting setup', 'atmosphere effects', 'resolution'),
      sampleOutput: { type: 'video', url: '', thumbnail: '', caption: `A ${cat.toLowerCase()} video clip showing ${sub.toLowerCase()} with smooth camera animation and professional lighting in ${tool}.` },
      copyCount: copy(), featured: false,
    });
  }

  // ── 40 Writing & Copy ──
  const wrtTools = ['ChatGPT','Claude','Gemini'];
  const wrtCats = ['Blog Posts','Email Sequences','Social Media Captions','Ad Copy','Product Descriptions','SEO Meta Tags','Press Releases','Case Studies','Newsletters','Sales Letters','Landing Pages','Video Scripts','Podcast Intros','Creative Stories','Brand Guidelines','Grant Proposals'];
  const wrtSub = ['Blog','Email','Caption','Ad','Product','SEO','Press','Case Study','Newsletter','Sales','Landing','Script','Podcast','Story','Brand','Grant'];
  for (let i = 0; i < 40; i++) {
    const tool = i < 18 ? 'ChatGPT' : i < 30 ? 'Claude' : 'Gemini';
    const cat = wrtCats[i % wrtCats.length];
    const sub = wrtSub[i % wrtSub.length];
    prompts.push({
      promptId: `WRI-${String(i+1).padStart(3,'0')}`,
      toolType: 'writing-copy', toolName: tool, category: cat, subcategory: sub,
      title: `${sub} Writing Template — ${cat}`,
      difficulty: diff(), estimatedTime: time(),
      tags: tags('writing', cat.toLowerCase().replace(/ /g,'-'), tool.toLowerCase()),
      description: `Generate a ${cat.toLowerCase()} for ${sub.toLowerCase()} using ${tool} with a professional tone.`,
      promptText: `Write a ${cat.toLowerCase()} for [${sub.toLowerCase()}] targeting [audience:${n(['beginners','professionals','business owners','students','creatives'])}]. Tone: [${n(['professional','conversational','authoritative','friendly','inspirational'])}]. Length: [${n(['300 words','500 words','800 words','1000 words'])}]. Include [${n(['a strong hook','statistics','a call to action','storytelling elements'])}]. Focus on [key benefit:${n(['time savings','cost reduction','quality improvement','innovation','simplicity'])}]. Format with [${n(['clear headings','bullet points','numbered list','short paragraphs'])}].`,
      placeholders: ph('topic/niche', 'target audience', 'tone', 'length', 'hook type', 'key benefit', 'format style'),
      sampleOutput: { type: 'text', url: '', thumbnail: '', caption: `A well-structured ${cat.toLowerCase()} written by ${tool} with clear sections and a compelling call to action.` },
      copyCount: copy(), featured: false,
    });
  }

  // ── 25 Code Generation ──
  const codTools = ['GitHub Copilot','Cursor','Claude'];
  const codCats = ['Python Scripts','JavaScript Functions','React Components','API Integrations','Database Queries','Data Cleaning','Web Scraping','Automation Scripts','Error Debugging','Code Documentation','Test Writing','CSS Layouts','HTML Structures','CLI Tools','Data Visualization'];
  const codSub = ['Python','JS','React','API','SQL','Clean','Scrape','Auto','Debug','Docs','Test','CSS','HTML','CLI','Viz'];
  for (let i = 0; i < 25; i++) {
    const tool = i < 10 ? 'GitHub Copilot' : i < 18 ? 'Cursor' : 'Claude';
    const cat = codCats[i % codCats.length];
    const sub = codSub[i % codSub.length];
    prompts.push({
      promptId: `COD-${String(i+1).padStart(3,'0')}`,
      toolType: 'code-generation', toolName: tool, category: cat, subcategory: sub,
      title: `${sub} Code Generator — ${cat}`,
      difficulty: diff(), estimatedTime: time(),
      tags: tags('code', cat.toLowerCase().replace(/ /g,'-'), tool.toLowerCase().replace(/ /g,'-')),
      description: `Generate ${cat.toLowerCase()} code for ${sub.toLowerCase()} using ${tool} with best practices.`,
      promptText: `Write ${cat.toLowerCase()} code for [${sub.toLowerCase()} project] using [language:${n(['Python','JavaScript','TypeScript','SQL'])}]. Requirements: [${n(['error handling','input validation','async/await','type safety'])}]. The code should [${n(['be production-ready','handle edge cases','include logging','be well-documented'])}]. Add [${n(['unit tests','type hints','docstrings','comments'])}]. Use [${n(['functional programming','object-oriented','modular design'])}] approach.`,
      placeholders: ph('project description', 'programming language', 'error handling approach', 'code quality goal', 'testing type', 'paradigm'),
      sampleOutput: { type: 'text', url: '', thumbnail: '', caption: `A complete ${cat.toLowerCase()} implementation with clean code structure, error handling, and documentation.` },
      copyCount: copy(), featured: false,
    });
  }

  // ── 20 Automation ──
  const autTools = ['Zapier','Make','n8n'];
  const autCats = ['Lead Capture','Email Automation','Social Media Scheduling','Data Sync','Notification Systems','Form Submissions','CRM Updates','File Organization','Report Generation','Approval Workflows','E-commerce Automation','Invoice Processing','Chatbot Triggers','Analytics Pipelines'];
  const autSub = ['Lead','Email','Social','Sync','Notify','Form','CRM','File','Report','Approval','Ecom','Invoice','Chatbot','Analytics'];
  for (let i = 0; i < 20; i++) {
    const tool = i < 8 ? 'Zapier' : i < 15 ? 'Make' : 'n8n';
    const cat = autCats[i % autCats.length];
    const sub = autSub[i % autSub.length];
    prompts.push({
      promptId: `AUT-${String(i+1).padStart(3,'0')}`,
      toolType: 'automation', toolName: tool, category: cat, subcategory: sub,
      title: `${sub} Automation — ${cat}`,
      difficulty: diff(), estimatedTime: time(),
      tags: tags('automation', cat.toLowerCase().replace(/ /g,'-'), tool.toLowerCase()),
      description: `Build an automated ${cat.toLowerCase()} workflow for ${sub.toLowerCase()} using ${tool}.`,
      promptText: `Create a ${tool} workflow for ${cat.toLowerCase()} of [${sub.toLowerCase()} data]. Trigger: [${n(['new form submission','scheduled daily','webhook received','email received'])}]. Action 1: [${n(['create record','send email','update sheet','post message'])}] in [${n(['Google Sheets','Slack','HubSpot','Gmail','Airtable'])}]. Action 2: [${n(['send notification','add to queue','generate report','tag contact'])}]. Add [${n(['error handling','filter conditions','formatting step'])}].`,
      placeholders: ph('input data source', 'trigger type', 'first action', 'target app', 'second action', 'additional logic'),
      sampleOutput: { type: 'text', url: '', thumbnail: '', caption: `A multi-step ${tool} workflow that automates ${cat.toLowerCase()} end-to-end with error handling.` },
      copyCount: copy(), featured: false,
    });
  }

  // ── 15 Voice & Audio ──
  const voiTools = ['ElevenLabs','Suno','Udio'];
  const voiCats = ['Voiceovers','Podcast Intros','Character Voices','Audio Logos','Background Music','Sound Effects','Narrations','Language Practice','Singing Voices','Emotional Tones','Meditation Guides','Commercial Voice','Audiobook Narration'];
  const voiSub = ['Voiceover','Podcast','Character','Logo','Music','SFX','Narration','Language','Singing','Emotion','Meditation','Commercial','Audiobook'];
  for (let i = 0; i < 15; i++) {
    const tool = i < 6 ? 'ElevenLabs' : i < 11 ? 'Suno' : 'Udio';
    const cat = voiCats[i % voiCats.length];
    const sub = voiSub[i % voiSub.length];
    prompts.push({
      promptId: `VOI-${String(i+1).padStart(3,'0')}`,
      toolType: 'voice-audio', toolName: tool, category: cat, subcategory: sub,
      title: `${sub} Audio — ${cat}`,
      difficulty: diff(), estimatedTime: time(),
      tags: tags('audio', cat.toLowerCase().replace(/ /g,'-'), tool.toLowerCase()),
      description: `Generate ${cat.toLowerCase()} for ${sub.toLowerCase()} using ${tool} with professional quality.`,
      promptText: `Using ${tool}, generate a ${cat.toLowerCase()} for [${sub.toLowerCase()} content] with [${n(['warm','authoritative','energetic','calm','playful'])}] voice tone. Pace: [${n(['slow and deliberate','moderate','fast-paced'])}]. Background: [${n(['none','soft ambient','music track','nature sounds'])}]. Duration: [${n(['15 seconds','30 seconds','60 seconds','2 minutes'])}]. Style: [${n(['conversational','dramatic','corporate','educational','entertaining'])}].`,
      placeholders: ph('content description', 'voice tone', 'pace', 'background audio', 'duration', 'style'),
      sampleOutput: { type: 'audio', url: '', thumbnail: '', caption: `A professionally produced ${cat.toLowerCase()} audio clip with clear vocals and appropriate background ambiance.` },
      copyCount: copy(), featured: false,
    });
  }

  // ── 15 Research & Analysis ──
  const resTools = ['Perplexity','Claude','NotebookLM'];
  const resCats = ['Competitor Analysis','Market Research','Literature Reviews','Data Interpretation','Trend Spotting','Sentiment Analysis','Report Summarization','Fact Checking','Source Evaluation','Insight Extraction','SWOT Analysis','Customer Journey Mapping'];
  const resSub = ['Competitors','Market','Literature','Data','Trends','Sentiment','Summary','Facts','Sources','Insights','SWOT','Journey'];
  for (let i = 0; i < 15; i++) {
    const tool = i < 6 ? 'Perplexity' : i < 11 ? 'Claude' : 'NotebookLM';
    const cat = resCats[i % resCats.length];
    const sub = resSub[i % resSub.length];
    prompts.push({
      promptId: `RES-${String(i+1).padStart(3,'0')}`,
      toolType: 'research-analysis', toolName: tool, category: cat, subcategory: sub,
      title: `${sub} Analysis — ${cat}`,
      difficulty: diff(), estimatedTime: time(),
      tags: tags('research', cat.toLowerCase().replace(/ /g,'-'), tool.toLowerCase()),
      description: `Perform ${cat.toLowerCase()} for ${sub.toLowerCase()} using ${tool} with cited sources.`,
      promptText: `Using ${tool}, conduct a ${cat.toLowerCase()} on [${sub.toLowerCase()} topic]. Sources: [${n(['web search','academic papers','news articles','company reports'])}]. Focus areas: [${n(['key trends','market size','competitive landscape','growth opportunities'])}]. Format: [${n(['bullet points with citations','comparison table','executive summary','detailed report'])}]. Include [${n(['data points','percentage changes','expert quotes','timeline'])}].`,
      placeholders: ph('topic', 'source type', 'focus areas', 'output format', 'supporting details'),
      sampleOutput: { type: 'text', url: '', thumbnail: '', caption: `A comprehensive ${cat.toLowerCase()} with cited sources, data points, and actionable insights.` },
      copyCount: copy(), featured: false,
    });
  }

  // ── 10 Presentation ──
  const preTools = ['Beautiful.ai','Gamma','Tome'];
  const preCats = ['Pitch Decks','Sales Presentations','Educational Slides','Data Storytelling','Investor Updates','Team Meetings','Conference Talks','Portfolio Showcases','Training Materials','Product Launches'];
  const preSub = ['Pitch','Sales','Education','Data Story','Investor','Team','Conference','Portfolio','Training','Launch'];
  for (let i = 0; i < 10; i++) {
    const tool = i < 4 ? 'Beautiful.ai' : i < 7 ? 'Gamma' : 'Tome';
    const cat = preCats[i % preCats.length];
    const sub = preSub[i % preSub.length];
    prompts.push({
      promptId: `PRE-${String(i+1).padStart(3,'0')}`,
      toolType: 'presentation', toolName: tool, category: cat, subcategory: sub,
      title: `${sub} Deck — ${cat}`,
      difficulty: diff(), estimatedTime: time(),
      tags: tags('presentation', cat.toLowerCase().replace(/ /g,'-'), tool.toLowerCase()),
      description: `Build a ${cat.toLowerCase()} for ${sub.toLowerCase()} using ${tool} with professional design.`,
      promptText: `Create a ${cat.toLowerCase()} presentation for [${sub.toLowerCase()}] using ${tool}. Slide count: [${n(['5 slides','8 slides','10 slides','12 slides'])}]. Theme: [${n(['minimal dark','modern gradient','corporate blue','creative bold'])}]. Include slides for: [${n(['problem statement','solution overview','market opportunity','team','financials','roadmap'])}]. Each slide should have [${n(['one key message','supporting data','visual element','call to action'])}].`,
      placeholders: ph('presentation topic', 'slide count', 'theme', 'slide sections', 'slide content structure'),
      sampleOutput: { type: 'text', url: '', thumbnail: '', caption: `A professionally designed ${cat.toLowerCase()} presentation with consistent branding and clear data visualization.` },
      copyCount: copy(), featured: false,
    });
  }

  return prompts;
}

const PROMPTS_DATA = genPrompts();

async function seedPrompts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    await Prompt.deleteMany({});
    console.log('🗑️  Cleared existing prompts');
    const enriched = PROMPTS_DATA.map(p => ({
      ...p, isPublished: true, toolType: p.toolType || 'writing-copy', toolName: p.toolName || 'ChatGPT',
    }));
    const result = await Prompt.insertMany(enriched, { ordered: false });
    console.log(`✅ Inserted ${result.length} prompts`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

if (require.main === module) seedPrompts();

module.exports = PROMPTS_DATA;
