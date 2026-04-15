import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/**
 * Reusable animated back button.
 * @param {string} label  - Text shown next to the arrow (default: "Go Back")
 * @param {string} variant - "light" (white text, for dark/image backgrounds) | "dark" (slate text, for light backgrounds)
 */
export default function BackButton({ label = "Go Back", variant = "dark", className = "" }) {
  const navigate = useNavigate();

  const base =
    "group inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 select-none cursor-pointer";

  const variants = {
    dark: "text-foreground bg-muted hover:bg-muted/80",
    light:
      "text-white bg-black/40 backdrop-blur-sm border border-white/20 hover:bg-black/60",
    primary: "text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`${base} ${variants[variant]} ${className}`}
    >
      <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
      {label}
    </button>
  );
}
