import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ShareButtons } from "@/components/ShareButtons";
import { getCookie, setCookie, getLocalStorage, setLocalStorage } from "@/utils/storage";

interface Instruction {
  id: number;
  text: string;
  authors: { name: string } | null;
}

export const RandomInstructionHero = () => {
  const [instruction, setInstruction] = useState<Instruction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [history, setHistory] = useState<Instruction[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

  const fetchRandomInstruction = async (forceRefresh = false) => {
    try {
      setIsRefreshing(true);
      
      // Check if we have a cached daily instruction
      const cachedId = getCookie("dailyRandomId");
      const cacheTimestamp = getCookie("dailyRandomTimestamp");
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
          
          // Cache the new instruction
          setCookie("dailyRandomId", randomData.id.toString(), 1);
          setCookie("dailyRandomTimestamp", now.toString(), 1);
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
    const savedHistory = getLocalStorage("instructionHistory") || [];
    const savedIndex = getLocalStorage("instructionHistoryIndex") || -1;
    
    setHistory(savedHistory);
    setCurrentHistoryIndex(savedIndex);

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
      setLocalStorage("instructionHistory", history);
      setLocalStorage("instructionHistoryIndex", currentHistoryIndex);
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
        setInstruction(data);
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

  const addToHistory = (newInstruction: Instruction) => {
    if (!instruction) return;
    
    setHistory(prevHistory => {
      // Don't add if it's the same instruction
      if (prevHistory.length > 0 && prevHistory[prevHistory.length - 1].id === instruction.id) {
        return prevHistory;
      }
      
      // Remove any instructions after current index (when navigating back then getting new)
      const newHistory = currentHistoryIndex >= 0 
        ? prevHistory.slice(0, currentHistoryIndex + 1)
        : prevHistory;
      
      // Add current instruction to history
      const updatedHistory = [...newHistory, instruction];
      
      // Limit history to 20 instructions
      if (updatedHistory.length > 20) {
        return updatedHistory.slice(-20);
      }
      
      return updatedHistory;
    });
    
    setCurrentHistoryIndex(prev => prev + 1);
  };

  const handleRefresh = () => {
    if (instruction) {
      addToHistory(instruction);
    }
    fetchRandomInstruction(true);
  };

  const handleBack = () => {
    if (currentHistoryIndex > 0) {
      const prevInstruction = history[currentHistoryIndex - 1];
      setInstruction(prevInstruction);
      setCurrentHistoryIndex(prev => prev - 1);
      
      // Update URL without triggering page reload
      const url = new URL(window.location.href);
      url.searchParams.set('instruction', prevInstruction.id.toString());
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleForward = () => {
    if (currentHistoryIndex < history.length - 1) {
      const nextInstruction = history[currentHistoryIndex + 1];
      setInstruction(nextInstruction);
      setCurrentHistoryIndex(prev => prev + 1);
      
      // Update URL without triggering page reload
      const url = new URL(window.location.href);
      url.searchParams.set('instruction', nextInstruction.id.toString());
      window.history.replaceState({}, '', url.toString());
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
              {currentHistoryIndex + 1} of {history.length + 1}
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