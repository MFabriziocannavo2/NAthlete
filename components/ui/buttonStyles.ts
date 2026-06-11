export type ButtonVariant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-900/40 hover:from-orange-500 hover:to-amber-400",
  secondary:
    "border border-white/15 text-white hover:bg-white/10",
  ghost: "text-gray-300 hover:text-white hover:bg-white/10",
};

export function buttonClass(
  variant: ButtonVariant = "primary",
  className = ""
) {
  return `${base} ${variants[variant]} ${className}`.trim();
}
