import React from "react"; // Import React to enable JSX
import type { RouteObject } from "react-router-dom";
import SigmoidKernelParameters from "@/pages/SigmoidKernelParameters"; // Ensure the path is correct

export const sigmoidParameterRoute: RouteObject = {
  path: "/sigmoid-parameter",
  element: React.createElement(SigmoidKernelParameters), // Use React.createElement for compatibility
};
