import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop
 * Aggressively ensures the page starts from the very top on every load/route change:
 * - Disables browser scroll restoration
 * - Forces instant scroll to top (no animation)
 * - Handles both full page loads and SPA navigation
 * - Uses multiple techniques to ensure it works across browsers
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  const forceScrollTop = useCallback(() => {
    // Force scroll to top using multiple techniques
    if (typeof window !== "undefined") {
      // 1. Force immediate scroll with native API
      window.scrollTo(0, 0);
      
      // 2. Double-check in next frame
      requestAnimationFrame(() => {
        // Ensure any scroll animations are disabled
        const root = document.documentElement;
        const body = document.body;
        const prev = {
          htmlScroll: root.style.scrollBehavior,
          bodyScroll: body.style.scrollBehavior
        };
        
        root.style.scrollBehavior = "auto";
        body.style.scrollBehavior = "auto";
        
        // Force scroll again to catch any race conditions
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        
        // Restore scroll behaviors after a moment
        setTimeout(() => {
          root.style.scrollBehavior = prev.htmlScroll;
          body.style.scrollBehavior = prev.bodyScroll;
        }, 50);
      });
    }
  }, []);

  // Disable browser scroll restoration on mount
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      const prev = window.history.scrollRestoration;
      window.history.scrollRestoration = "manual";
      forceScrollTop(); // Ensure top scroll on initial load
      return () => {
        window.history.scrollRestoration = prev;
      };
    }
  }, [forceScrollTop]);

  // Force scroll top on route changes
  useEffect(() => {
    forceScrollTop();
  }, [pathname, forceScrollTop]);

  return null;
};

export default ScrollToTop;
