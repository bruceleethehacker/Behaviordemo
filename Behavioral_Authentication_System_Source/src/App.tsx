import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RegisterScreen from "./pages/RegisterScreen";
import EnrollmentScreen from "./pages/EnrollmentScreen";
import ReportScreen from "./pages/ReportScreen";
import AuthMonitorScreen from "./pages/AuthMonitorScreen";
import AdminScreen from "./pages/AdminScreen";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/enrollment" element={<EnrollmentScreen />} />
          <Route path="/report" element={<ReportScreen />} />
          <Route path="/auth-monitor" element={<AuthMonitorScreen />} />
          <Route path="/admin" element={<AdminScreen />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
