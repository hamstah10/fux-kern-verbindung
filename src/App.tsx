import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import OperationsLayout from "@/components/OperationsLayout";
import LandingPage from "./pages/LandingPage";
import AdminDashboard from "./pages/AdminDashboard";
import LeadsPage from "./pages/LeadsPage";
import LeadDetailPage from "./pages/LeadDetailPage";
import VehiclesPage from "./pages/VehiclesPage";
import VehicleDetailPage from "./pages/VehicleDetailPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import DynoPage from "./pages/DynoPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import FilesPage from "./pages/FilesPage";
import PartnersPage from "./pages/PartnersPage";
import PartnerDetailPage from "./pages/PartnerDetailPage";
import DealerRequestsPage from "./pages/DealerRequestsPage";
import DealerRequestDetailPage from "./pages/DealerRequestDetailPage";
import MyGaragePage from "./pages/MyGaragePage";
import DealerPortalPage from "./pages/DealerPortalPage";
import ConfiguratorPage from "./pages/ConfiguratorPage";
import ConfiguratorResultPage from "./pages/ConfiguratorResultPage";
import NotFound from "./pages/NotFound";
import OperationsDashboardPage from "./pages/OperationsDashboardPage";
import OperationsOrdersPage from "./pages/OperationsOrdersPage";

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
            <Route path="/admin/leads/:id" element={<LeadDetailPage />} />
            <Route path="/admin/vehicles" element={<VehiclesPage />} />
            <Route path="/admin/vehicles/:id" element={<VehicleDetailPage />} />
            <Route path="/admin/recommendations" element={<RecommendationsPage />} />
            <Route path="/admin/dyno" element={<DynoPage />} />
            <Route path="/admin/orders" element={<OrdersPage />} />
            <Route path="/admin/orders/:id" element={<OrderDetailPage />} />
            <Route path="/admin/files" element={<FilesPage />} />
            <Route path="/admin/partners" element={<PartnersPage />} />
            <Route path="/admin/partners/:id" element={<PartnerDetailPage />} />
            <Route path="/admin/dealer-requests" element={<DealerRequestsPage />} />
            <Route path="/admin/dealer-requests/:id" element={<DealerRequestDetailPage />} />
            <Route path="/my-garage" element={<MyGaragePage />} />
            <Route path="/dealer" element={<DealerPortalPage />} />
          </Route>
          <Route element={<OperationsLayout />}>
            <Route path="/operations" element={<OperationsDashboardPage />} />
            <Route path="/operations/orders" element={<OperationsOrdersPage />} />
            <Route path="/operations/orders/:id" element={<OrderDetailPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
