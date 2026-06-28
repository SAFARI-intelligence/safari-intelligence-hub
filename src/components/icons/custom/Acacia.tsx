import { forwardRef, type SVGProps } from "react";

export const Acacia = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  function Acacia(props, ref) {
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
        {/* Flat-top canopy */}
        <path d="M3.5 7.5C6 6 10 5.5 12 5.5s6 0.5 8.5 2" />
        <path d="M4 8c2.5 1 6 1.25 8 1.25S17.5 9 20 8" />
        {/* Trunk + branches */}
        <path d="M12 9.5V21" />
        <path d="M12 12.5l-3 2.5" />
        <path d="M12 14l3 2" />
        {/* Ground */}
        <path d="M7.5 21h9" />
      </svg>
    );
  },
);
