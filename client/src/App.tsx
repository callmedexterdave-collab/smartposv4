import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import { queryClient } from "./lib/queryClient";

// Import pages
import SplashScreen from "@/pages/splash";
import RoleSelection from "@/pages/role-selection";
import AdminLogin from "@/pages/admin-login";
import AdminSignup from "@/pages/admin-signup";
import StaffLogin from "@/pages/staff-login";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminMain from "@/pages/admin-main";
import ScannerSales from "@/pages/scanner-sales";
import InventoryManagement from "@/pages/inventory-management";
import StaffManagement from "@/pages/staff-management";
import ProfileSettings from "@/pages/profile-settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={SplashScreen} />
      <Route path="/role-selection" component={RoleSelection} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin-signup" component={AdminSignup} />
      <Route path="/staff-login" component={StaffLogin} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/admin-main" component={AdminMain} />
      <Route path="/scanner" component={ScannerSales} />
      <Route path="/inventory" component={InventoryManagement} />
      <Route path="/staff" component={StaffManagement} />
      <Route path="/profile" component={ProfileSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppProvider>
            <Toaster />
            <Router />
          </AppProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
