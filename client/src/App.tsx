import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Inventory from "@/pages/Inventory";
import ItemDetail from "@/pages/ItemDetail";
import QRCodes from "@/pages/QRCodes";
import Loans from "@/pages/Loans";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      {/* Dashboard route */}
      <ProtectedRoute path="/" component={() => (
        <Layout>
          <Dashboard />
        </Layout>
      )} />
      
      {/* Inventory routes */}
      <ProtectedRoute path="/inventory" component={() => (
        <Layout>
          <Inventory />
        </Layout>
      )} />
      
      <ProtectedRoute path="/inventory/:id" component={() => (
        <Layout>
          <ItemDetail />
        </Layout>
      )} />
      
      {/* QR Codes route */}
      <ProtectedRoute path="/qrcodes" component={() => (
        <Layout>
          <QRCodes />
        </Layout>
      )} />
      
      {/* Loans route */}
      <ProtectedRoute path="/loans" component={() => (
        <Layout>
          <Loans />
        </Layout>
      )} />
      
      {/* Reports route */}
      <ProtectedRoute path="/reports" component={() => (
        <Layout>
          <Reports />
        </Layout>
      )} />
      
      {/* Settings route */}
      <ProtectedRoute path="/settings" component={() => (
        <Layout>
          <Settings />
        </Layout>
      )} />
      
      {/* Profile route */}
      <ProtectedRoute path="/profile" component={() => (
        <Layout>
          <Profile />
        </Layout>
      )} />
      
      {/* Admin route */}
      <ProtectedRoute path="/admin" component={() => (
        <Layout>
          <Admin />
        </Layout>
      )} />
      
      {/* Fallback for unknown routes */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
