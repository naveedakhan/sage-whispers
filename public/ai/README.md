# Daily Wisdom - AI Data Sources

This directory contains machine-readable exports of Daily Wisdom content for AI tools and LLM ingestion.

## Available Files

### `index.jsonl`
- **Format**: JSON Lines (one JSON object per line)
- **Content**: Chunked content with metadata
- **Use Case**: For tools that prefer streaming JSON parsing
- **Size**: Optimized for token limits (1000-1200 tokens per chunk)

### `index.json`
- **Format**: Standard JSON
- **Content**: Summary of all pages with metadata
- **Use Case**: For tools that need a complete overview
- **NotebookLM Compatible**: ✅

### `feed.xml`
- **Format**: RSS 2.0
- **Content**: Recent updates and additions
- **Use Case**: For tools that monitor changes
- **Update Frequency**: Daily

## Content Structure

Each content chunk includes:
- `url`: Absolute URL to the source page
- `title`: Page/section title
- `section`: Content section identifier
- `content`: Clean, plain text content
- `headings`: Array of H1-H3 headings
- `tags`: Relevant topic tags
- `updated_at`: ISO timestamp of last update

## Recommended Usage

### For NotebookLM:
1. Use: `https://www.daily-wisdom.com/ai/index.json`
2. This provides a complete overview of all content
3. All URLs are absolute and accessible

### For ChatGPT/Claude/Gemini:
1. Use: `https://www.daily-wisdom.com/ai/index.jsonl`
2. Stream and process line by line
3. Each line is a complete, self-contained document chunk

### For Perplexity/Monitoring:
1. Use: `https://www.daily-wisdom.com/ai/feed.xml`
2. Monitor for updates and new content
3. Follow RSS standard for parsing

## Data Freshness

- **Generation**: Automated during build process
- **Update Frequency**: Daily
- **Last Updated**: 2025-10-05T11:49:33.574Z
- **Source**: Static content extraction from React components

## CORS Policy

All files are served with `Access-Control-Allow-Origin: *` for cross-origin access.

## Contact

For questions about data formats or access, please refer to the main site documentation.
