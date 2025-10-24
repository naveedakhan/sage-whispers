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
  author_name?: string | null;
  tags?: string[];
  categories?: string[];
};

const escapeForILike = (value: string) =>
  value.replace(/[%_\\]/g, (match) => `\\${match}`);

const transformInstructionData = (data: RawInstruction[]): Instruction[] =>
  data.map((item) => ({
    id: item.instruction_id,
    text: item.text,
    authors: item.author_name ? { name: item.author_name } : null,
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

const mergeInstructions = (existing: Instruction[], incoming: Instruction[]) => {
  if (!existing.length) {
    return incoming;
  }

  const seen = new Set(existing.map(item => item.id));
  const dedupedIncoming = incoming.filter(item => !seen.has(item.id));
  return [...existing, ...dedupedIncoming];
};

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
  const [supportsOffset, setSupportsOffset] = useState(true);
  const [supportsSearchRpc, setSupportsSearchRpc] = useState(true);

  // Filter instructions locally when in local mode
  const filterInstructionsLocally = useCallback((
    searchTerm: string,
    tagFilters: number[],
    categoryFilters: number[],
  ) => {
    if (!allInstructions.length) return [];

    const requiredTagNames = buildFilterNames(tagFilters, tags).map(name =>
      name.toLowerCase(),
    );
    const requiredCategoryNames = buildFilterNames(categoryFilters, categories).map(
      name => name.toLowerCase(),
    );

    return allInstructions.filter(instruction => {
      const matchesSearch =
        !searchTerm || instruction.text.toLowerCase().includes(searchTerm.toLowerCase());
      const instructionTagNames = instruction.instruction_tags.map(it =>
        it.tags.name.toLowerCase(),
      );
      const matchesTags =
        requiredTagNames.length === 0 ||
        requiredTagNames.every(tagName => instructionTagNames.includes(tagName));
      const instructionCategoryNames = instruction.instruction_categories.map(ic =>
        ic.categories.name.toLowerCase(),
      );
      const matchesCategories =
        requiredCategoryNames.length === 0 ||
        requiredCategoryNames.some(categoryName =>
          instructionCategoryNames.includes(categoryName),
        );

      return matchesSearch && matchesTags && matchesCategories;
    });
  }, [allInstructions, categories, tags]);

  // Reset pagination when filters change in database mode
  useEffect(() => {
    if (searchMode !== 'database') {
      return;
    }

    setPage(0);
    setInstructions([]);
    setAllInstructions([]);
    setHasMore(true);
    setError(null);
    onInstructionsLoaded(false);
  }, [onInstructionsLoaded, searchMode, searchQuery, selectedCategories, selectedTags]);

  // Re-filter locally when local mode is active
  useEffect(() => {
    if (searchMode !== 'local') {
      return;
    }

    const filtered = filterInstructionsLocally(searchQuery, selectedTags, selectedCategories);
    setInstructions(filtered);
    setHasMore(false); // No pagination for local filtering
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
        setInstructions(prev => mergeInstructions(prev, itemsToShow));
        setAllInstructions(prev => mergeInstructions(prev, itemsToShow));
      }

      setHasMore(hasMoreItems);
    },
    [onInstructionsLoaded],
  );

  const fetchInstructions = useCallback(async (isFirstPage = false) => {
    const isInitialPage = isFirstPage || page === 0;

    if (isInitialPage) {
      setError(null);
    }

    if (isInitialPage) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    const finishLoading = () => {
      setIsLoading(false);
      setIsLoadingMore(false);
    };

    const hasFilters = searchQuery.trim() || selectedTags.length > 0 || selectedCategories.length > 0;
    const offset = supportsOffset ? page * ITEMS_PER_PAGE : 0;

    if (!hasFilters) {
      try {
        const { data, error: fetchError } = await supabase.rpc('get_random_instructions', {
          result_limit: ITEMS_PER_PAGE + 1, // Get one extra to check if there are more
        });

        if (fetchError) {
          throw fetchError;
        }

        applyFetchedInstructions(data as RawInstruction[] | null, isInitialPage);
      } catch (err) {
        console.error("Error fetching instructions:", err);
        setError("Failed to load instructions. Please try again.");
      } finally {
        finishLoading();
      }

      return;
    }

    const tagNames = buildFilterNames(selectedTags, tags);
    const categoryNames = buildFilterNames(selectedCategories, categories);

    const runFallbackSearch = async (): Promise<RawInstruction[]> => {
      let query = supabase
        .from("instructions")
        .select(
          `
            id,
            text,
            authors (
              name
            ),
            instruction_tags (
              tags ( name )
            ),
            instruction_categories (
              categories ( name )
            )
          `
        )
        .order("id", { ascending: true })
        .range(offset, offset + ITEMS_PER_PAGE); // inclusive end gives ITEMS_PER_PAGE + 1

      if (searchQuery.trim()) {
        const escapedTerm = escapeForILike(searchQuery.trim());
        query = query.ilike("text", `%${escapedTerm}%`);
      }

      const { data: fallbackData, error: fallbackError } = await query;

      if (fallbackError) {
        throw fallbackError;
      }

      const normalized: RawInstruction[] = (fallbackData ?? []).map((row: any) => ({
        instruction_id: row.id,
        text: row.text,
        author_name: row.authors?.name ?? null,
        tags:
          (row.instruction_tags ?? [])
            .map((relation: any) => relation?.tags?.name)
            .filter(Boolean) ?? [],
        categories:
          (row.instruction_categories ?? [])
            .map((relation: any) => relation?.categories?.name)
            .filter(Boolean) ?? [],
      }));

      const lowerTagNames = tagNames.map(name => name.toLowerCase());
      const lowerCategoryNames = categoryNames.map(name => name.toLowerCase());

      return normalized.filter((item) => {
        const itemTags = (item.tags ?? []).map(name => name.toLowerCase());
        const itemCategories = (item.categories ?? []).map(name => name.toLowerCase());

        const matchesTags =
          !lowerTagNames.length ||
          lowerTagNames.every(tag => itemTags.includes(tag));

        const matchesCategories =
          !lowerCategoryNames.length ||
          itemCategories.some(category => lowerCategoryNames.includes(category));

        return matchesTags && matchesCategories;
      });
    };

    const baseParams = {
      search_term: searchQuery.trim(),
      tag_filters: tagNames.length ? tagNames : null,
      category_filters: categoryNames.length ? categoryNames : null,
      result_limit: ITEMS_PER_PAGE + 1, // Get one extra to check if there are more
    };

    const includeOffset = supportsOffset && supportsSearchRpc && offset > 0;

    const paramsWithOffset = includeOffset
      ? { ...baseParams, result_offset: offset }
      : baseParams;

    const useRpcSearch = supportsSearchRpc;

    if (useRpcSearch) {
      let rpcFailedDueToMissingFunction = false;

      try {
        let { data, error: fetchError } = await supabase.rpc('search_instructions_secure', paramsWithOffset);

        if (fetchError && includeOffset) {
          const offsetError = String(fetchError.message || "").toLowerCase().includes("result_offset");
          if (offsetError) {
            console.warn("search_instructions_secure does not support result_offset, falling back to first-page only mode.");
            setSupportsOffset(false);
            setHasMore(false);
            ({ data, error: fetchError } = await supabase.rpc('search_instructions_secure', baseParams));
          }
        }

        if (fetchError) {
          const message = typeof fetchError.message === "string" ? fetchError.message.toLowerCase() : "";
          const missingFunction =
            fetchError.code === "PGRST202" ||
            fetchError.code === "404" ||
            message.includes("does not exist") ||
            message.includes("not found");

          if (missingFunction) {
            console.warn("search_instructions_secure RPC is unavailable; switching to direct table queries.");
            setSupportsSearchRpc(false);
            rpcFailedDueToMissingFunction = true;
          } else {
            throw fetchError;
          }
        }

        if (data && !rpcFailedDueToMissingFunction) {
          applyFetchedInstructions(data as RawInstruction[] | null, isInitialPage);
          finishLoading();
          return;
        }
      } catch (err) {
        console.error("Error fetching instructions via RPC:", err);
      }
    }

    try {
      const fallbackData = await runFallbackSearch();
      applyFetchedInstructions(fallbackData, isInitialPage);
      setError(null);
    } catch (fallbackErr) {
      console.error("Fallback search failed:", fallbackErr);
      setError("Failed to load instructions. Please try again.");
    } finally {
      finishLoading();
    }
  }, [applyFetchedInstructions, categories, page, searchQuery, selectedCategories, selectedTags, supportsOffset, supportsSearchRpc, tags]);

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
        <Button onClick={() => fetchInstructions(page === 0)} variant="outline">
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
