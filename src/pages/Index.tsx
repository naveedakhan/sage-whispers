import { useState, useEffect } from "react";
import { RandomInstructionHero } from "@/components/RandomInstructionHero";
import { InstructionsList } from "@/components/InstructionsList";
import { SearchInput } from "@/components/SearchInput";
import { FilterBar } from "@/components/FilterBar";
import { supabase } from "@/integrations/supabase/client";
import posterImage from "@/assets/poster.webp";

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
        <header className="text-center mb-12">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl md:text-6xl font-bold text-primary mx-auto">
              Life's Little Instruction Engine
            </h1>
            <nav className="absolute right-4">
              <a href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                About
              </a>
            </nav>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover timeless wisdom and practical guidance for living a fulfilling life.
            Search through thousands of life instructions to find exactly what you need.
          </p>
        </header>

        {/* Poster Image */}
        <div className="flex justify-center mb-12">
          <img 
            src={posterImage} 
            alt="Life's Little Instruction Engine" 
            className="max-w-xs w-full h-auto rounded-lg shadow-lg"
          />
        </div>

        {/* Random Daily Instruction */}
        <RandomInstructionHero />

        {/* Search and Filters */}
        <div className="mb-8 space-y-6">
          <SearchInput 
            value={searchQuery} 
            onChange={setSearchQuery} 
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
        />
      </div>
    </div>
  );
};

export default Index;