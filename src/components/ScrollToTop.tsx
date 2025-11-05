import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    // Temporarily disable smooth scrolling to avoid mid-page anchors or inertia
    root.style.scrollBehavior = "auto";
    window.scrollTo({ top: 0, left: 0 });
    // Restore prior behavior (Tailwind sets smooth globally)
    root.style.scrollBehavior = previousBehavior;
  }, [pathname]);

  return null;
};

export default ScrollToTop;



