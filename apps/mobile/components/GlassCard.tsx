import type { PropsWithChildren } from "react";
import { Card } from "./primitives";

export function GlassCard({ children }: PropsWithChildren) {
  return <Card variant="glass" padding={16}>{children}</Card>;
}
