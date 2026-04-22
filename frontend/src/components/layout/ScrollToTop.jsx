import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, key } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // If it's a new page entry, always scroll to the top
    if (navType === "PUSH" || navType === "REPLACE") {
      window.scrollTo(0, 0);
    } 
    else if (navType === "POP") {
      const savedPosition = sessionStorage.getItem(`scroll-${key}`);
      if (savedPosition !== null) {
        requestAnimationFrame(() => {
          window.scrollTo(0, parseInt(savedPosition, 10));
        });
      }
    }
  }, [pathname, key, navType]);

  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem(`scroll-${key}`, window.scrollY.toString());
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [key]);

  return null;
};

export default ScrollToTop;
