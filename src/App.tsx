import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import NotFound from "./pages/NotFound.tsx";

const HeatMap = lazy(() => import("@/pages/HeatMap"));
const GreenCover = lazy(() => import("@/pages/GreenCover"));
const Alerts = lazy(() => import("@/pages/Alerts"));
const About = lazy(() => import("@/pages/About"));

const queryClient = new QueryClient();

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-canodesk-green border-t-transparent animate-spin mx-auto mb-4" />
        <p className="font-mono text-sm text-canodesk-text-muted">Loading satellite data...</p>
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<><Home /><Footer /></>} />
            <Route path="/heatmap" element={<HeatMap />} />
            <Route path="/greencover" element={<GreenCover />} />
            <Route path="/alerts" element={<><Alerts /><Footer /></>} />
            <Route path="/about" element={<><About /><Footer /></>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
