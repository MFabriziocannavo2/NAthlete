import Image from "next/image";

const SIZES = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 84,
} as const;

export default function Logo({
  size = "md",
  withWordmark = false,
  className = "",
}: {
  size?: keyof typeof SIZES;
  withWordmark?: boolean;
  className?: string;
}) {
  const px = SIZES[size];

  return (
    <span className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      <Image
        src="/brand/logo-mark.png"
        alt="NAthlete"
        width={1042}
        height={502}
        priority
        style={{ height: px, width: "auto" }}
      />
      {withWordmark && (
        <span
          className="font-extrabold tracking-tight bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent"
          style={{ fontSize: px * 0.62 }}
        >
          thlete
        </span>
      )}
    </span>
  );
}
