"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";
import Lottie from "lottie-react";
import animationDataRaw from "./fire.json";

interface FireProps {
  className?: HTMLAttributes<HTMLDivElement>["className"];
}

export default function Fire({ className }: FireProps) {
  const animationData =
    typeof structuredClone === "function"
      ? structuredClone(animationDataRaw)
      : JSON.parse(JSON.stringify(animationDataRaw));
  return (
    <div className={cn("", className)}>
      <Lottie
        className="w-full h-full"
        animationData={animationData}
        loop={true}
        autoplay={true}
      />
    </div>
  );
}
