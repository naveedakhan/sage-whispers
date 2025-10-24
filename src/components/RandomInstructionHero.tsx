import { useCallback, useEffect, useReducer, useState } from "react";
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

interface HistoryState {
  entries: Instruction[];
  index: number;
}

type HistoryAction =
  | { type: "initialize"; entries: Instruction[]; index: number }
  | { type: "add"; instruction: Instruction; replaceForward: boolean }
  | { type: "back" }
  | { type: "forward" };

const initialHistoryState: HistoryState = {
  entries: [],
  index: -1,
};

const historyReducer = (state: HistoryState, action: HistoryAction): HistoryState => {
  switch (action.type) {
    case "initialize": {
      const entries = action.entries ?? [];
      const hasEntries = entries.length > 0;
      const safeIndex = hasEntries
        ? Math.min(Math.max(action.index, 0), entries.length - 1)
        : -1;
      return {
        entries,
        index: hasEntries ? safeIndex : -1,
      };
    }
    case "add": {
      const baseEntries =
        action.replaceForward && state.index >= 0
          ? state.entries.slice(0, state.index + 1)
          : state.entries;

      if (
        baseEntries.length > 0 &&
        baseEntries[baseEntries.length - 1]?.id === action.instruction.id
      ) {
        const entries = [
          ...baseEntries.slice(0, baseEntries.length - 1),
          action.instruction,
        ];
        return {
          entries,
          index: entries.length - 1,
        };
      }

      return {
        entries: [...baseEntries, action.instruction],
        index: baseEntries.length,
      };
    }
    case "back":
      if (state.index <= 0) {
        return state;
      }
      return {
        ...state,
        index: state.index - 1,
      };
    case "forward":
      if (state.index < 0 || state.index >= state.entries.length - 1) {
        return state;
      }
      return {
        ...state,
        index: state.index + 1,
      };
    default:
      return state;
  }
};

// In-memory fallback storage when localStorage fails
let memoryStorage: { [key: string]: unknown } = {};
let storageAvailable = true;

// Safe storage wrappers with fallback
const safeGetLocalStorage = (key: string): unknown => {
  try {
    return getLocalStorage(key);
  } catch (error) {
    console.warn("localStorage failed, using memory fallback:", error);
    if (storageAvailable) {
      storageAvailable = false;
      toast({
        title: "Storage Access Restricted",
        description:
          "Your browser has restricted access to storage. History will not be saved after this session.",
        variant: "destructive",
      });
    }
    return memoryStorage[key] ?? null;
  }
};

const safeSetLocalStorage = (key: string, value: unknown): void => {
  try {
    setLocalStorage(key, value);
  } catch (error) {
    console.warn("localStorage failed, using memory fallback:", error);
    if (storageAvailable) {
      storageAvailable = false;
      toast({
        title: "Storage Access Restricted",
        description:
          "Your browser has restricted access to storage. History will not be saved after this session.",
        variant: "destructive",
      });
    }
    memoryStorage[key] = value;
  }
};

const safeGetCookie = (name: string): string | null => {
  try {
    return getCookie(name);
  } catch (error) {
    console.warn("Cookie access failed:", error);
    return null;
  }
};

const safeSetCookie = (name: string, value: string, days: number): void => {
  try {
    setCookie(name, value, days);
  } catch (error) {
    console.warn("Cookie setting failed:", error);
  }
};

const isBrowser = typeof window !== "undefined";

const updateURL = (instructionId: number) => {
  if (!isBrowser) {
    return;
  }

  try {
    const url = new URL(window.location.href);
    url.searchParams.set("instruction", instructionId.toString());
    window.history.replaceState({}, "", url.toString());
  } catch (error) {
    console.warn("Failed to update URL:", error);
  }
};

type RandomInstructionRow = {
  instruction_id: number;
  text: string;
  author_name: string | null;
};

export const RandomInstructionHero = () => {
  const [history, dispatchHistory] = useReducer(historyReducer, initialHistoryState);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalInstructionsInDB, setTotalInstructionsInDB] = useState<number | null>(null);

  const currentInstruction =
    history.index >= 0 && history.index < history.entries.length
      ? history.entries[history.index]
      : null;

  const fetchTotalInstructionCount = useCallback(async () => {
    try {
      const { count } = await supabase
        .from("instructions")
        .select("*", { count: "exact", head: true });
      setTotalInstructionsInDB(count ?? null);
    } catch (error) {
      console.error("Failed to fetch total instruction count:", error);
    }
  }, []);

  const fetchSpecificInstruction = useCallback(
    async (id: number, options: { markExternal?: boolean } = {}): Promise<Instruction | null> => {
      try {
        const { data, error } = await supabase
          .from("instructions")
          .select(
            `
              id,
              text,
              authors (
                name
              )
            `
          )
          .eq("id", id)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          return null;
        }

        const instruction: Instruction = {
          id: data.id,
          text: data.text,
          authors: data.authors ? { name: data.authors.name } : null,
          ...(options.markExternal ? { wasExternal: true } : {}),
        };

        return instruction;
      } catch (error) {
        console.error("Error fetching specific instruction:", error);
        return null;
      }
    },
    []
  );

  const fetchRandomInstruction = useCallback(
    async (forceRefresh = false): Promise<Instruction | null> => {
      setIsRefreshing(true);
      try {
        const cachedId = safeGetCookie("dailyRandomId");
        const cacheTimestamp = safeGetCookie("dailyRandomTimestamp");
        const now = Date.now();
        const cachedAt = cacheTimestamp ? Number.parseInt(cacheTimestamp, 10) : NaN;
        const isCacheValid =
          !forceRefresh &&
          cachedId &&
          !Number.isNaN(cachedAt) &&
          now - cachedAt < 24 * 60 * 60 * 1000;

        if (isCacheValid) {
          const instructionId = Number.parseInt(cachedId as string, 10);
          if (!Number.isNaN(instructionId)) {
            const cachedInstruction = await fetchSpecificInstruction(instructionId);
            if (cachedInstruction) {
              dispatchHistory({
                type: "add",
                instruction: cachedInstruction,
                replaceForward: true,
              });
              return cachedInstruction;
            }
          }
        }

        const { data, error } = await supabase.rpc("get_random_instructions", {
          result_limit: 1,
        });

        if (error) {
          throw error;
        }

        const randomRow = (Array.isArray(data) ? data : []) as RandomInstructionRow[];
        const row = randomRow[0];

        if (!row) {
          return null;
        }

        const instruction: Instruction = {
          id: row.instruction_id,
          text: row.text,
          authors: row.author_name ? { name: row.author_name } : null,
        };

        dispatchHistory({
          type: "add",
          instruction,
          replaceForward: true,
        });

        safeSetCookie("dailyRandomId", instruction.id.toString(), 1);
        safeSetCookie("dailyRandomTimestamp", Date.now().toString(), 1);

        return instruction;
      } catch (error) {
        console.error("Error fetching random instruction:", error);
        toast({
          title: "Failed to load instruction",
          description: "Please try again.",
          variant: "destructive",
        });
        return null;
      } finally {
        setIsRefreshing(false);
      }
    },
    [fetchSpecificInstruction]
  );

  useEffect(() => {
    if (!history.entries.length) {
      safeSetLocalStorage("instructionHistory", []);
      safeSetLocalStorage("instructionHistoryIndex", -1);
      return;
    }

    safeSetLocalStorage("instructionHistory", history.entries);
    safeSetLocalStorage("instructionHistoryIndex", history.index);
  }, [history.entries, history.index]);

  useEffect(() => {
    const current = currentInstruction;
    if (current) {
      updateURL(current.id);
    }
  }, [currentInstruction]);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      const savedHistoryRaw = safeGetLocalStorage("instructionHistory");
      const savedIndexRaw = safeGetLocalStorage("instructionHistoryIndex");

      const preparedEntries = Array.isArray(savedHistoryRaw)
        ? (savedHistoryRaw.filter(
            (item): item is Instruction =>
              item &&
              typeof item === "object" &&
              "id" in item &&
              typeof (item as Instruction).id === "number" &&
              typeof (item as Instruction).text === "string"
          ) as Instruction[])
        : [];

      const parsedIndex =
        typeof savedIndexRaw === "number"
          ? savedIndexRaw
          : Number.parseInt(
              typeof savedIndexRaw === "string" ? savedIndexRaw : "",
              10
            );

      dispatchHistory({
        type: "initialize",
        entries: preparedEntries,
        index: Number.isNaN(parsedIndex) ? preparedEntries.length - 1 : parsedIndex,
      });

      await fetchTotalInstructionCount();

      if (!isMounted) {
        return;
      }

      let instructionResolved = false;

      if (isBrowser) {
        const params = new URLSearchParams(window.location.search);
        const instructionParam = params.get("instruction");
        if (instructionParam) {
          const instructionId = Number.parseInt(instructionParam, 10);
          if (!Number.isNaN(instructionId)) {
            const sharedInstruction = await fetchSpecificInstruction(instructionId, {
              markExternal: true,
            });
            if (sharedInstruction) {
              dispatchHistory({
                type: "add",
                instruction: sharedInstruction,
                replaceForward: true,
              });
              instructionResolved = true;
            }
          }
        }
      }

      if (!instructionResolved && preparedEntries.length > 0) {
        instructionResolved = true;
      }

      if (!instructionResolved) {
        const instruction = await fetchRandomInstruction();
        instructionResolved = Boolean(instruction);
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [fetchRandomInstruction, fetchSpecificInstruction, fetchTotalInstructionCount]);

  const handleRefresh = useCallback(async () => {
    safeSetCookie("dailyRandomId", "", -1);
    safeSetCookie("dailyRandomTimestamp", "", -1);
    await fetchRandomInstruction(true);
  }, [fetchRandomInstruction]);

  const handleBack = () => {
    dispatchHistory({ type: "back" });
  };

  const handleForward = () => {
    dispatchHistory({ type: "forward" });
  };

  const canGoBack = history.index > 0;
  const canGoForward =
    history.index >= 0 && history.index < history.entries.length - 1;
  const historyPosition = history.entries.length ? history.index + 1 : 0;

  if (isLoading) {
    return (
      <Card className="mb-12 p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="h-20 bg-muted rounded mb-4"></div>
          <div className="h-6 bg-muted rounded w-1/3"></div>
        </div>
      </Card>
    );
  }

  if (!currentInstruction) {
    return (
      <Card className="mb-12 p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="text-center">
          <p className="text-muted-foreground">Unable to load daily instruction</p>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="mt-4"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  const shareOrigin =
    isBrowser && window.location
      ? window.location.origin
      : "https://www.daily-wisdom.com";
  const shareUrl = `${shareOrigin}?instruction=${currentInstruction.id}`;

  return (
    <Card className="mb-12 p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Quote className="w-8 h-8 text-primary" />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">
          Daily Instruction
        </h2>

        <blockquote className="text-xl md:text-2xl leading-relaxed mb-6 font-serif text-foreground">
          "{currentInstruction.text}"
        </blockquote>

        {currentInstruction.authors && (
          <p className="text-lg text-muted-foreground mb-6">
            — {currentInstruction.authors.name}
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

          <div className="space-y-1 text-center">
            <p className="text-lg font-semibold text-primary">
              {historyPosition} of {history.entries.length}
            </p>

            {totalInstructionsInDB && (
              <p className="text-xs text-muted-foreground">
                {totalInstructionsInDB.toLocaleString()} awesome instructions available
              </p>
            )}
          </div>

          <ShareButtons
            text={`"${currentInstruction.text}"${
              currentInstruction.authors ? ` — ${currentInstruction.authors.name}` : ""
            }`}
            url={shareUrl}
          />
        </div>
      </div>
    </Card>
  );
};
