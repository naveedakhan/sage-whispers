import { RandomInstructionHero } from "@/components/RandomInstructionHero";
import { AppNavigation } from "@/components/AppNavigation";
import { Link } from "react-router-dom";
const posterImage = "/lovable-uploads/0361c2d5-17d6-4050-ab2a-aefaf3a157b0.png";

const Index = () => {

  return (
    <div className="h-screen flex flex-col justify-between bg-background">
        <div className="container mx-auto px-4 py-2 flex flex-col justify-between flex-grow">
        {/* Header */}
        <header className="mb-8">
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
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2">
                Life's Little Instruction Engine
              </h1>
              <p className="text-sm md:text-base text-muted-foreground leading-snug">
                Discover timeless wisdom and practical guidance for living a fulfilling life.
                Search through thousands of life instructions to find exactly what you need.
              </p>
            </div>
          </div>
        </header>

        {/* Random Daily Instruction */}
        <RandomInstructionHero />

        {/* Search Instructions Button */}
        <div className="text-center mb-2 mt-1">
          <Link 
            to="/search"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Search Instructions
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;