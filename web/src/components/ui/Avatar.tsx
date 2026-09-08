import { useState } from "react";

type AvatarSize = "sm" | "md" | "lg";
type AvatarShape = "circle" | "square";

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-6 w-6 text-xs",
  md: "h-7 w-7 text-xs",
  lg: "h-9 w-9 text-sm",
};

const shapeClasses: Record<AvatarShape, string> = {
  circle: "rounded-full",
  square: "rounded-md",
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface AvatarProps {
  name: string;
  src?: string | null;
  color?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
}

export default function Avatar({
  name,
  src,
  color,
  size = "md",
  shape = "circle",
}: AvatarProps) {
  const [broken, setBroken] = useState(false);

  if (src && !broken) {
    return (
      <img
        src={src}
        alt={name}
        title={name}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
        className={[
          "inline-block shrink-0 object-cover",
          sizeClasses[size],
          shapeClasses[shape],
        ].join(" ")}
      />
    );
  }

  return (
    <span
      className={[
        "inline-flex shrink-0 select-none items-center justify-center font-semibold",
        color ? "text-ink" : "bg-brand-soft text-brand",
        sizeClasses[size],
        shapeClasses[shape],
      ].join(" ")}
      style={
        color
          ? {
              backgroundColor: `color-mix(in oklab, ${color} 25%, var(--color-surface))`,
            }
          : undefined
      }
      title={name}
    >
      {initialsOf(name)}
    </span>
  );
}
