import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { debounce } from "@/utils/storage";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchInput = ({ value, onChange }: SearchInputProps) => {
  const [localValue, setLocalValue] = useState(value);

  // Debounced onChange function
  const debouncedOnChange = useCallback(
    debounce((searchValue: string) => {
      onChange(searchValue);
    }, 300),
    [onChange]
  );

  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          type="text"
          placeholder="Search instructions, authors, tags, or categories..."
          value={localValue}
          onChange={handleInputChange}
          className="pl-10 pr-10 h-12 text-lg border-2 border-primary/20 focus:border-primary/50 bg-background/50 backdrop-blur-sm"
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
      
      {localValue && (
        <div className="absolute top-full mt-2 left-0 right-0 text-sm text-muted-foreground text-center">
          Searching for: <span className="font-medium text-foreground">"{localValue}"</span>
        </div>
      )}
    </div>
  );
};