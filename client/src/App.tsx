import "./global.css";

import { Toaster } from "@/src/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/src/components/ui/sonner";
import { TooltipProvider } from "@/src/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, HashRouter } from "react-router-dom";
import Index from "@/src/pages/Index";
import Finances from "@/src/pages/Finances";
import Savings from "@/src/pages/Savings";
import Cards from "@/src/pages/Cards";
import Categories from "@/src/pages/Categories";
import CardDetails from "@/src/pages/Cards/CardDetails";
import FuturePlans from "@/src/pages/FuturePlans";
import NotFound from "@/src/pages/NotFound";
import Login from "@/src/pages/Login";
import AuthProvider, { PrivateRoute } from "@/src/components/AuthProvider";
import Profile from "@/src/pages/Profile";

import { Layout } from "@/src/components/Layout";

const queryClient = new QueryClient();

const PlaceholderPage = ({ title }: { title: string }) => (
  <Layout>
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <h1 className="text-3xl font-bold text-primary">{title}</h1>
      <p className="text-muted-foreground max-w-md text-center">
        Este módulo está em desenvolvimento. Continue solicitando alterações
        para completar as funcionalidades do sistema financeiro.
      </p>
    </div>
  </Layout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout>
                    <Index />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/finances"
              element={
                <PrivateRoute>
                  <Layout>
                    <Finances />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/cards"
              element={
                <PrivateRoute>
                  <Layout>
                    <Cards />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/cards/:id"
              element={
                <PrivateRoute>
                  <Layout>
                    <CardDetails />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/savings"
              element={
                <PrivateRoute>
                  <Layout>
                    <Savings />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/future-plans"
              element={
                <PrivateRoute>
                  <Layout>
                    <FuturePlans />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <PrivateRoute>
                  <Layout>
                    <Categories />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <PlaceholderPage title="Configurações" />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </PrivateRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
