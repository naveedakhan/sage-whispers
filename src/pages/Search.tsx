import { useState, useEffect } from "react";
import { InstructionsList } from "@/components/InstructionsList";
import { SearchInput } from "@/components/SearchInput";
import { FilterBar } from "@/components/FilterBar";
import { AppNavigation } from "@/components/AppNavigation";
import { supabase } from "@/integrations/supabase/client";

interface Tag {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

const Search = () => {
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
          <div className="mb-6">
            <AppNavigation showBackToHome={true} />
          </div>
          
          {/* Page Title */}
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">
              Search Instructions
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Find the perfect instruction for any situation. Search through thousands of life lessons and practical guidance.
            </p>
          </div>
        </header>

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

export default Search;