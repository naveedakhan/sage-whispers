import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ShareButtons } from "@/components/ShareButtons";
import { getCookie, setCookie, getLocalStorage, setLocalStorage } from "@/utils/storage";
import { toast } from "@/hooks/use-toast";

interface Instruction {
  id: number;
  text: string;
  authors: { name: string } | null;
  wasExternal?: boolean;
}

// In-memory fallback storage when localStorage fails
let memoryStorage: Record<string, any> = {};
let storageAvailable = true;
const safeGetLocalStorage = (key: string) => { /* ... */ };
const safeSetLocalStorage = (key: string, value: any) => { /* ... */ };
const safeGetCookie = (name: string) => { /* ... */ };
const safeSetCookie = (name: string, value: string, days: number) => { /* ... */ };

export const RandomInstructionHero = () => {
  const [instruction, setInstruction] = useState<Instruction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [history, setHistory] = useState<Instruction[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

  // ... all your fetch, effect, history logic unchanged ...

  if (isLoading) {
    return (
      <Card className="mb-4 px-4 py-5 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-3"></div>
          <div className="h-20 bg-muted rounded mb-3"></div>
          <div className="h-6 bg-muted rounded w-1/3"></div>
        </div>
      </Card>
    );
  }

  if (!instruction) {
    return (
      <Card className="mb-4 px-4 py-5 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Unable to load daily instruction</p>
          <Button onClick={handleRefresh} variant="outline" className="mt-3" disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  // ——— REPLACE ONLY THIS RETURN BLOCK ———
  return (
    <Card className="mb-4 px-4 py-5 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <Quote className="w-6 h-6 text-primary" />
        </div>

        <h2 className="text-xl md:text-2xl font-semibold text-primary mb-3">
          Daily Instruction
        </h2>

        <blockquote className="text-base md:text-lg leading-snug mb-4 font-serif text-foreground">
          "{instruction.text}"
        </blockquote>

        {instruction.authors && (
          <p className="text-sm text-muted-foreground mb-4">
            — {instruction.authors.name}
          </p>
        )}

        <div className="flex flex-col gap-4 justify-center items-center">
          <div className="flex gap-2 justify-center items-center">
            <Button
              onClick={handleBack}
              variant="outline"
              size="sm"
              disabled={!canGoBack}
              className="bg-background/50 backdrop-blur-sm"
              title="Previous instruction"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={isRefreshing}
              className="bg-background/50 backdrop-blur-sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Get New Instruction
            </Button>

            <Button
              onClick={handleForward}
              variant="outline"
              size="sm"
              disabled={!canGoForward}
              className="bg-background/50 backdrop-blur-sm"
              title="Next instruction"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {history.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {currentHistoryIndex + 1} of {history.length}
            </p>
          )}

          <ShareButtons
            text={`"${instruction.text}"${instruction.authors ? ` — ${instruction.authors.name}` : ""}`}
            url={`https://daily-wisdom.com?instruction=${instruction.id}`}
          />
        </div>
      </div>
    </Card>
  );
  // —————————————————————————
};
