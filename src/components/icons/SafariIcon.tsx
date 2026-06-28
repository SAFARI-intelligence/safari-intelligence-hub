import { type ComponentPropsWithoutRef } from "react";
import { iconRegistry, type IconName } from "./registry";

export type IconSize = "sm" | "md" | "nav" | "feature";
export type IconTone = "default" | "active" | "muted" | "disabled" | "premium";

const sizeMap: Record<IconSize, number> = {
  sm: 16,
  md: 20,
  nav: 24,
  feature: 32,
};

const toneClass: Record<IconTone, string> = {
  default: "text-muted-foreground",
  active: "text-[var(--gold)]",
  muted: "text-foreground/60",
  disabled: "text-foreground/30",
  premium: "text-[var(--gold)]",
};

type SVGAttrs = Omit<ComponentPropsWithoutRef<"svg">, "ref">;

export interface SafariIconProps extends Omit<SVGAttrs, "name" | "size"> {
  name: IconName;
  size?: IconSize | number;
  tone?: IconTone;
  /** Adds smooth hover scale + color shift to gold. */
  interactive?: boolean;
  /** Override stroke width (default 1.75 per system). */
  strokeWidth?: number;
}

export function SafariIcon({
  name,
  size = "nav",
  tone = "default",
  interactive = false,
  strokeWidth = 1.75,
  className = "",
  ...rest
}: SafariIconProps) {
  const def = iconRegistry[name];
  if (!def) return null;
  const Component = def.Component as React.ElementType;
  const px = typeof size === "number" ? size : sizeMap[size];

  const classes = [
    toneClass[tone],
    interactive
      ? "transition-all duration-150 ease-out hover:scale-105 hover:text-[var(--gold)]"
      : "transition-colors duration-150 ease-out",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (tone === "premium") {
    return (
      <span className="relative inline-grid place-items-center" style={{ width: px, height: px }}>
        <span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklab, var(--gold) 22%, transparent) 0%, transparent 70%)",
          }}
        />
        <Component
          width={px}
          height={px}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`relative ${classes}`}
          {...rest}
        />
      </span>
    );
  }

  return (
    <Component
      width={px}
      height={px}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={classes}
      {...rest}
    />
  );
}
