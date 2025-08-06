import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © <span id="currentYear"></span> Life's Little Instruction Engine. All rights reserved.
          </div>
          
          <div className="flex flex-wrap gap-6 text-sm">
            <Link 
              to="/privacy" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Use
            </Link>
            <Link 
              to="/copyright" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Copyright Notice
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};