import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🤖 Verifying LLM Readiness Implementation...\n');

const filesToCheck = [
  'public/robots.txt',
  'public/sitemap.xml',
  'public/ai/index.jsonl',
  'public/ai/index.json',
  'public/ai/feed.xml',
  'public/ai/README.md'
];

let allGood = true;

// Check file existence
filesToCheck.forEach(file => {
  const filePath = join(process.cwd(), file);
  if (existsSync(filePath)) {
    console.log(`✅ ${file} - exists`);
  } else {
    console.log(`❌ ${file} - missing`);
    allGood = false;
  }
});

// Verify robots.txt contains AI crawlers
try {
  const robotsContent = readFileSync(join(process.cwd(), 'public/robots.txt'), 'utf8');
  const aiCrawlers = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'CCBot'];
  const missingCrawlers = aiCrawlers.filter(crawler => !robotsContent.includes(crawler));
  
  if (missingCrawlers.length === 0) {
    console.log('✅ robots.txt - contains all major AI crawlers');
  } else {
    console.log(`❌ robots.txt - missing AI crawlers: ${missingCrawlers.join(', ')}`);
    allGood = false;
  }
} catch (error) {
  console.log('❌ robots.txt - could not read');
  allGood = false;
}

// Verify JSONL format
try {
  const jsonlContent = readFileSync(join(process.cwd(), 'public/ai/index.jsonl'), 'utf8');
  const lines = jsonlContent.trim().split('\n');
  
  if (lines.length > 0) {
    console.log(`✅ index.jsonl - contains ${lines.length} content chunks`);
    
    // Verify each line is valid JSON
    let validJsonLines = 0;
    lines.forEach(line => {
      try {
        JSON.parse(line);
        validJsonLines++;
      } catch (e) {
        // Invalid JSON line
      }
    });
    
    if (validJsonLines === lines.length) {
      console.log('✅ index.jsonl - all lines are valid JSON');
    } else {
      console.log(`❌ index.jsonl - ${lines.length - validJsonLines} invalid JSON lines`);
      allGood = false;
    }
  } else {
    console.log('❌ index.jsonl - empty file');
    allGood = false;
  }
} catch (error) {
  console.log('❌ index.jsonl - could not read');
  allGood = false;
}

// Verify JSON format
try {
  const jsonContent = readFileSync(join(process.cwd(), 'public/ai/index.json'), 'utf8');
  const data = JSON.parse(jsonContent);
  
  if (data.site === 'Daily Wisdom' && data.base_url === 'https://www.daily-wisdom.com' && Array.isArray(data.docs)) {
    console.log(`✅ index.json - valid format with ${data.docs.length} documents`);
  } else {
    console.log('❌ index.json - invalid format or missing required fields');
    allGood = false;
  }
} catch (error) {
  console.log('❌ index.json - could not read or parse');
  allGood = false;
}

// Verify RSS feed
try {
  const rssContent = readFileSync(join(process.cwd(), 'public/ai/feed.xml'), 'utf8');
  if (rssContent.includes('<rss') && rssContent.includes('Daily Wisdom') && rssContent.includes('<item>')) {
    console.log('✅ feed.xml - valid RSS format');
  } else {
    console.log('❌ index.json - invalid RSS format');
    allGood = false;
  }
} catch (error) {
  console.log('❌ feed.xml - could not read');
  allGood = false;
}

// Verify sitemap contains AI files
try {
  const sitemapContent = readFileSync(join(process.cwd(), 'public/sitemap.xml'), 'utf8');
  const aiFiles = ['/ai/index.json', '/ai/index.jsonl', '/ai/feed.xml'];
  const missingAiFiles = aiFiles.filter(file => !sitemapContent.includes(file));
  
  if (missingAiFiles.length === 0) {
    console.log('✅ sitemap.xml - contains all AI export files');
  } else {
    console.log(`❌ sitemap.xml - missing AI files: ${missingAiFiles.join(', ')}`);
    allGood = false;
  }
} catch (error) {
  console.log('❌ sitemap.xml - could not read');
  allGood = false;
}

console.log('\n' + (allGood ? '🎉 All LLM readiness checks passed!' : '⚠️  Some issues found. Please review the errors above.'));
console.log('\n📋 Ready for AI ingestion:');
console.log('  - NotebookLM: https://www.daily-wisdom.com/ai/index.json');
console.log('  - ChatGPT/Claude: https://www.daily-wisdom.com/ai/index.jsonl');
console.log('  - Perplexity: https://www.daily-wisdom.com/ai/feed.xml');
console.log('  - Plain text: https://www.daily-wisdom.com/plain?path=/');
