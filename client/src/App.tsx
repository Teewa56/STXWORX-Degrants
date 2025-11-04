import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StarfieldBackground } from "@/components/StarfieldBackground";
import { detectCSSRegisterProperty } from "@/lib/feature-detection";
import HomePage from "@/pages/HomePage";
import ClientDashboard from "@/pages/ClientDashboard";
import FreelancerDashboard from "@/pages/FreelancerDashboard";
import Browse from "@/pages/Browse";
import AdminSetup from "@/pages/AdminSetup";
import FAQ from "@/pages/FAQ";
import About from "@/pages/About";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/browse" component={Browse} />
      <Route path="/client" component={ClientDashboard} />
      <Route path="/freelancer" component={FreelancerDashboard} />
      <Route path="/admin" component={AdminSetup} />
      <Route path="/faq" component={FAQ} />
      <Route path="/about" component={About} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/contact" component={Contact} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    detectCSSRegisterProperty();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark relative">
          <StarfieldBackground />
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
