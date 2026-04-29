import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Finances from "./pages/Finances";
import Savings from "./pages/Savings";
import Cards from "./pages/Cards";
import Categories from "./pages/Categories";
import CardDetails from "./pages/Cards/CardDetails";
import FuturePlans from "./pages/FuturePlans";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AuthProvider, { PrivateRoute } from "@/components/AuthProvider";
import Profile from "./pages/Profile";

import { Layout } from "@/components/Layout";

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
        <BrowserRouter>
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
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

const rootElement = document.getElementById("root")!;
const root = (rootElement as any)._reactRoot || createRoot(rootElement);
(rootElement as any)._reactRoot = root;
root.render(<App />);
