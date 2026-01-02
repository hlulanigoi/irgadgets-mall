import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ShopsList from "@/pages/ShopsList";
import ShopDetail from "@/pages/ShopDetail";
import TasksList from "@/pages/TasksList";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shops" component={ShopsList} />
      <Route path="/shops/:id" component={ShopDetail} />
      <Route path="/tasks" component={TasksList} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
