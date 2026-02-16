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

import { AuthProvider } from "@/hooks/use-auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthPage from "@/pages/AuthPage";
import Onboarding from "@/pages/Onboarding";
import Profile from "@/pages/Profile";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/profile" component={Profile} />
      <Route path="/browse" component={Browse} />
      <ProtectedRoute path="/client" component={ClientDashboard} allowedRoles={["client"]} />
      <ProtectedRoute path="/freelancer" component={FreelancerDashboard} allowedRoles={["freelancer"]} />
      <ProtectedRoute path="/admin" component={AdminSetup} allowedRoles={["admin"]} />
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
      <AuthProvider>
        <TooltipProvider>
          <div className="dark relative">
            <StarfieldBackground />
            <Toaster />
            <ErrorBoundary>
              <Router />
            </ErrorBoundary>
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
