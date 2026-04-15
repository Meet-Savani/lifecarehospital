import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, state } = useLocation();

  useEffect(() => {
    // Don't scroll to top when navigating back/forward (browser history POP)
    if (state?.__scrollRestore) return;
    window.scrollTo(0, 0);
  }, [pathname, state]);

  return null;
};

export default ScrollToTop;
