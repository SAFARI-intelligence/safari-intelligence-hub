import type { PropsWithChildren } from "react";
import { Button, type ButtonProps } from "./primitives";

interface PremiumButtonProps extends Omit<ButtonProps, "variant" | "children"> {}

export function PremiumButton({ children, ...props }: PropsWithChildren<PremiumButtonProps>) {
  return (
    <Button variant="primary" {...props}>
      {children}
    </Button>
  );
}
