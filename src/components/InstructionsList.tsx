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
}

const ITEMS_PER_PAGE = 20;

export const InstructionsList = ({
  searchQuery,
  selectedTags,
  selectedCategories,
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

  // Fetch instructions
  useEffect(() => {
    fetchInstructions(true);
  }, [searchQuery, selectedTags, selectedCategories, page]);

  const fetchInstructions = async (isFirstPage = false) => {
    try {
      if (isFirstPage) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      let query = supabase
        .from("instructions")
        .select(`
          id,
          text,
          authors (
            name
          ),
          instruction_tags (
            tags (
              id,
              name
            )
          ),
          instruction_categories (
            categories (
              id,
              name
            )
          )
        `)
        .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1)
        .order("id");

      // Apply search filter
      if (searchQuery.trim()) {
        // For search, we'll use a text search approach
        // This is a basic implementation - for better search, consider using full-text search
        query = query.or(`text.ilike.%${searchQuery}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        // Filter by tags and categories on the client side
        // In a production app, you'd want to do this filtering in the database
        let filteredData = data;

        if (selectedTags.length > 0) {
          filteredData = filteredData.filter(instruction =>
            instruction.instruction_tags.some(it =>
              selectedTags.includes(it.tags.id)
            )
          );
        }

        if (selectedCategories.length > 0) {
          filteredData = filteredData.filter(instruction =>
            instruction.instruction_categories.some(ic =>
              selectedCategories.includes(ic.categories.id)
            )
          );
        }

        // Additional text search for authors, tags, and categories
        if (searchQuery.trim()) {
          const searchLower = searchQuery.toLowerCase();
          filteredData = filteredData.filter(instruction => {
            const textMatch = instruction.text.toLowerCase().includes(searchLower);
            const authorMatch = instruction.authors?.name.toLowerCase().includes(searchLower);
            const tagMatch = instruction.instruction_tags.some(it =>
              it.tags.name.toLowerCase().includes(searchLower)
            );
            const categoryMatch = instruction.instruction_categories.some(ic =>
              ic.categories.name.toLowerCase().includes(searchLower)
            );
            
            return textMatch || authorMatch || tagMatch || categoryMatch;
          });
        }

        if (isFirstPage || page === 0) {
          setInstructions(filteredData);
        } else {
          setInstructions(prev => [...prev, ...filteredData]);
        }

        setHasMore(data.length === ITEMS_PER_PAGE);
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