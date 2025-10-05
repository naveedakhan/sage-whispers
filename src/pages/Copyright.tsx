import { AppNavigation } from "@/components/AppNavigation";
import SEO from "@/components/SEO";

const Copyright = () => {
  return (
    <>
      <SEO 
        title="Copyright"
        description="Copyright information for Daily Wisdom - Life's Little Instruction Engine. Learn about our content usage policies and intellectual property rights."
        canonical="https://www.daily-wisdom.com/copyright"
      />
      <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12">
          <div className="mb-6">
            <AppNavigation showBackToHome />
          </div>
        </header>
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Copyright Disclaimer
            </h1>
          </header>

        <div className="prose prose-lg max-w-none">
          <div className="bg-card p-8 rounded-lg shadow-sm border">
            <div className="text-foreground leading-relaxed space-y-6">
              <p>
                Daily Wisdom is a labor of love — a curated collection of timeless insights, 
                thoughtful advice, and small reminders that make a big difference. These 
                instructions are gathered from books, public sources, and kind people who 
                believe wisdom is meant to be shared.
              </p>
              
              <p>
                We do not claim ownership of most of the instructions featured here. They 
                belong to the authors, thinkers, and everyday humans who first put them 
                into words. Whenever an author is known, we do our best to credit them. 
                If you're sharing something from this site, please include the original 
                author's name if it's mentioned — it's a small way to show respect.
              </p>
              
              <p>
                If you're an author, publisher, or copyright holder and believe your work 
                has been used here without proper credit or permission, please let us know. 
                Reach out at{" "}
                <a 
                  href="mailto:hello@daily-wisdom.com" 
                  className="text-primary hover:underline"
                >
                  hello@daily-wisdom.com
                </a>{" "}
                and we'll respond quickly to resolve it.
              </p>
              
              <p>
                This project exists to honor the wisdom we've all been given — not to 
                claim it, but to carry it forward.
              </p>
              
              <p className="font-medium">
                Thank you for being part of that journey.
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default Copyright;