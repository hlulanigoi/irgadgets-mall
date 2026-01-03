import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ShopsList from "@/pages/ShopsList";
import ShopDetail from "@/pages/ShopDetail";
import TasksList from "@/pages/TasksList";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminShops from "@/pages/admin/AdminShops";
import AdminOrders from "@/pages/admin/AdminOrders";
import ShopOwnerDashboard from "@/pages/shop-owner/ShopOwnerDashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shops" component={ShopsList} />
      <Route path="/shops/:id" component={ShopDetail} />
      <Route path="/tasks" component={TasksList} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/shops" component={AdminShops} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/dashboard" component={ShopOwnerDashboard} />
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
