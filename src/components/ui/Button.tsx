import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "ghost" | "text";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
};

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    "rounded-xl bg-(--accent) px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-105 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  ghost:
    "rounded-full bg-white/90 px-5 py-2 text-sm font-medium text-foreground shadow-lg ring-1 ring-black/5 backdrop-blur transition hover:bg-white disabled:pointer-events-none disabled:opacity-50",
  text: "rounded-full bg-transparent px-5 py-2 text-sm font-medium text-foreground transition disabled:pointer-events-none disabled:opacity-50 ring-1 ring-black/5",
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${VARIANT_CLASS[variant]}${className ? ` ${className}` : ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
