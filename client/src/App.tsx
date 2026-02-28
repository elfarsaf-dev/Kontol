import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Search from "@/pages/search";
import Library from "@/pages/library";
import NotFound from "@/pages/not-found";
import Player from "@/components/Player";
import { PlayerProvider } from "@/hooks/use-player";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/library" component={Library} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PlayerProvider>
        <TooltipProvider>
          <Toaster />
          <div className="relative min-h-screen flex">
            <Router />
            <Player />
          </div>
        </TooltipProvider>
      </PlayerProvider>
    </QueryClientProvider>
  );
}

export default App;
