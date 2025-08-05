import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Filter, Tag, Folder } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Tag {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface FilterBarProps {
  tags: Tag[];
  categories: Category[];
  selectedTags: number[];
  selectedCategories: number[];
  onTagsChange: (tags: number[]) => void;
  onCategoriesChange: (categories: number[]) => void;
  onClearFilters: () => void;
}

export const FilterBar = ({
  tags,
  categories,
  selectedTags,
  selectedCategories,
  onTagsChange,
  onCategoriesChange,
  onClearFilters,
}: FilterBarProps) => {
  const hasActiveFilters = selectedTags.length > 0 || selectedCategories.length > 0;

  const handleTagToggle = (tagId: number) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  const handleCategoryToggle = (categoryId: number) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onCategoriesChange([...selectedCategories, categoryId]);
    }
  };

  const removeTag = (tagId: number) => {
    onTagsChange(selectedTags.filter(id => id !== tagId));
  };

  const removeCategory = (categoryId: number) => {
    onCategoriesChange(selectedCategories.filter(id => id !== categoryId));
  };

  return (
    <Card className="p-4 bg-background/50 backdrop-blur-sm border-primary/20">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* Filter Controls */}
        <div className="flex flex-wrap gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Tag className="w-4 h-4 mr-2" />
                Tags
                {selectedTags.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5">
                    {selectedTags.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 z-50 bg-background border shadow-lg" align="start">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Filter by Tags</h4>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {tags.map((tag) => (
                      <div key={tag.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag.id}`}
                          checked={selectedTags.includes(tag.id)}
                          onCheckedChange={() => handleTagToggle(tag.id)}
                        />
                        <label
                          htmlFor={`tag-${tag.id}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {tag.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Folder className="w-4 h-4 mr-2" />
                Categories
                {selectedCategories.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5">
                    {selectedCategories.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 z-50 bg-background border shadow-lg" align="start">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Filter by Categories</h4>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => handleCategoryToggle(category.id)}
                        />
                        <label
                          htmlFor={`category-${category.id}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </PopoverContent>
          </Popover>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              Active filters:
            </div>
            
            {selectedTags.map((tagId) => {
              const tag = tags.find(t => t.id === tagId);
              return tag ? (
                <Badge
                  key={`tag-${tagId}`}
                  variant="secondary"
                  className="gap-1"
                >
                  <Tag className="w-3 h-3" />
                  {tag.name}
                  <button
                    onClick={() => removeTag(tagId)}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ) : null;
            })}
            
            {selectedCategories.map((categoryId) => {
              const category = categories.find(c => c.id === categoryId);
              return category ? (
                <Badge
                  key={`category-${categoryId}`}
                  variant="outline"
                  className="gap-1"
                >
                  <Folder className="w-3 h-3" />
                  {category.name}
                  <button
                    onClick={() => removeCategory(categoryId)}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ) : null;
            })}
          </div>
        )}
      </div>
    </Card>
  );
};