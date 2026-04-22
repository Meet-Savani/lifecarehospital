import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext";

// Global error handler for chunk loading failures (Failed to fetch dynamically imported module)
// This happens after a new deployment when the browser tries to load an old chunk hash.
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && (
      event.reason.name === 'ChunkLoadError' || 
      /Failed to fetch dynamically imported module/.test(event.reason.message) ||
      /Importing a module script failed/.test(event.reason.message)
  )) {
    // Check if we've already tried to reload to avoid infinite loops
    const hasReloaded = sessionStorage.getItem('chunk-load-reloaded');
    if (!hasReloaded) {
      sessionStorage.setItem('chunk-load-reloaded', 'true');
      window.location.reload();
    }
  }
});

// Clear the reload flag after a successful load
sessionStorage.removeItem('chunk-load-reloaded');

createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
