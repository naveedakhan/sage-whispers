import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🔍 Verifying SEO setup...\n');

const filesToCheck = [
  'public/robots.txt',
  'public/sitemap.xml',
  'public/manifest.webmanifest',
  'public/favicon.ico',
  'public/icon-192.png',
  'public/icon-512.png'
];

let allGood = true;

filesToCheck.forEach(file => {
  const filePath = join(process.cwd(), file);
  if (existsSync(filePath)) {
    console.log(`✅ ${file} - exists`);
  } else {
    console.log(`❌ ${file} - missing`);
    allGood = false;
  }
});

// Check robots.txt content
try {
  const robotsContent = readFileSync(join(process.cwd(), 'public/robots.txt'), 'utf8');
  if (robotsContent.includes('daily-wisdom.com')) {
    console.log('✅ robots.txt - contains correct domain');
  } else {
    console.log('❌ robots.txt - missing correct domain');
    allGood = false;
  }
} catch (error) {
  console.log('❌ robots.txt - could not read');
  allGood = false;
}

// Check sitemap.xml content
try {
  const sitemapContent = readFileSync(join(process.cwd(), 'public/sitemap.xml'), 'utf8');
  if (sitemapContent.includes('daily-wisdom.com')) {
    console.log('✅ sitemap.xml - contains correct domain');
  } else {
    console.log('❌ robots.txt - missing correct domain');
    allGood = false;
  }
} catch (error) {
  console.log('❌ sitemap.xml - could not read');
  allGood = false;
}

// Check manifest.webmanifest content
try {
  const manifestContent = readFileSync(join(process.cwd(), 'public/manifest.webmanifest'), 'utf8');
  const manifest = JSON.parse(manifestContent);
  if (manifest.name === 'Daily Wisdom' && manifest.theme_color === '#b47b2b') {
    console.log('✅ manifest.webmanifest - correct configuration');
  } else {
    console.log('❌ manifest.webmanifest - incorrect configuration');
    allGood = false;
  }
} catch (error) {
  console.log('❌ manifest.webmanifest - could not read or parse');
  allGood = false;
}

console.log('\n' + (allGood ? '🎉 All SEO files are properly configured!' : '⚠️  Some issues found. Please review the errors above.'));
