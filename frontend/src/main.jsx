import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext";

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && (
      event.reason.name === 'ChunkLoadError' || 
      /Failed to fetch dynamically imported module/.test(event.reason.message) ||
      /Importing a module script failed/.test(event.reason.message)
  )) {
    const hasReloaded = sessionStorage.getItem('chunk-load-reloaded');
    if (!hasReloaded) {
      sessionStorage.setItem('chunk-load-reloaded', 'true');
      window.location.reload();
    }
  }
});

sessionStorage.removeItem('chunk-load-reloaded');

createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
