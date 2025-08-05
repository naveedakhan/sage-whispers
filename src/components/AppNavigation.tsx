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
  return (
    <nav className="fixed top-4 left-4 right-4 flex items-center">
      <style dangerouslySetInnerHTML={{
        __html: `
          .burger-menu-button {
            margin-left: auto;
            margin-right: calc(0px + env(scrollbar-gutter, 0px));
          }
          @media (min-width: 768px) {
            .burger-menu-button {
              margin-right: 0;
            }
          }
        `
      }} />
      {showBackToHome && (
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="burger-menu-button">
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