import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const PlainText = () => {
  const [searchParams] = useSearchParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = searchParams.get('path') || '/';
    
    // Generate plain text content based on the path
    const generatePlainTextContent = (path: string) => {
      switch (path) {
        case '/':
          return `Daily Wisdom - Life's Little Instruction Engine

Discover timeless wisdom and practical guidance for living a fulfilling life. Search through thousands of life instructions to find exactly what you need.

Our mission is to provide curated life instructions that help people navigate daily challenges and make better decisions. Each instruction is carefully selected to offer practical, actionable advice that can be applied to real-life situations.

Features:
- Random Daily Instructions: Discover new wisdom every day
- Advanced Search: Find specific instructions by tags, categories, or keywords
- Responsive Design: Works seamlessly on desktop and mobile devices
- Modern UI: Built with shadcn/ui components and Tailwind CSS

Whether you're looking for motivation, guidance, or inspiration, Daily Wisdom provides a comprehensive collection of life instructions from great thinkers and practical wisdom traditions.

Visit https://www.daily-wisdom.com for the full interactive experience.`;

        case '/search':
          return `Search Instructions - Daily Wisdom

Find the perfect instruction for any situation. Search through thousands of life lessons and practical guidance on Daily Wisdom.

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

Each search result includes the instruction text, relevant tags, categories, and source information when available.

Visit https://www.daily-wisdom.com/search for the full interactive experience.`;

        case '/about':
          return `About Daily Wisdom

Learn about Daily Wisdom - Life's Little Instruction Engine. Discover our mission to provide timeless wisdom and practical guidance for living a fulfilling life.

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
- Positive impact potential

Visit https://www.daily-wisdom.com/about for the full interactive experience.`;

        default:
          return `Daily Wisdom - ${path}

This page is available in plain text format for accessibility and AI ingestion.

For the full interactive experience, visit: https://www.daily-wisdom.com${path}

About Daily Wisdom:
Daily Wisdom is Life's Little Instruction Engine. We provide timeless wisdom and practical guidance for living a fulfilling life through curated life instructions.

Our mission is to democratize access to life guidance and make practical wisdom accessible to everyone.

Visit https://www.daily-wisdom.com for more information.`;
      }
    };

    setContent(generatePlainTextContent(path));
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return <pre>Loading...</pre>;
  }

  return (
    <pre style={{ 
      whiteSpace: 'pre-wrap', 
      fontFamily: 'monospace',
      padding: '20px',
      margin: '0',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      {content}
    </pre>
  );
};

export default PlainText;
