"use client";

import dynamic from "next/dynamic";
import { preloadAnimation } from "@omni/ds";
import type { LottieIconProps } from "@omni/ds";

const LottieIcon = dynamic(
    () => import("@omni/ds").then((mod) => mod.LottieIcon),
    { ssr: false }
);

export { LottieIcon, preloadAnimation };
export type { LottieIconProps };
