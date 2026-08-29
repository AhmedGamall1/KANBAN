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
  color?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
}

export default function Avatar({
  name,
  color,
  size = "md",
  shape = "circle",
}: AvatarProps) {
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
          ? { backgroundColor: `color-mix(in oklab, ${color} 20%, white)` }
          : undefined
      }
      title={name}
    >
      {initialsOf(name)}
    </span>
  );
}
