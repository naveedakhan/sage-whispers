import { useState, useEffect } from "react";
import { RandomInstructionHero } from "@/components/RandomInstructionHero";
import { InstructionsList } from "@/components/InstructionsList";
import { SearchInput } from "@/components/SearchInput";
import { FilterBar } from "@/components/FilterBar";
import { AppNavigation } from "@/components/AppNavigation";
import { supabase } from "@/integrations/supabase/client";
const posterImage = "/lovable-uploads/0361c2d5-17d6-4050-ab2a-aefaf3a157b0.png";

interface Tag {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchMode, setSearchMode] = useState<'database' | 'local'>('database');
  const [hasLoadedInstructions, setHasLoadedInstructions] = useState(false);

  // Load initial data and restore state from localStorage
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Fetch tags and categories
        const [tagsResult, categoriesResult] = await Promise.all([
          supabase.from("tags").select("*").order("name"),
          supabase.from("categories").select("*").order("name")
        ]);

        if (tagsResult.data) setTags(tagsResult.data);
        if (categoriesResult.data) setCategories(categoriesResult.data);

        // Restore state from localStorage
        const savedSearch = localStorage.getItem("instructionSearch");
        const savedTags = localStorage.getItem("selectedTags");
        const savedCategories = localStorage.getItem("selectedCategories");

        if (savedSearch) setSearchQuery(savedSearch);
        if (savedTags) setSelectedTags(JSON.parse(savedTags));
        if (savedCategories) setSelectedCategories(JSON.parse(savedCategories));
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem("instructionSearch", searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem("selectedTags", JSON.stringify(selectedTags));
  }, [selectedTags]);

  useEffect(() => {
    localStorage.setItem("selectedCategories", JSON.stringify(selectedCategories));
  }, [selectedCategories]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
    setSelectedCategories([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-64 bg-muted rounded-lg mb-8"></div>
            <div className="h-12 bg-muted rounded mb-4"></div>
            <div className="h-16 bg-muted rounded mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="mb-4">
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

        {/* Random Daily Instruction */}
        <RandomInstructionHero />

        {/* Search and Filters */}
        <div className="mb-12 space-y-6 relative">
            <SearchInput 
              value={searchQuery} 
              onChange={setSearchQuery}
              searchMode={searchMode}
              onSearchModeChange={setSearchMode}
              hasLoadedInstructions={hasLoadedInstructions}
            />
          
          <FilterBar
            tags={tags}
            categories={categories}
            selectedTags={selectedTags}
            selectedCategories={selectedCategories}
            onTagsChange={setSelectedTags}
            onCategoriesChange={setSelectedCategories}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Instructions List */}
            <InstructionsList
              searchQuery={searchQuery}
              selectedTags={selectedTags}
              selectedCategories={selectedCategories}
              tags={tags}
              categories={categories}
              searchMode={searchMode}
              onInstructionsLoaded={setHasLoadedInstructions}
            />
      </div>
    </div>
  );
};

export default Index;