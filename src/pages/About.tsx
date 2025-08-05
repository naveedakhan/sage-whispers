import { AppNavigation } from "@/components/AppNavigation";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <AppNavigation showBackToHome />
          
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
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">What Inspired This Project</h2>
              <p>
                I first came across <em>Life’s Little Instruction Book</em> as a student at GIK. Back then, it felt like a nice little book with simple advice. I read it, appreciated it, and moved on. Life took over — career, family, responsibilities — and the book faded into the background.
              </p>
              <p>
                Many years later, as my own son left for college and began his journey toward graduation, I stumbled upon the book again. This time, I read it not as a student, but as a father.
              </p>
              <p>
                The words hit differently. What once felt like casual suggestions now felt like distilled wisdom. I realized it was more than a book — it was a father’s legacy, quietly guiding his child into the world.
              </p>
              <p>
                I was saddened to learn that the author, H. Jackson Brown Jr., is no longer with us. But his message still speaks loud and clear. This project is my way of honoring that voice — and passing it on.
              </p>
              <p>
                If you're a father, I encourage you to share this with your son too. These little instructions may be simple, but their impact lasts a lifetime.
              </p>

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
