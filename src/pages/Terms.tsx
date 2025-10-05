import { AppNavigation } from "@/components/AppNavigation";
import SEO from "@/components/SEO";

const Terms = () => {
  return (
    <>
      <SEO 
        title="Terms of Service"
        description="Terms of Service for Daily Wisdom - Life's Little Instruction Engine. Read our terms and conditions for using our service."
        canonical="https://www.daily-wisdom.com/terms"
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
              Terms of Service
            </h1>
          </header>

          <div className="prose prose-lg max-w-none">
            <div className="bg-card p-8 rounded-lg shadow-sm border">
              <div className="text-foreground leading-relaxed space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Acceptance of Terms</h2>
                  <p className="text-muted-foreground">
                    By accessing and using Life's Little Instruction Engine, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Use License</h2>
                  <p className="text-muted-foreground mb-4">
                    Permission is granted to temporarily access the materials on Life's Little Instruction Engine for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Modify or copy the materials</li>
                    <li>Use the materials for any commercial purpose or for any public display</li>
                    <li>Attempt to reverse engineer any software contained on the website</li>
                    <li>Remove any copyright or other proprietary notations from the materials</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Content and Accuracy</h2>
                  <p className="text-muted-foreground">
                    The life instructions and guidance provided on this platform are for informational and inspirational purposes only. While we strive to provide accurate and helpful content, we make no warranties about the completeness, reliability, or suitability of the information for your specific circumstances.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">User Conduct</h2>
                  <p className="text-muted-foreground mb-4">
                    You agree to use the service only for lawful purposes and in accordance with these Terms. You agree not to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Use the service in any way that violates applicable laws or regulations</li>
                    <li>Transmit or procure the sending of any advertising or promotional material</li>
                    <li>Impersonate or attempt to impersonate the company, employees, or other users</li>
                    <li>Engage in any other conduct that restricts or inhibits anyone's use of the service</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Intellectual Property</h2>
                  <p className="text-muted-foreground">
                    The service and its original content, features, and functionality are and will remain the exclusive property of Life's Little Instruction Engine and its licensors. The service is protected by copyright, trademark, and other laws.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Disclaimer</h2>
                  <p className="text-muted-foreground">
                    The information on this website is provided on an 'as is' basis. To the fullest extent permitted by law, Life's Little Instruction Engine excludes all representations, warranties, conditions and terms relating to our website and the use of this website.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
                  <p className="text-muted-foreground">
                    In no event shall Life's Little Instruction Engine or its suppliers be liable for any damages arising out of the use or inability to use the materials on the website, even if authorized representative has been notified orally or in writing of the possibility of such damage.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to Terms</h2>
                  <p className="text-muted-foreground">
                    We may revise these terms of service at any time without notice. By using this website, you are agreeing to be bound by the then current version of these Terms of Service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Information</h2>
                  <p className="text-muted-foreground">
                    If you have any questions about these Terms of Use, please contact us through our website.
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default Terms;