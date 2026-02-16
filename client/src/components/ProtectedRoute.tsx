import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

type ProtectedRouteProps = {
    path: string;
    component: React.ComponentType<any>;
    allowedRoles?: string[];
};

export default function ProtectedRoute({
    path,
    component: Component,
    allowedRoles,
}: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <Route path={path}>
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </Route>
        );
    }

    if (!user) {
        return (
            <Route path={path}>
                <Redirect to="/" />
            </Route>
        );
    }

    if (!user.onboardingComplete && path !== "/onboarding") {
        return (
            <Route path={path}>
                <Redirect to="/onboarding" />
            </Route>
        );
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // If user is logged in but role doesn't match, redirect to their default dashboard
        const redirectPath = user.role === "admin" ? "/admin" : user.role === "freelancer" ? "/freelancer" : "/client";
        return (
            <Route path={path}>
                <Redirect to={redirectPath} />
            </Route>
        );
    }

    return <Route path={path} component={Component} />;
}
