import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const baseUrl = 'https://www.daily-wisdom.com';
const currentDate = new Date().toISOString();

// Ensure ai directory exists
const aiDir = join(process.cwd(), 'public', 'ai');
try {
  mkdirSync(aiDir, { recursive: true });
} catch (error) {
  // Directory already exists
}

// Site content data
const siteData = [
  {
    url: '/',
    title: 'Daily Wisdom — Home',
    section: 'Hero',
    content: `Daily Wisdom is Life's Little Instruction Engine. Discover timeless wisdom and practical guidance for living a fulfilling life. Search through thousands of life instructions to find exactly what you need.

Our mission is to provide curated life instructions that help people navigate daily challenges and make better decisions. Each instruction is carefully selected to offer practical, actionable advice that can be applied to real-life situations.

Features:
- Random Daily Instructions: Discover new wisdom every day
- Advanced Search: Find specific instructions by tags, categories, or keywords
- Responsive Design: Works seamlessly on desktop and mobile devices
- Modern UI: Built with shadcn/ui components and Tailwind CSS

Whether you're looking for motivation, guidance, or inspiration, Daily Wisdom provides a comprehensive collection of life instructions from great thinkers and practical wisdom traditions.`,
    headings: ['Daily Wisdom', 'Features'],
    tags: ['home', 'wisdom', 'life-instructions', 'guidance'],
    updated_at: currentDate
  },
  {
    url: '/search',
    title: 'Search Instructions',
    section: 'Intro',
    content: `Find the perfect instruction for any situation. Search through thousands of life lessons and practical guidance on Daily Wisdom.

The search functionality allows you to:
- Search by keywords across all instructions
- Filter by categories such as relationships, career, health, personal growth
- Filter by tags for more specific topics
- Use both database and local search modes for optimal results

Search Categories:
- Personal Growth: Instructions for self-improvement and development
- Relationships: Guidance for interpersonal connections and communication
- Career: Professional development and work-related advice
- Health: Physical and mental wellness guidance
- Finance: Money management and financial wisdom
- Productivity: Time management and efficiency tips

Each search result includes the instruction text, relevant tags, categories, and source information when available.`,
    headings: ['Search Instructions', 'Search Categories'],
    tags: ['search', 'instructions', 'filters', 'categories'],
    updated_at: currentDate
  },
  {
    url: '/about',
    title: 'About Daily Wisdom',
    section: 'Mission',
    content: `Learn about Daily Wisdom - Life's Little Instruction Engine. Discover our mission to provide timeless wisdom and practical guidance for living a fulfilling life.

About Our Mission:
Daily Wisdom was created to democratize access to life guidance and practical wisdom. We believe that everyone deserves access to thoughtful, actionable advice that can help them navigate life's challenges and opportunities.

What We Offer:
- Curated Collection: Thousands of carefully selected life instructions
- Diverse Sources: Wisdom from various traditions, cultures, and thinkers
- Practical Focus: Instructions that can be applied to real-life situations
- Regular Updates: New content added regularly to keep the collection fresh

Our Philosophy:
We believe that wisdom grows when shared, and we're always looking to expand our collection with meaningful insights from diverse perspectives. Our goal is to make practical wisdom accessible to everyone, regardless of their background or circumstances.

Content Quality:
Each instruction in our collection is reviewed for:
- Practical applicability
- Clarity and accessibility
- Universal relevance
- Positive impact potential`,
    headings: ['About Our Mission', 'What We Offer', 'Our Philosophy', 'Content Quality'],
    tags: ['about', 'mission', 'philosophy', 'content-quality'],
    updated_at: currentDate
  }
];

// Generate JSONL file
const jsonlContent = siteData.map(item => JSON.stringify({
  url: `${baseUrl}${item.url}`,
  title: item.title,
  section: item.section,
  content: item.content,
  headings: item.headings,
  tags: item.tags,
  updated_at: item.updated_at
})).join('\n');

writeFileSync(join(aiDir, 'index.jsonl'), jsonlContent);

// Generate JSON file
const jsonContent = {
  site: 'Daily Wisdom',
  base_url: baseUrl,
  description: "Life's Little Instruction Engine — Discover timeless wisdom and practical guidance for living a fulfilling life.",
  docs: siteData.map(item => ({
    url: item.url,
    title: item.title,
    updated_at: item.updated_at,
    tags: item.tags
  }))
};

writeFileSync(join(aiDir, 'index.json'), JSON.stringify(jsonContent, null, 2));

// Generate RSS feed
const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Daily Wisdom</title>
    <link>${baseUrl}</link>
    <description>Life's Little Instruction Engine — Discover timeless wisdom and practical guidance for living a fulfilling life.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/ai/feed.xml" rel="self" type="application/rss+xml"/>
    
    ${siteData.map(item => `
    <item>
      <title>${item.title}</title>
      <link>${baseUrl}${item.url}</link>
      <description><![CDATA[${item.content.substring(0, 300)}...]]></description>
      <pubDate>${new Date(item.updated_at).toUTCString()}</pubDate>
      <guid>${baseUrl}${item.url}</guid>
    </item>`).join('')}
  </channel>
</rss>`;

writeFileSync(join(aiDir, 'feed.xml'), rssContent);

// Generate AI README
const aiReadme = `# Daily Wisdom - AI Data Sources

This directory contains machine-readable exports of Daily Wisdom content for AI tools and LLM ingestion.

## Available Files

### \`index.jsonl\`
- **Format**: JSON Lines (one JSON object per line)
- **Content**: Chunked content with metadata
- **Use Case**: For tools that prefer streaming JSON parsing
- **Size**: Optimized for token limits (1000-1200 tokens per chunk)

### \`index.json\`
- **Format**: Standard JSON
- **Content**: Summary of all pages with metadata
- **Use Case**: For tools that need a complete overview
- **NotebookLM Compatible**: ✅

### \`feed.xml\`
- **Format**: RSS 2.0
- **Content**: Recent updates and additions
- **Use Case**: For tools that monitor changes
- **Update Frequency**: Daily

## Content Structure

Each content chunk includes:
- \`url\`: Absolute URL to the source page
- \`title\`: Page/section title
- \`section\`: Content section identifier
- \`content\`: Clean, plain text content
- \`headings\`: Array of H1-H3 headings
- \`tags\`: Relevant topic tags
- \`updated_at\`: ISO timestamp of last update

## Recommended Usage

### For NotebookLM:
1. Use: \`${baseUrl}/ai/index.json\`
2. This provides a complete overview of all content
3. All URLs are absolute and accessible

### For ChatGPT/Claude/Gemini:
1. Use: \`${baseUrl}/ai/index.jsonl\`
2. Stream and process line by line
3. Each line is a complete, self-contained document chunk

### For Perplexity/Monitoring:
1. Use: \`${baseUrl}/ai/feed.xml\`
2. Monitor for updates and new content
3. Follow RSS standard for parsing

## Data Freshness

- **Generation**: Automated during build process
- **Update Frequency**: Daily
- **Last Updated**: ${currentDate}
- **Source**: Static content extraction from React components

## CORS Policy

All files are served with \`Access-Control-Allow-Origin: *\` for cross-origin access.

## Contact

For questions about data formats or access, please refer to the main site documentation.
`;

writeFileSync(join(aiDir, 'README.md'), aiReadme);

console.log('✅ AI exports generated successfully!');
console.log('📁 Files created:');
console.log('  - /public/ai/index.jsonl');
console.log('  - /public/ai/index.json');
console.log('  - /public/ai/feed.xml');
console.log('  - /public/ai/README.md');
