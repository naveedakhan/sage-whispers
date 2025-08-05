import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShareButtons } from "@/components/ShareButtons";
import { User, Tag, Folder } from "lucide-react";

interface Instruction {
  id: number;
  text: string;
  authors: { name: string } | null;
  instruction_tags: { tags: { id: string | number; name: string } }[];
  instruction_categories: { categories: { id: string | number; name: string } }[];
}

interface InstructionCardProps {
  instruction: Instruction;
}

export const InstructionCard = ({ instruction }: InstructionCardProps) => {
  const shareText = `"${instruction.text}"${instruction.authors ? ` — ${instruction.authors.name}` : ''}`;
  const shareUrl = `${window.location.origin}?instruction=${instruction.id}`;

  return (
    <Card className="transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 border-primary/10 hover:border-primary/20">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Main instruction text */}
          <blockquote className="text-lg leading-relaxed font-serif text-foreground">
            "{instruction.text}"
          </blockquote>

          {/* Author */}
          {instruction.authors && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4" />
              <span className="font-medium">— {instruction.authors.name}</span>
            </div>
          )}

          {/* Tags and Categories */}
          <div className="flex flex-wrap gap-3">
            {/* Tags */}
            {instruction.instruction_tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {instruction.instruction_tags.map((tagRelation) => (
                  <Badge
                    key={tagRelation.tags.id}
                    variant="secondary"
                    className="text-xs gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {tagRelation.tags.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Categories */}
            {instruction.instruction_categories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {instruction.instruction_categories.map((categoryRelation) => (
                  <Badge
                    key={categoryRelation.categories.id}
                    variant="outline"
                    className="text-xs gap-1"
                  >
                    <Folder className="w-3 h-3" />
                    {categoryRelation.categories.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Share buttons */}
          <div className="flex justify-end">
            <ShareButtons text={shareText} url={shareUrl} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};