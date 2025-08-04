import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ShareButtons } from "@/components/ShareButtons";
import { getCookie, setCookie } from "@/utils/storage";

interface Instruction {
  id: number;
  text: string;
  authors: { name: string } | null;
}

export const RandomInstructionHero = () => {
  const [instruction, setInstruction] = useState<Instruction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      
      // Fetch a new random instruction
      const { data: randomData } = await supabase
        .from("instructions")
        .select(`
          id,
          text,
          authors (
            name
          )
        `)
        .order("random()") // Note: This might not work in all databases, might need a different approach
        .limit(1)
        .single();

      if (randomData) {
        setInstruction(randomData);
        
        // Cache the new instruction
        setCookie("dailyRandomId", randomData.id.toString(), 1);
        setCookie("dailyRandomTimestamp", now.toString(), 1);
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
    fetchRandomInstruction();
  }, []);

  const handleRefresh = () => {
    fetchRandomInstruction(true);
  };

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
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            disabled={isRefreshing}
            className="bg-background/50 backdrop-blur-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Get New Instruction
          </Button>
          
          <ShareButtons 
            text={`"${instruction.text}"${instruction.authors ? ` — ${instruction.authors.name}` : ''}`}
            url={window.location.href}
          />
        </div>
      </div>
    </Card>
  );
};