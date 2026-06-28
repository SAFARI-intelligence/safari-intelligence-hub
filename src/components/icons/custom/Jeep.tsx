import { forwardRef, type SVGProps } from "react";

export const Jeep = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(function Jeep(props, ref) {
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
      {/* Roof rack */}
      <path d="M5 7h14" />
      {/* Cabin top */}
      <path d="M6 9V7M18 9V7" />
      {/* Body */}
      <path d="M2.5 15v-3a2 2 0 0 1 2-2h15a2 2 0 0 1 2 2v3" />
      {/* Hood line + windshield */}
      <path d="M6 10V8.5a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 18 8.5V10" />
      {/* Windshield divider */}
      <path d="M12 7v3" />
      {/* Bottom chassis */}
      <path d="M2.5 15h2M9.5 15h5M19.5 15h2" />
      {/* Wheels */}
      <circle cx="7" cy="16.5" r="1.75" />
      <circle cx="17" cy="16.5" r="1.75" />
    </svg>
  );
});
