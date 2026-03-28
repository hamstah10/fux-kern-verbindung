import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import LandingPage from "./pages/LandingPage";
import AdminDashboard from "./pages/AdminDashboard";
import LeadsPage from "./pages/LeadsPage";
import VehiclesPage from "./pages/VehiclesPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import DynoPage from "./pages/DynoPage";
import OrdersPage from "./pages/OrdersPage";
import FilesPage from "./pages/FilesPage";
import PartnersPage from "./pages/PartnersPage";
import DealerRequestsPage from "./pages/DealerRequestsPage";
import MyGaragePage from "./pages/MyGaragePage";
import DealerPortalPage from "./pages/DealerPortalPage";
import ConfiguratorPage from "./pages/ConfiguratorPage";
import ConfiguratorResultPage from "./pages/ConfiguratorResultPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/configurator" element={<ConfiguratorPage />} />
          <Route path="/configurator/:id" element={<ConfiguratorResultPage />} />
          <Route element={<AppLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/leads" element={<LeadsPage />} />
            <Route path="/admin/vehicles" element={<VehiclesPage />} />
            <Route path="/admin/recommendations" element={<RecommendationsPage />} />
            <Route path="/admin/dyno" element={<DynoPage />} />
            <Route path="/admin/orders" element={<OrdersPage />} />
            <Route path="/admin/files" element={<FilesPage />} />
            <Route path="/admin/partners" element={<PartnersPage />} />
            <Route path="/admin/dealer-requests" element={<DealerRequestsPage />} />
            <Route path="/my-garage" element={<MyGaragePage />} />
            <Route path="/dealer" element={<DealerPortalPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
