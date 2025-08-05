import { Menu, ArrowLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface AppNavigationProps {
  showBackToHome?: boolean;
}

export const AppNavigation = ({ showBackToHome = false }: AppNavigationProps) => {
  const handleMenuOpenChange = (open: boolean) => {
    if (open) {
      document.body.style.overflow = "hidden";
      // Fallback for browsers without `scrollbar-gutter`
      if (!CSS.supports?.("scrollbar-gutter: stable")) {
        const width = window.innerWidth - document.documentElement.clientWidth;
        if (width > 0) {
          document.body.style.paddingRight = `${width}px`;
        }
      }
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
  };

    return (
      <nav
        aria-label="Main navigation"
        className="fixed top-4 left-4 right-4 flex items-center z-50"
      >
      {showBackToHome && (
        <Link to="/">
          <Button variant="ghost" className="absolute top-0 left-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      )}

      <DropdownMenu onOpenChange={handleMenuOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link to="/">Home</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/about">About</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/privacy">Privacy</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/terms">Terms</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/copyright">Copyright</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
};