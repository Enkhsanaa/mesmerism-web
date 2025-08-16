"use client";

import { Button } from "./ui/button";
import { Press_Start_2P } from "next/font/google";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useState } from "react";

const pressStart2P = Press_Start_2P({ subsets: ["latin"], weight: "400" });

export default function Prize() {
  const [activeWeek, setActiveWeek] = useState(1); // Default to week 1
  const weeks = [1, 2, 3, 4];
  // Remove weekAvatars and use a single avatar for all
  const questionMarkAvatar = {
    src: "/public/question.png", // Example question mark avatar
    fallback: "?",
  };

  return (
    <div
      className="flex justify-center py-4 w-full h-[368px] rounded-3xl"
      style={{ backgroundColor: "#292B2F" }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1
            className={`${pressStart2P.className} text-2xl font-bold text-center mt-4`}
            style={{ color: "#B3CDA8" }}
          >
            CASH PRIZE
          </h1>
          <h2
            className={`${pressStart2P.className} text-5xl font-bold text-center mt-6`}
            style={{ color: "#B3CDA8" }}
          >
            15,000,000
          </h2>
          <div className="flex flex-row justify-center gap-x-4 mt-8">
            {weeks.map((week) => (
              <div key={week} className="flex flex-col items-center">
                <Button
                  className={`bg-dark-background rounded-xl border-2 border-transparent hover:bg-dark active:bg-dark hover:border-[#B3CDA8] active:border-[#B3CDA8] transition-colors ${
                    activeWeek === week ? "ring-2 ring-[#B3CDA8]" : ""
                  }`}
                  onClick={() => setActiveWeek(week)}
                >
                  <span
                    className={`${pressStart2P.className} text-2m font-bold`}
                    style={{ color: "#B3CDA8" }}
                  >
                    Week {week}
                  </span>
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4 justify-center">
            {[0, 1, 2, 3].map((idx) => (
              <Avatar key={idx} className="size-14">
                <AvatarImage src={questionMarkAvatar.src} />
                <AvatarFallback>{questionMarkAvatar.fallback}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div
            className={`${pressStart2P.className} text-xs font-bold text-center mt-2`}
            style={{ color: "#B3CDA8" }}
          >
            <p>Deadline: 15days 08hours 30min 30sec</p>
          </div>
        </div>
      </div>
    </div>
  );
}
