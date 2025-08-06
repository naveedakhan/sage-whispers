import { RandomInstructionHero } from "@/components/RandomInstructionHero";
import { AppNavigation } from "@/components/AppNavigation";
import { Link } from "react-router-dom";

const posterImage = "/lovable-uploads/0361c2d5-17d6-4050-ab2a-aefaf3a157b0.png";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* HEADER + HERO */}
      <div className="flex-shrink-0 container mx-auto px-4 py-4">
        <AppNavigation />
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 mt-4">
          <img
            src={posterImage}
            alt="Life's Little Instruction Engine"
            className="w-20 md:w-24 h-auto rounded-lg shadow"
          />
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-primary mb-1">
              Life's Little Instruction Engine
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-snug">
              Discover timeless wisdom and practical guidance for living a fulfilling life.
              Search through thousands of life instructions to find exactly what you need.
            </p>
          </div>
        </div>
      </div>

      {/* INSTRUCTION CARD (scrolls internally if too tall) */}
      <div className="flex-shrink-0 container mx-auto px-4">
        <RandomInstructionHero />
      </div>

      {/* CTA BUTTON */}
      <div className="flex-shrink-0 container mx-auto px-4 text-center mt-4 mb-6">
        <Link
          to="/search"
          className="inline-flex items-center px-6 py-3 text-base font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow"
        >
          Search Instructions
        </Link>
      </div>
    </div>
  );
};

export default Index;
