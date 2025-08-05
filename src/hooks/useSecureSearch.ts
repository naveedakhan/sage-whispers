import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface SearchResult {
  instruction_id: number;
  text: string;
  source_id: number;
  tags: string[];
  categories: string[];
}

export const useSecureSearch = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const { toast } = useToast();

  const search = useCallback(async (
    searchTerm: string = '',
    tagFilters: string[] = [],
    categoryFilters: string[] = []
  ) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('search_instructions_secure', {
        search_term: searchTerm,
        tag_filters: tagFilters,
        category_filters: categoryFilters,
        result_limit: 50
      });

      if (error) {
        console.error('Search error:', error);
        toast({
          title: "Search failed",
          description: "Unable to perform search. Please try again.",
          variant: "destructive",
        });
        setResults([]);
        return;
      }

      setResults(data || []);
    } catch (err) {
      console.error('Unexpected search error:', err);
      toast({
        title: "Search error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    search,
    loading,
    results,
  };
};