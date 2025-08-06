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
let memoryStorage: { [key: string]: any } = {};
let storageAvailable = true;

// Safe storage wrappers with fallback
const safeGetLocalStorage = (key: string): any => {
  try {
    return getLocalStorage(key);
  } catch (error) {
    console.warn('localStorage failed, using memory fallback:', error);
    if (storageAvailable) {
      storageAvailable = false;
      toast({
        title: "Storage Access Restricted",
        description: "Your browser has restricted access to storage. History will not be saved after this session.",
        variant: "destructive",
      });
    }
    return memoryStorage[key] || null;
  }
};

const safeSetLocalStorage = (key: string, value: any): void => {
  try {
    setLocalStorage(key, value);
  } catch (error) {
    console.warn('localStorage failed, using memory fallback:', error);
    if (storageAvailable) {
      storageAvailable = false;
      toast({
        title: "Storage Access Restricted",
        description: "Your browser has restricted access to storage. History will not be saved after this session.",
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
    console.warn('Cookie access failed:', error);
    return null;
  }
};

const safeSetCookie = (name: string, value: string, days: number): void => {
  try {
    setCookie(name, value, days);
  } catch (error) {
    console.warn('Cookie setting failed:', error);
  }
};

export const RandomInstructionHero = () => {
  const [instruction, setInstruction] = useState<Instruction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [history, setHistory] = useState<Instruction[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

  const fetchRandomInstruction = async (forceRefresh = false) => {
    try {
      setIsRefreshing(true);
      
      // Check if we have a cached daily instruction
      const cachedId = safeGetCookie("dailyRandomId");
      const cacheTimestamp = safeGetCookie("dailyRandomTimestamp");
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      // Use cached instruction if it's less than 24 hours old and not forcing refresh
      if (!forceRefresh && cachedId && cacheTimestamp && 
          (now - parseInt(cacheTimestamp)) < twentyFourHours) {
        
        const { data } = await supabase
          .from("instructions")
          .select(`
            id,
            text,
            authors (
              name
            )
          `)
          .eq("id", parseInt(cachedId))
          .single();
          
        if (data) {
          setInstruction(data);
          
          // Add to history if this is the first instruction
          if (history.length === 0) {
            addToHistory(data);
          }
          
          setIsLoading(false);
          setIsRefreshing(false);
          return;
        }
      }
      
      // Fetch a new random instruction using PostgreSQL's random() function
      const { data: allInstructions } = await supabase
        .from("instructions")
        .select(`
          id,
          text,
          authors (
            name
          )
        `);

      if (allInstructions && allInstructions.length > 0) {
        const randomIndex = Math.floor(Math.random() * allInstructions.length);
        const randomData = allInstructions[randomIndex];

      if (randomData) {
          setInstruction(randomData);
          
          console.log('fetchRandomInstruction - adding to history:', { 
            instructionId: randomData.id,
            currentHistoryLength: history.length,
            currentHistoryIndex,
            forceRefresh 
          });
          
          // Always add to history when generating a new instruction
          addToHistory(randomData);
          
          // Cache the new instruction
          safeSetCookie("dailyRandomId", randomData.id.toString(), 1);
          safeSetCookie("dailyRandomTimestamp", now.toString(), 1);
          
          // Update URL when a new random instruction is fetched
          updateURL(randomData.id);
          
          return randomData;
        }
      }
    } catch (error) {
      console.error("Error fetching random instruction:", error);
      
      // Fallback: fetch any instruction if random fails
      try {
        const { data: fallbackData } = await supabase
          .from("instructions")
          .select(`
            id,
            text,
            authors (
              name
            )
          `)
          .limit(1)
          .single();
          
        if (fallbackData) {
          setInstruction(fallbackData);
        }
      } catch (fallbackError) {
        console.error("Fallback fetch also failed:", fallbackError);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = safeGetLocalStorage("instructionHistory") || [];
    const savedIndex = safeGetLocalStorage("instructionHistoryIndex");
    
    setHistory(savedHistory);
    setCurrentHistoryIndex(savedIndex !== null ? savedIndex : (savedHistory.length > 0 ? savedHistory.length - 1 : 0));

    // Check if there's a shared instruction ID in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const instructionId = urlParams.get('instruction');
    
    if (instructionId) {
      // Load specific instruction from URL parameter
      fetchSpecificInstruction(parseInt(instructionId));
    } else {
      // Load random daily instruction
      fetchRandomInstruction();
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      safeSetLocalStorage("instructionHistory", history);
      safeSetLocalStorage("instructionHistoryIndex", currentHistoryIndex);
    }
  }, [history, currentHistoryIndex]);

  const fetchSpecificInstruction = async (id: number) => {
    try {
      setIsLoading(true);
      const { data } = await supabase
        .from("instructions")
        .select(`
          id,
          text,
          authors (
            name
          )
        `)
        .eq("id", id)
        .single();
        
      if (data) {
        const instructionWithFlag = { ...data, wasExternal: true };
        setInstruction(instructionWithFlag);
        
        // Add to history (will preserve existing history and append)
        addToHistory(instructionWithFlag);
        
        // Update URL to reflect the shared instruction
        updateURL(data.id);
      } else {
        // If specific instruction not found, fallback to random
        fetchRandomInstruction();
      }
    } catch (error) {
      console.error("Error fetching specific instruction:", error);
      // Fallback to random instruction
      fetchRandomInstruction();
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to update URL consistently
  const updateURL = (instructionId: number) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('instruction', instructionId.toString());
      window.history.replaceState({}, '', url.toString());
    } catch (error) {
      console.warn('Failed to update URL:', error);
    }
  };

  const addToHistory = (newInstruction: Instruction) => {
    console.log('addToHistory called with:', { 
      newInstructionId: newInstruction.id, 
      currentHistoryLength: history.length, 
      currentHistoryIndex 
    });
    
    setHistory(prevHistory => {
      setCurrentHistoryIndex(prevIndex => {
        console.log('addToHistory - state:', { 
          historyLength: prevHistory.length, 
          currentIndex: prevIndex,
          nextInstructionId: prevHistory[prevIndex + 1]?.id
        });
        
        // Check if the new instruction is the same as the next one in forward direction
        if (prevHistory[prevIndex + 1]?.id === newInstruction.id) {
          console.log('Found duplicate in forward history, incrementing index');
          // Just increment index instead of adding duplicate
          return prevIndex + 1;
        }

        // Don't add if it's the same instruction as the current one
        if (prevHistory[prevIndex]?.id === newInstruction.id) {
          console.log('Same as current instruction, not adding');
          return prevIndex;
        }
        
        // If we're not at the end of history, truncate everything after current position
        let updatedHistory: Instruction[];
        if (prevIndex < prevHistory.length - 1) {
          console.log('Truncating history after current position');
          updatedHistory = [...prevHistory.slice(0, prevIndex + 1), newInstruction];
        } else {
          console.log('Adding to end of history');
          // If we're at the end, just add the new instruction
          updatedHistory = [...prevHistory, newInstruction];
        }
        
        // Limit history to 20 instructions
        if (updatedHistory.length > 20) {
          updatedHistory = updatedHistory.slice(-20);
        }

        console.log('Updated history:', { 
          oldLength: prevHistory.length, 
          newLength: updatedHistory.length,
          newIndex: updatedHistory.length - 1
        });

        // Update the parent history state
        setHistory(updatedHistory);
        
        // Return the new index
        return updatedHistory.length - 1;
      });
      
      // This will be overridden by the setHistory call above, but we need to return something
      return prevHistory;
    });
  };

  const handleRefresh = async () => {
    console.log('handleRefresh called - current state:', { 
      currentHistoryIndex, 
      historyLength: history.length,
      currentInstructionId: instruction?.id 
    });
    
    // Clear cache when manually refreshing
    safeSetCookie("dailyRandomId", "", -1);
    safeSetCookie("dailyRandomTimestamp", "", -1);
    
    const newInstruction = await fetchRandomInstruction(true);
    if (newInstruction && newInstruction.id) {
      updateURL(newInstruction.id);
    }
  };

  const handleBack = () => {
    // Validate bounds before proceeding
    if (currentHistoryIndex > 0 && currentHistoryIndex <= history.length) {
      setCurrentHistoryIndex(prevIndex => {
        const newIndex = prevIndex - 1;
        const prevInstruction = history[newIndex];
        if (prevInstruction) {
          setInstruction(prevInstruction);
          updateURL(prevInstruction.id);
        }
        return newIndex;
      });
    }
  };

  const handleForward = () => {
    // Validate bounds before proceeding
    if (currentHistoryIndex >= 0 && currentHistoryIndex < history.length - 1) {
      setCurrentHistoryIndex(prevIndex => {
        const newIndex = prevIndex + 1;
        const nextInstruction = history[newIndex];
        if (nextInstruction) {
          setInstruction(nextInstruction);
          updateURL(nextInstruction.id);
        }
        return newIndex;
      });
    }
  };

  const canGoBack = currentHistoryIndex > 0;
  const canGoForward = currentHistoryIndex < history.length - 1;

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

  if (!instruction) {
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
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

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
          "{instruction.text}"
        </blockquote>
        
        {instruction.authors && (
          <p className="text-lg text-muted-foreground mb-6">
            — {instruction.authors.name}
          </p>
        )}
        
        <div className="flex flex-col gap-4 justify-center items-center">
          {/* Navigation Controls */}
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
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
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
          
          {/* History indicator */}
          {history.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {currentHistoryIndex + 1} of {history.length}
            </p>
          )}
          
          <ShareButtons 
            text={`"${instruction.text}"${instruction.authors ? ` — ${instruction.authors.name}` : ''}`}
            url={`https://daily-wisdom.com?instruction=${instruction.id}`}
          />
        </div>
      </div>
    </Card>
  );
};