import { useState, useEffect } from "react";
import { InstructionCard } from "@/components/InstructionCard";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Instruction {
  id: number;
  text: string;
  authors: { name: string } | null;
  instruction_tags: { tags: { id: number; name: string } }[];
  instruction_categories: { categories: { id: number; name: string } }[];
}

interface InstructionsListProps {
  searchQuery: string;
  selectedTags: number[];
  selectedCategories: number[];
  tags: { id: number; name: string }[];
  categories: { id: number; name: string }[];
}

const ITEMS_PER_PAGE = 20;

export const InstructionsList = ({
  searchQuery,
  selectedTags,
  selectedCategories,
  tags,
  categories,
}: InstructionsListProps) => {
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(0);
    setInstructions([]);
    setHasMore(true);
    setError(null);
  }, [searchQuery, selectedTags, selectedCategories]);

  // Fetch instructions (random if no filters, search otherwise)
  useEffect(() => {
    fetchInstructions(page === 0);
  }, [searchQuery, selectedTags, selectedCategories, page]);

  const fetchInstructions = async (isFirstPage = false) => {
    try {
      if (isFirstPage) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const hasFilters = searchQuery.trim() || selectedTags.length > 0 || selectedCategories.length > 0;

      if (!hasFilters) {
        // Load random instructions when no filters are applied
        const { data, error: fetchError } = await supabase.rpc('get_random_instructions', {
          result_limit: 20
        });

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          // Transform the data to match the expected format
          const transformedData = data.map((item: any) => ({
            id: item.instruction_id,
            text: item.text,
            authors: null, // Authors not included in the random function yet
            instruction_tags: item.tags?.map((tag: string) => ({ tags: { id: 0, name: tag } })) || [],
            instruction_categories: item.categories?.map((cat: string) => ({ categories: { id: 0, name: cat } })) || []
          }));

          setInstructions(transformedData);
          setHasMore(false); // No pagination for random results
        }
      } else {
        // Use the secure search function when filters are applied
        const tagNames = selectedTags.length > 0 ? 
          tags.filter(tag => selectedTags.includes(tag.id)).map(tag => tag.name) : [];
        const categoryNames = selectedCategories.length > 0 ? 
          categories.filter(cat => selectedCategories.includes(cat.id)).map(cat => cat.name) : [];

        const { data, error: fetchError } = await supabase.rpc('search_instructions_secure', {
          search_term: searchQuery.trim(),
          tag_filters: tagNames,
          category_filters: categoryNames,
          result_limit: (page + 1) * ITEMS_PER_PAGE
        });

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          // Transform the data to match the expected format
          const transformedData = data.map((item: any) => ({
            id: item.instruction_id,
            text: item.text,
            authors: null, // Authors not included in the search function yet
            instruction_tags: item.tags?.map((tag: string) => ({ tags: { id: 0, name: tag } })) || [],
            instruction_categories: item.categories?.map((cat: string) => ({ categories: { id: 0, name: cat } })) || []
          }));

          if (isFirstPage || page === 0) {
            setInstructions(transformedData);
          } else {
            // For pagination with search, we need to slice the results
            const startIndex = page * ITEMS_PER_PAGE;
            const newItems = transformedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
            setInstructions(prev => [...prev, ...newItems]);
          }

          setHasMore(transformedData.length === (page + 1) * ITEMS_PER_PAGE);
        }
      }
    } catch (err) {
      console.error("Error fetching instructions:", err);
      setError("Failed to load instructions. Please try again.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center mb-8">All Instructions</h2>
        <div className="grid gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-destructive mb-4">{error}</div>
        <Button onClick={() => fetchInstructions(true)} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  const hasFilters = searchQuery.trim() || selectedTags.length > 0 || selectedCategories.length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          {hasFilters ? "Search Results" : "All Instructions"}
        </h2>
        <p className="text-muted-foreground">
          {instructions.length} instruction{instructions.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {instructions.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No instructions found</h3>
          <p className="text-muted-foreground mb-4">
            {hasFilters
              ? "Try adjusting your search terms or filters to find what you're looking for."
              : "There are no instructions available at the moment."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {instructions.map((instruction) => (
              <InstructionCard key={instruction.id} instruction={instruction} />
            ))}
          </div>

          {hasMore && (
            <div className="text-center">
              <Button
                onClick={loadMore}
                disabled={isLoadingMore}
                variant="outline"
                size="lg"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More Instructions"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};