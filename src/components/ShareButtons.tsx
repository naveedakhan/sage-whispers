import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  text: string;
  url: string;
}

export const ShareButtons = ({ text, url }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try copying the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleTwitterShare = () => {
    console.log('Twitter share clicked', { text, url });
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    console.log('Twitter URL:', twitterUrl);
    
    try {
      window.open(twitterUrl, '_blank', 'width=550,height=420,scrollbars=no,resizable=no');
      console.log('Twitter share window opened successfully');
    } catch (error) {
      console.error('Twitter share error:', error);
      // Fallback to direct navigation
      window.open(twitterUrl, '_blank');
    }
  };

  const handleFacebookShare = () => {
    console.log('Facebook share clicked', { text, url });
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    console.log('Facebook URL:', facebookUrl);
    
    try {
      window.open(facebookUrl, '_blank', 'width=626,height=436,scrollbars=no,resizable=no');
      console.log('Facebook share window opened successfully');
    } catch (error) {
      console.error('Facebook share error:', error);
      // Fallback to direct navigation
      window.open(facebookUrl, '_blank');
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <Share2 className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48" align="end">
        <div className="space-y-2">
          <div className="text-sm font-medium text-center mb-3">Share this instruction</div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            className="w-full justify-start gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Link"}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTwitterShare}
            className="w-full justify-start gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Share on X
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFacebookShare}
            className="w-full justify-start gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Share on Facebook
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};