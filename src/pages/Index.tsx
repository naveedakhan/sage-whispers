import { RandomInstructionHero } from "@/components/RandomInstructionHero";
import { AppNavigation } from "@/components/AppNavigation";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import posterImage from "@/assets/poster.png";

const Index = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Daily Wisdom",
    "url": "https://www.daily-wisdom.com",
    "description": "Life's Little Instruction Engine — Discover timeless wisdom and practical guidance for living a fulfilling life.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.daily-wisdom.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <SEO 
        title="Daily Wisdom"
        description="Life's Little Instruction Engine — Discover timeless wisdom and practical guidance for living a fulfilling life. Search through thousands of life instructions to find exactly what you need."
        structuredData={structuredData}
      />
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="py-6">
        <div className="mb-6">
          <AppNavigation />
        </div>
        
        {/* Hero Section - Responsive Layout */}
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 max-w-4xl mx-auto">
          {/* Poster Image */}
          <div className="flex-shrink-0 order-2 md:order-1">
            <img 
              src={posterImage} 
              alt="Life's Little Instruction Engine" 
              className="w-24 md:w-28 h-auto rounded-lg shadow-lg"
            />
          </div>
          
          {/* Text Content */}
          <div className="text-center md:text-left order-1 md:order-2 max-w-lg md:max-w-none">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3">
              Life's Little Instruction Engine
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Discover timeless wisdom and practical guidance for living a fulfilling life.
              Search through thousands of life instructions to find exactly what you need.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Area - Evenly Spaced */}
      <div className="flex flex-col justify-center space-y-8 pb-8">
        {/* Random Daily Instruction */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-4xl">
            <RandomInstructionHero />
          </div>
        </div>

        {/* Search Instructions Button */}
        <div className="text-center">
          <Link 
            to="/search"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Search Instructions
          </Link>
        </div>
      </div>
      </div>
    </>
  );
};

export default Index;