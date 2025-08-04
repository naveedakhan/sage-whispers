import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Search, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 text-center bg-background/50 backdrop-blur-sm border-primary/20">
        <div className="space-y-6">
          {/* 404 Icon and Text */}
          <div className="space-y-4">
            <div className="text-6xl font-bold text-primary">404</div>
            <h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
              Let's get you back to discovering life's little instructions.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
            
            <Button 
              onClick={() => navigate(-1)} 
              variant="outline" 
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Additional Help */}
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">
              Looking for something specific?
            </p>
            <Button 
              onClick={() => navigate('/')} 
              variant="ghost" 
              size="sm"
              className="text-primary hover:text-primary/80"
            >
              <Search className="w-4 h-4 mr-2" />
              Search Instructions
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
