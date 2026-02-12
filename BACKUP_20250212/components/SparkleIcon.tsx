"use client";

import { Sparkle } from "phosphor-react";

export function SparkleIcon({ className, weight = "fill" }: { className?: string; weight?: "fill" | "regular" | "duotone" }) {
  return <Sparkle className={className} weight={weight} />;
}
