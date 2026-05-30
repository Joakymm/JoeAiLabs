require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Prompt = require('../models/Prompt');

const CATEGORY_TO_TOOLTYPE = {
  'Marketing & Social Media': 'writing-copy',
  'Coding & Development': 'code-generation',
  'Content Creation & Copywriting': 'writing-copy',
  'SEO Optimization': 'writing-copy',
  'Sales & Persuasion': 'writing-copy',
  'Health & Fitness': 'writing-copy',
  'Prompt Engineering': 'writing-copy',
  'Online Course Creation': 'writing-copy',
  'eCommerce & Customer Support': 'automation',
  'Web Design & UX': 'presentation',
  'Language Learning': 'research-analysis',
  'Logistics & Supply Chain': 'research-analysis',
  'Data Analysis': 'research-analysis',
  'Project Management': 'automation',
  'Travel & Lifestyle': 'writing-copy',
  'HR & Recruitment': 'automation',
  'Copywriting': 'writing-copy',
  'Analytics': 'research-analysis',
  'Blog Writing': 'writing-copy',
  'Video': 'video-generation',
  'LinkedIn': 'writing-copy',
  'Code Generation': 'code-generation',
  'Meta-Prompting': 'writing-copy',
  'System Prompts': 'writing-copy',
  'Optimization': 'writing-copy',
  'YouTube': 'video-generation',
  'Marketing': 'writing-copy',
  'Engagement': 'writing-copy',
  'Community': 'writing-copy',
  'Pricing': 'writing-copy',
  'Culture': 'writing-copy',
  'Documentation': 'writing-copy',
  'Nutrition': 'writing-copy',
  'Recovery': 'writing-copy',
  'Customer Service': 'automation',
  'Content': 'writing-copy',
  'Reporting': 'research-analysis',
  'Writing': 'writing-copy',
  'Python': 'code-generation',
  'Production': 'video-generation',
  'Remote': 'writing-copy',
  'Marketplace': 'automation',
  'SEO': 'writing-copy',
  'CRM': 'automation',
  'Instagram Reel': 'video-generation',
  'TikTok': 'video-generation',
  'Facebook Ads': 'writing-copy',
  'Email Marketing': 'writing-copy',
  'Keyword Research': 'research-analysis',
  'On-Page SEO': 'writing-copy',
  'Backlink Outreach': 'writing-copy',
  'Social Media': 'writing-copy',
  'Code Review': 'code-generation',
  'Business Intelligence': 'research-analysis',
  'Course Design': 'writing-copy',
  'Cold Outreach': 'writing-copy',
  'Job Descriptions': 'writing-copy',
  'Planning': 'automation',
  'Training Plans': 'writing-copy',
  'Product Listings': 'writing-copy',
  'Trip Planning': 'writing-copy',
  'Landing Pages': 'writing-copy',
  'Practice': 'writing-copy',
  'Instagram': 'writing-copy',
  'Pinterest': 'writing-copy',
  'Twitter/X': 'writing-copy',
  'Google Ads': 'writing-copy',
  'Influencer Marketing': 'writing-copy',
  'Content Repurposing': 'writing-copy',
  'Hashtag Strategy': 'writing-copy',
  'Technical SEO': 'writing-copy',
  'Local SEO': 'writing-copy',
  'Content Strategy': 'writing-copy',
  'Link Building': 'writing-copy',
  'SERP Analysis': 'research-analysis',
  'E-E-A-T': 'writing-copy',
  'Newsletter': 'writing-copy',
  'Press Release': 'writing-copy',
  'Debugging': 'code-generation',
  'Architecture': 'code-generation',
  'Database': 'code-generation',
  'API Development': 'code-generation',
  'DevOps': 'automation',
  'Testing': 'code-generation',
  'Security': 'code-generation',
  'Data Cleaning': 'research-analysis',
  'Visualization': 'research-analysis',
  'Forecasting': 'research-analysis',
  'A/B Testing': 'research-analysis',
  'Dashboard': 'research-analysis',
  'Video Script': 'video-generation',
  'Cold Calling': 'writing-copy',
  'Proposal': 'writing-copy',
  'Follow-Up': 'writing-copy',
  'Consultative': 'writing-copy',
  'ROI': 'writing-copy',
  'Interview Questions': 'writing-copy',
  'Onboarding': 'writing-copy',
  'Performance Review': 'writing-copy',
  'Offer Letters': 'writing-copy',
  'Sprint Planning': 'automation',
  'Risk Management': 'automation',
  'Meeting Facilitation': 'automation',
  'Stakeholder': 'writing-copy',
  'Mental Health': 'writing-copy',
  'Sleep': 'writing-copy',
  'Habit Building': 'writing-copy',
  'Chain-of-Thought': 'writing-copy',
  'Templates': 'writing-copy',
  'Evaluation': 'research-analysis',
  'Workflow': 'automation',
  'Product Launch': 'writing-copy',
  'Reviews': 'writing-copy',
  'Abandoned Cart': 'automation',
  'Upsell': 'writing-copy',
  'Packing': 'automation',
  'Budget': 'writing-copy',
  'Language': 'research-analysis',
  'Photo': 'image-generation',
  'Digital Nomad': 'writing-copy',
  'UX Research': 'research-analysis',
  'Information Architecture': 'presentation',
  'Accessibility': 'presentation',
  'Wireframing': 'presentation',
  'Vocabulary': 'research-analysis',
  'Grammar': 'research-analysis',
  'Pronunciation': 'research-analysis',
  'Reading': 'research-analysis',
  'Inventory': 'automation',
  'Shipping': 'automation',
  'Supplier': 'automation',
  'Demand Planning': 'automation',
  'Sustainability': 'research-analysis',
  'Affiliate': 'writing-copy',
  'Personal Brand': 'writing-copy',
  'Competitive': 'research-analysis',
  'SaaS': 'writing-copy',
  'Growth': 'writing-copy',
  'International': 'writing-copy',
  'Core Web Vitals': 'research-analysis',
  'E-commerce': 'automation',
  'Blog': 'writing-copy',
  'Case Study': 'writing-copy',
  'eBook': 'writing-copy',
  'Social': 'writing-copy',
  'PR': 'writing-copy',
  'Git': 'code-generation',
  'Docker': 'automation',
  'GraphQL': 'code-generation',
  'Performance': 'research-analysis',
  'Migration': 'code-generation',
  'AI Integration': 'code-generation',
  'SQL': 'code-generation',
  'Statistics': 'research-analysis',
  'Pitch Deck': 'presentation',
  'Closing': 'writing-copy',
  'Discovery': 'writing-copy',
  'Objections': 'writing-copy',
  'Referral': 'writing-copy',
  'Learning': 'research-analysis',
  'DEI': 'writing-copy',
  'Succession': 'writing-copy',
  'Estimation': 'automation',
  'Retro': 'automation',
  'Tooling': 'automation',
  'HIIT': 'writing-copy',
  'Yoga': 'writing-copy',
  'Wellness': 'writing-copy',
  'Supplements': 'writing-copy',
  'Frameworks': 'writing-copy',
  'Techniques': 'writing-copy',
  'Guardrails': 'writing-copy',
  'Conversion': 'writing-copy',
  'Klaviyo': 'automation',
  'Road Trip': 'writing-copy',
  'Solo': 'writing-copy',
  'Photography': 'image-generation',
  'Workcation': 'writing-copy',
  'Design Systems': 'presentation',
  'Mobile': 'presentation',
  'E-commerce UX': 'presentation',
  'Listening': 'research-analysis',
  'Speaking': 'research-analysis',
  'Exam Prep': 'research-analysis',
  'Warehouse': 'automation',
  'Last Mile': 'automation',
  'Compliance': 'automation',
  'Risk': 'automation',
  'Prospecting': 'writing-copy',
  'Clean Code': 'code-generation',
  'Presentation': 'presentation',
  'Productivity': 'automation',
  'Posture': 'writing-copy',
  'Creative': 'writing-copy',
  'Retention': 'writing-copy',
  'Volunteer': 'writing-copy',
  'Portfolio': 'presentation',
  'Immersion': 'research-analysis',
  'Technology': 'research-analysis',
  'TypeScript': 'code-generation',
  'Running': 'writing-copy',
  'Landing Page': 'presentation',
  'Motivation': 'writing-copy',
  'Freight': 'automation',
  'Direct Mail': 'writing-copy',
};

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Set isPublished: true on all prompts that don't have it
    const publishResult = await Prompt.updateMany(
      { isPublished: { $ne: true } },
      { $set: { isPublished: true } }
    );
    console.log(`Set isPublished: true on ${publishResult.modifiedCount} prompts`);

    // 2. Assign toolType based on category
    const uncategorizedPrompts = await Prompt.find({
      $or: [
        { toolType: { $in: ['', null, undefined] } },
        { toolType: { $exists: false } },
      ]
    });

    let updated = 0;
    for (const p of uncategorizedPrompts) {
      const tt = CATEGORY_TO_TOOLTYPE[p.category] || 'writing-copy';
      await Prompt.findByIdAndUpdate(p._id, { $set: { toolType: tt } });
      updated++;
    }
    console.log(`Assigned toolType to ${updated} prompts`);

    // 3. Summary
    const total = await Prompt.countDocuments();
    const withToolType = await Prompt.countDocuments({ toolType: { $exists: true, $nin: ['', null] } });
    const published = await Prompt.countDocuments({ isPublished: true });
    console.log(`\nSummary: ${total} total, ${published} published, ${withToolType} with toolType`);

    // 4. Show toolType distribution
    const dist = await Prompt.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$toolType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    console.log('\nToolType distribution:');
    dist.forEach(d => console.log(`  ${d._id}: ${d.count}`));

    await mongoose.disconnect();
    console.log('\nMigration complete!');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
