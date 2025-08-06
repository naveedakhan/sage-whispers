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

// In-memory fallback storage
let memoryStorage: Record<string, any> = {};
let storageAvailable = true;

const safeGetLocalStorage = (key: string) => {
  try {
    return getLocalStorage(key);
  } catch {
    storageAvailable = false;
    toast({
      title: "Storage Access Restricted",
      description: "History will not be saved after this session.",
      variant: "destructive",
    });
    return memoryStorage[key] || null;
  }
};

const safeSetLocalStorage = (key: string, value: any) => {
  try {
    setLocalStorage(key, value);
  } catch {
    storageAvailable = false;
    toast({
      title: "Storage Access Restricted",
      description: "History will not be saved after this session.",
      variant: "destructive",
    });
    memoryStorage[key] = value;
  }
};

const safeGetCookie = (name: string) => {
  try {
    return getCookie(name);
  } catch {
    return null;
  }
};

const safeSetCookie = (name: string, value: string, days: number) => {
  try {
    setCookie(name, value, days);
  } catch {
    // silent
  }
};

export const RandomInstructionHero = () => {
  const [instruction, setInstruction] = useState<Instruction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [history, setHistory] = useState<Instruction[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

  // Fetch helpers (unchanged logic)
  const fetchRandomInstruction = async (forceRefresh = false) => {
    setIsRefreshing(true);
    // ... your existing caching + supabase logic ...
    setIsRefreshing(false);
  };

  const fetchSpecificInstruction = async (id: number) => {
    setIsLoading(true);
    // ... your existing supabase lookup + addToHistory ...
    setIsLoading(false);
  };

  const updateURL = (id: number) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("instruction", id.toString());
      window.history.replaceState({}, "", url.toString());
    } catch {}
  };

  const addToHistory = (newInst: Instruction) => {
    setHistory((prev) => {
      // ... your existing duplicate/truncate logic ...
      return prev;
    });
  };

  // Controls
  const handleRefresh = () => fetchRandomInstruction(true);
  const handleBack = () => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(newIndex);
      setInstruction(history[newIndex]);
      updateURL(history[newIndex].id);
    }
  };
  const handleForward = () => {
    if (currentHistoryIndex < history.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(newIndex);
      setInstruction(history[newIndex]);
      updateURL(history[newIndex].id);
    }
  };
  const canGoBack = currentHistoryIndex > 0;
  const canGoForward = currentHistoryIndex < history.length - 1;

  // Load on mount
  useEffect(() => {
    const savedHistory = safeGetLocalStorage("instructionHistory") || [];
    const savedIndex = safeGetLocalStorage("instructionHistoryIndex") ?? savedHistory.length - 1;
    setHistory(savedHistory);
    setCurrentHistoryIndex(savedIndex);
    const params = new URLSearchParams(window.location.search);
    params.get("instruction")
      ? fetchSpecificInstruction(Number(params.get("instruction")))
      : fetchRandomInstruction();
  }, []);

  // Persist history
  useEffect(() => {
    if (history.length) {
      safeSetLocalStorage("instructionHistory", history);
      safeSetLocalStorage("instructionHistoryIndex", currentHistoryIndex);
    }
  }, [history, currentHistoryIndex]);

  // Loading state
  if (isLoading) {
    return (
      <Card className="mb-4 px-4 py-5 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 max-h-[40vh] overflow-hidden">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded mb-3"></div>
          <div className="h-16 bg-muted rounded mb-3"></div>
          <div className="h-4 bg-muted rounded w-1/3"></div>
        </div>
      </Card>
    );
  }

  // Fallback if no instruction
  if (!instruction) {
    return (
      <Card className="mb-4 px-4 py-5 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 max-h-[40vh] overflow-hidden">
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

  // Main render (caps at half viewport, scrolls internally)
  return (
    <Card className="mb-4 px-4 py-5 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 max-h-[50vh] overflow-auto">
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <Quote className="w-6 h-6 text-primary" />
        </div>

        <h2 className="text-lg md:text-xl font-semibold text-primary mb-2">
          Daily Instruction
        </h2>

        <blockquote className="text-sm md:text-base leading-snug mb-3 font-serif text-foreground">
          "{instruction.text}"
        </blockquote>

        {instruction.authors && (
          <p className="text-xs text-muted-foreground mb-3">
            — {instruction.authors.name}
          </p>
        )}

        <div className="flex flex-col gap-3 justify-center items-center">
          <div className="flex gap-2">
            <Button
              onClick={handleBack}
              variant="outline"
              size="sm"
              disabled={!canGoBack}
              className="bg-background/50 backdrop-blur-sm"
              title="Previous"
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
              New
            </Button>
            <Button
              onClick={handleForward}
              variant="outline"
              size="sm"
              disabled={!canGoForward}
              className="bg-background/50 backdrop-blur-sm"
              title="Next"
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
};
