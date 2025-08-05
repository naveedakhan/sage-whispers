import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <h1 className="text-4xl font-bold mb-6">About Daily Wisdom</h1>
            
            <div className="space-y-6">
              <p className="text-lg text-muted-foreground">
                Welcome to Daily Wisdom, your source for timeless life instructions and wisdom.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
              <p>
                We believe that small pieces of wisdom can create profound changes in our daily lives. 
                Our collection of life instructions provides practical guidance, inspiration, and 
                thoughtful insights to help you navigate life's journey.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">What You'll Find Here</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Curated life instructions from various authors and thinkers</li>
                <li>Daily wisdom to inspire and guide your decisions</li>
                <li>Organized categories to find relevant advice</li>
                <li>Easy sharing to spread wisdom with others</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Get in Touch</h2>
              <p>
                Have a suggestion or want to contribute? We'd love to hear from you. 
                Wisdom grows when shared, and we're always looking to expand our collection 
                with meaningful insights.
              </p>
              
              <div className="mt-8 p-6 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  This page exists to provide information about Daily Wisdom and our mission 
                  to share life's valuable instructions with the world.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;