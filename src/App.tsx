import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Introduction from "./pages/Introduction";
import Parameters from "./pages/Parameters";
import LinearKernel from "./pages/LinearKernel";
import LinearParameters from "./pages/LinearParameters";
import PolynomialKernel from "./pages/PolynomialKernel";
import RBFKernel from "./pages/RBFKernel";
import RBFParameters from "./pages/RBFParameters";
import SigmoidKernel from "./pages/SigmoidKernel";
import SigmoidParameters from "./pages/SigmoidKernelParameters";
import NotFound from "./pages/NotFound";
import SigmoidKernelParameters from "./pages/SigmoidKernelParameters";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Introduction />} />
          <Route path="/parameters" element={<Parameters />} />
          <Route path="/linear-kernel" element={<LinearKernel />} />
          <Route path="/linear-parameters" element={<LinearParameters />} />
          <Route path="/polynomial-kernel" element={<PolynomialKernel />} />
          <Route path="/rbf-kernel" element={<RBFKernel />} />
          <Route path="/rbf-parameters" element={<RBFParameters />} />
          <Route path="/sigmoid-kernel" element={<SigmoidKernel />} />
          <Route path="/sigmoid-parameter" element={<SigmoidKernelParameters />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
