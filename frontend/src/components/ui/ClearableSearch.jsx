import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * Search input with an animated X clear button.
 * @param {string} value - current search value
 * @param {function} onChange - called with the new value (string)
 * @param {string} placeholder
 * @param {string} className - extra classes on the wrapper div
 * @param {string} inputClassName - extra classes on the Input element
 * @param {Component} leftIcon - optional lucide icon component for the left side
 */
export default function ClearableSearch({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  inputClassName = "",
  leftIcon: LeftIcon,
}) {
  return (
    <div className={`relative group flex items-center transition-all duration-300 ${className} 
      focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary/50 rounded-[--radius]`}>
      {LeftIcon && (
        <LeftIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none z-10 group-focus-within:text-primary transition-colors duration-300" />
      )}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-14 bg-muted/30 border-border border-2 focus:bg-card focus:border-primary focus-visible:ring-0 transition-all duration-300 rounded-[--radius] font-medium text-foreground placeholder:text-muted-foreground/50 shadow-sm ${LeftIcon ? "pl-14" : "pl-6"} ${value ? "pr-12" : "pr-6"} ${inputClassName}`}
      />

      {/* Animated clear button */}
      <button
        type="button"
        onClick={() => onChange("")}
        aria-label="Clear search"
        style={{
          opacity: value ? 1 : 0,
          transform: value ? "scale(1) translateY(-50%)" : "scale(0.5) translateY(-50%)",
          pointerEvents: value ? "auto" : "none",
          transition: "opacity 0.2s ease, transform 0.2s ease",
        }}
        className="absolute right-3 top-1/2 flex items-center justify-center w-6 h-6 rounded-full bg-muted hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all duration-200 shadow-sm"
      >
        <X className="w-3.5 h-3.5" strokeWidth={2.5} />
      </button>
    </div>
  );
}

