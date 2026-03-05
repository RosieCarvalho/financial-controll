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
import CardDetails from "./pages/CardDetails";
import FuturePlans from "./pages/FuturePlans";
import NotFound from "./pages/NotFound";

import { Layout } from "@/components/Layout";

const queryClient = new QueryClient();

const PlaceholderPage = ({ title }: { title: string }) => (
  <Layout>
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <h1 className="text-3xl font-bold text-primary">{title}</h1>
      <p className="text-muted-foreground max-w-md text-center">
        Este módulo está em desenvolvimento. Continue solicitando alterações para completar as funcionalidades do sistema financeiro.
      </p>
    </div>
  </Layout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Index /></Layout>} />
          <Route path="/finances" element={<Layout><Finances /></Layout>} />
          <Route path="/cards" element={<Layout><Cards /></Layout>} />
          <Route path="/cards/:id" element={<Layout><CardDetails /></Layout>} />
          <Route path="/savings" element={<Layout><Savings /></Layout>} />
          <Route path="/future-plans" element={<Layout><FuturePlans /></Layout>} />
          <Route path="/categories" element={<Layout><Categories /></Layout>} />
          <Route path="/settings" element={<PlaceholderPage title="Configurações" />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const rootElement = document.getElementById("root")!;
const root = (rootElement as any)._reactRoot || createRoot(rootElement);
(rootElement as any)._reactRoot = root;
root.render(<App />);
