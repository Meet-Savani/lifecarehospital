import React from "react";
import { motion } from "framer-motion";

export default function InitialsAvatar({ name, className = "", size = "md" }) {
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  const sizeClasses = {
    sm: "w-8 h-8 text-[10px]",
    md: "w-12 h-12 text-sm",
    lg: "w-20 h-20 text-xl",
    xl: "w-32 h-32 text-3xl",
  };

  const bgColors = [
    "bg-primary/10 text-primary border-primary/20",
    "bg-indigo-50 text-indigo-600 border-indigo-100",
    "bg-emerald-50 text-emerald-600 border-emerald-100",
    "bg-rose-50 text-rose-600 border-rose-100",
    "bg-amber-50 text-amber-600 border-amber-100",
  ];

  // Simple hash to keep color consistent for a name
  const colorIndex = name ? name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % bgColors.length : 0;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`rounded-2xl border flex items-center justify-center font-black ${sizeClasses[size] || sizeClasses.md} ${bgColors[colorIndex]} ${className}`}
    >
      {initials}
    </motion.div>
  );
}
