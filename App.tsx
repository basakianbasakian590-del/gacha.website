import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Shell } from "@/components/layout/shell";

import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Transfer from "@/pages/transfer";
import Renew from "@/pages/renew";
import GachaPage from "@/pages/gacha";
import AdminPage from "@/pages/admin";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, adminOnly = false, ...rest }: any) {
  return (
    <Route
      {...rest}
      component={(props: any) => {
        const { user, isLoading } = useAuth();

        if (isLoading) {
          return (
            <div className="min-h-screen flex items-center justify-center text-primary font-mono text-xl animate-pulse">
              LOADING SYSTEM...
            </div>
          );
        }

        if (!user) {
          return <Redirect to="/" />;
        }

        if (adminOnly && user.role !== "admin") {
          return <Redirect to="/dashboard" />;
        }

        return <Component {...props} />;
      }}
    />
  );
}

function Router() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Login} />
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/transfer" component={Transfer} />
        <ProtectedRoute path="/renew" component={Renew} />
        <ProtectedRoute path="/gacha" component={GachaPage} />
        <ProtectedRoute path="/admin" component={AdminPage} adminOnly />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
