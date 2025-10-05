import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import Index from "./pages/Index";
import Search from "./pages/Search";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Copyright from "./pages/Copyright";
import NotFound from "./pages/NotFound";
import PlainText from "./pages/PlainText";
import ScrollReset from "@/components/ScrollReset";
import { Footer } from "@/components/Footer";

const queryClient = new QueryClient();

const AppContent = () => {
  useScrollToTop();

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<Search />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/copyright" element={<Copyright />} />
          <Route path="/plain" element={<PlainText />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <ScrollToTopButton />
      <Footer />
    </div>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollReset />
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
