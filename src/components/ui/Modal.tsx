"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** dialog 无障碍标签 */
  label?: string;
  className?: string;
  backdropClassName?: string;
};

export function Modal({
  open,
  onClose,
  children,
  label = "对话框",
  className = "",
  backdropClassName,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-80 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label="关闭"
            className={`absolute inset-0 border-0 ${backdropClassName ?? "bg-black/55 backdrop-blur-[2px]"}`}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className={`relative z-10${className ? ` ${className}` : ""}`}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
