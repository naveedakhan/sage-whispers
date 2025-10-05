import { useState, useEffect, useCallback } from "react";
import { InstructionCard } from "@/components/InstructionCard";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Category, Tag } from "@/types/filters";

interface Instruction {
  id: number;
  text: string;
  authors: { name: string } | null;
  instruction_tags: { tags: { id: string | number; name: string } }[];
  instruction_categories: { categories: { id: string | number; name: string } }[];
}

interface InstructionsListProps {
  searchQuery: string;
  selectedTags: number[];
  selectedCategories: number[];
  tags: Tag[];
  categories: Category[];
  searchMode: 'database' | 'local';
  onInstructionsLoaded: (hasInstructions: boolean) => void;
}

const ITEMS_PER_PAGE = 20;

type RawInstruction = {
  instruction_id: number;
  text: string;
  tags?: string[];
  categories?: string[];
};

const transformInstructionData = (data: RawInstruction[]): Instruction[] =>
  data.map((item) => ({
    id: item.instruction_id,
    text: item.text,
    authors: null,
    instruction_tags:
      item.tags?.map((tag, tagIndex) => ({
        tags: { id: `${item.instruction_id}-tag-${tagIndex}`, name: tag },
      })) ?? [],
    instruction_categories:
      item.categories?.map((category, categoryIndex) => ({
        categories: {
          id: `${item.instruction_id}-cat-${categoryIndex}`,
          name: category,
        },
      })) ?? [],
  }));

const buildFilterNames = (
  selectedIds: number[],
  options: Array<{ id: number; name: string }>,
) =>
  selectedIds.length > 0
    ? options
        .filter(option => selectedIds.includes(option.id))
        .map(option => option.name)
    : [];

export const InstructionsList = ({
  searchQuery,
  selectedTags,
  selectedCategories,
  tags,
  categories,
  searchMode,
  onInstructionsLoaded,
}: InstructionsListProps) => {
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [allInstructions, setAllInstructions] = useState<Instruction[]>([]);
  // Store all loaded instructions for local filtering
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Filter instructions locally when in local mode
  const filterInstructionsLocally = useCallback((
    searchTerm: string,
    tagFilters: number[],
    categoryFilters: number[],
  ) => {
    if (!allInstructions.length) return [];

    return allInstructions.filter(instruction => {
      const matchesSearch =
        !searchTerm || instruction.text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTags =
        tagFilters.length === 0 ||
        instruction.instruction_tags.some(it => tagFilters.includes(Number(it.tags.id)));
      const matchesCategories =
        categoryFilters.length === 0 ||
        instruction.instruction_categories.some(ic => categoryFilters.includes(Number(ic.categories.id)));

      return matchesSearch && matchesTags && matchesCategories;
    });
  }, [allInstructions]);

  // Reset pagination when filters change or mode changes
  useEffect(() => {
    if (searchMode === 'database') {
      setPage(0);
      setInstructions([]);
      setHasMore(true);
      setError(null);
    } else {
      // For local mode, filter the existing instructions
      const filtered = filterInstructionsLocally(searchQuery, selectedTags, selectedCategories);
      setInstructions(filtered);
      setHasMore(false); // No pagination for local filtering
    }
  }, [filterInstructionsLocally, searchMode, searchQuery, selectedCategories, selectedTags]);

  const applyFetchedInstructions = useCallback(
    (data: RawInstruction[] | null, isInitialPage: boolean) => {
      if (!data || data.length === 0) {
        if (isInitialPage) {
          setInstructions([]);
          setAllInstructions([]);
          onInstructionsLoaded(false);
        }

        setHasMore(false);
        return;
      }

      const transformedData = transformInstructionData(data);
      const hasMoreItems = transformedData.length > ITEMS_PER_PAGE;
      const itemsToShow = hasMoreItems
        ? transformedData.slice(0, ITEMS_PER_PAGE)
        : transformedData;

      if (isInitialPage) {
        setInstructions(itemsToShow);
        setAllInstructions(itemsToShow);
        onInstructionsLoaded(itemsToShow.length > 0);
      } else {
        setInstructions(prev => [...prev, ...itemsToShow]);
        setAllInstructions(prev => [...prev, ...itemsToShow]);
      }

      setHasMore(hasMoreItems);
    },
    [onInstructionsLoaded],
  );

  const fetchInstructions = useCallback(async (isFirstPage = false) => {
    const isInitialPage = isFirstPage || page === 0;

    try {
      if (isInitialPage) {
        setError(null);
      }

      if (isInitialPage) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const hasFilters = searchQuery.trim() || selectedTags.length > 0 || selectedCategories.length > 0;

      if (!hasFilters) {
        // Load random instructions when no filters are applied
        const { data, error: fetchError } = await supabase.rpc('get_random_instructions', {
          result_limit: ITEMS_PER_PAGE + 1 // Get one extra to check if there are more
        });

        if (fetchError) {
          throw fetchError;
        }

        applyFetchedInstructions(data as RawInstruction[] | null, isInitialPage);
      } else {
        // Use the secure search function when filters are applied
        const tagNames = buildFilterNames(selectedTags, tags);
        const categoryNames = buildFilterNames(selectedCategories, categories);

        const { data, error: fetchError } = await supabase.rpc('search_instructions_secure', {
          search_term: searchQuery.trim(),
          tag_filters: tagNames,
          category_filters: categoryNames,
          result_limit: ITEMS_PER_PAGE + 1 // Get one extra to check if there are more
        });

        if (fetchError) {
          throw fetchError;
        }

        applyFetchedInstructions(data as RawInstruction[] | null, isInitialPage);
      }
    } catch (err) {
      console.error("Error fetching instructions:", err);
      setError("Failed to load instructions. Please try again.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [applyFetchedInstructions, categories, page, selectedCategories, selectedTags, searchQuery, tags]);

  // Fetch instructions only in database mode
  useEffect(() => {
    if (searchMode === 'database') {
      fetchInstructions(page === 0);
    }
  }, [fetchInstructions, page, searchMode]);

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
  const isSearchMode = searchMode === 'database' && hasFilters;
  const isLocalMode = searchMode === 'local';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          {isSearchMode ? "Search Results" : 
           isLocalMode ? "Filtered Results" : 
           "All Instructions"}
        </h2>
        <p className="text-muted-foreground">
          {instructions.length} instruction{instructions.length !== 1 ? 's' : ''} 
          {isLocalMode ? ` (filtered from ${allInstructions.length} loaded)` : ' found'}
        </p>
      </div>

      {instructions.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No instructions found</h3>
          <p className="text-muted-foreground mb-4">
            {isSearchMode || isLocalMode
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

          {hasMore && searchMode === 'database' && (
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