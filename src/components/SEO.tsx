import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
  structuredData?: object;
}

const SEO: React.FC<SEOProps> = ({
  title = 'Daily Wisdom',
  description = "Life's Little Instruction Engine — Discover timeless wisdom and practical guidance for living a fulfilling life. Search through thousands of life instructions to find exactly what you need.",
  canonical,
  ogImage = 'https://www.daily-wisdom.com/assets/poster-C6OVvjwD.png',
  ogType = 'website',
  noIndex = false,
  structuredData
}) => {
  const fullTitle = title === 'Daily Wisdom' ? title : `${title} | Daily Wisdom`;
  const pathname =
    typeof window !== "undefined" && window.location
      ? window.location.pathname
      : "/";
  const fullCanonical = canonical || `https://www.daily-wisdom.com${pathname}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="theme-color" content="#b47b2b" />
      <link rel="canonical" href={fullCanonical} />
      
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="Daily Wisdom" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Daily Wisdom preview" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
