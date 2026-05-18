import { forwardRef, type SVGProps } from "react";

export const Tent = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  function Tent(props, ref) {
    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        {/* Outer roof slopes */}
        <path d="M3 20L12 4l9 16" />
        {/* Side guy lines */}
        <path d="M3 20l3-3" />
        <path d="M21 20l-3-3" />
        {/* Door opening */}
        <path d="M10 20l2-4 2 4" />
        {/* Ground */}
        <path d="M2.5 20h19" />
      </svg>
    );
  }
);
