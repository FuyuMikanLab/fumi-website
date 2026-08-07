"use client";

import { motion } from "framer-motion";

type SpinnerProps = {
  size?: number;
  className?: string;
};

/** accent 色圆环 spinner；size 为外径 px */
export function Spinner({ size = 28, className = "" }: SpinnerProps) {
  return (
    <motion.span
      aria-hidden
      className={`block rounded-full${className ? ` ${className}` : ""}`}
      style={{
        width: size,
        height: size,
        border: `${Math.max(2, Math.round(size / 12))}px solid color-mix(in srgb, var(--accent) 28%, transparent)`,
        borderTopColor: "var(--accent)",
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
    />
  );
}
