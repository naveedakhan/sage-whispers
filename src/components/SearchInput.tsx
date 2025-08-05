import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, AlertCircle, Database, Filter } from "lucide-react";
import { debounce } from "@/utils/storage";
import { sanitizeInput, validateSearchInput, searchRateLimiter, createRateLimitKey } from "@/utils/security";
import { useToast } from "@/components/ui/use-toast";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  searchMode: 'database' | 'local';
  onSearchModeChange: (mode: 'database' | 'local') => void;
  hasLoadedInstructions: boolean;
}

export const SearchInput = ({ value, onChange, searchMode, onSearchModeChange, hasLoadedInstructions }: SearchInputProps) => {
  const [localValue, setLocalValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Debounced onChange function with security checks
  const debouncedOnChange = useCallback(
    debounce((searchValue: string) => {
      // Check rate limiting
      const rateLimitKey = createRateLimitKey();
      if (searchRateLimiter.isRateLimited(rateLimitKey)) {
        const remaining = searchRateLimiter.getRemainingRequests(rateLimitKey);
        toast({
          title: "Rate limit exceeded",
          description: `Please wait before searching again. ${remaining} requests remaining.`,
          variant: "destructive",
        });
        return;
      }

      // Validate and sanitize input
      const validation = validateSearchInput(searchValue);
      if (!validation.isValid) {
        setError(validation.error || "Invalid search term");
        toast({
          title: "Invalid search",
          description: validation.error,
          variant: "destructive",
        });
        return;
      }

      setError(null);
      const sanitizedValue = sanitizeInput(searchValue);
      onChange(sanitizedValue);
    }, 300),
    [onChange, toast]
  );

  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Basic client-side length check for immediate feedback
    if (newValue.length > 1000) {
      setError("Search term too long (max 1000 characters)");
      return;
    }
    
    setError(null);
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  const handleClear = () => {
    setLocalValue("");
    setError(null);
    onChange("");
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="flex gap-2 mb-3 justify-center">
        <Button
          variant={searchMode === 'database' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSearchModeChange('database')}
          className="flex items-center gap-2"
        >
          <Database className="w-4 h-4" />
          Search All Instructions
        </Button>
        <Button
          variant={searchMode === 'local' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSearchModeChange('local')}
          disabled={!hasLoadedInstructions}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filter Current Results
          {!hasLoadedInstructions && (
            <Badge variant="secondary" className="text-xs ml-1">
              Load instructions first
            </Badge>
          )}
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          type="text"
          placeholder={
            searchMode === 'database' 
              ? "Try searching for 'friendship', 'work', or 'happiness'..."
              : "Filter current instructions..."
          }
          value={localValue}
          onChange={handleInputChange}
          className={`pl-10 pr-10 h-12 text-lg border-2 ${
            error ? 'border-destructive' : 'border-primary/20 focus:border-primary/50'
          } bg-background/50 backdrop-blur-sm`}
          maxLength={1000}
        />
        {localValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-destructive text-center flex items-center justify-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
      
      {!localValue && !error && (
        <div className="mt-3 text-sm text-muted-foreground text-center">
          <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-3 shadow-sm">
            <div className="font-medium mb-1">💡 Tips:</div>
            <div className="text-xs space-y-1">
              {searchMode === 'database' ? (
                <>
                  <div>• Search by keywords: "happiness", "work", "family"</div>
                  <div>• Find by topic: "relationships", "success", "wisdom"</div>
                  <div>• Use filters below to narrow by tags and categories</div>
                </>
              ) : (
                <>
                  <div>• Filter the currently loaded instructions</div>
                  <div>• Search for keywords within the visible results</div>
                  <div>• Works instantly without database queries</div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {localValue && !error && (
        <div className="mt-2 text-sm text-muted-foreground text-center">
          {searchMode === 'database' ? 'Searching' : 'Filtering'} for: <span className="font-medium text-foreground">"{localValue}"</span>
        </div>
      )}
    </div>
  );
};