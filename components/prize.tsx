"use client";

import { useRealtime } from "@/app/(dashboard)/realtime-provider";
import { Press_Start_2P } from "next/font/google";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { useWeekStore } from "@/hooks/use-week-store";

const pressStart2P = Press_Start_2P({ subsets: ["latin"], weight: "400" });

export default function Prize() {
  const { currentWeekId, setCurrentWeekId, weeks } = useWeekStore();
  const [totalPrize, setTotalPrize] = useState(15000000); // Default value
  const [currentTime, setCurrentTime] = useState(new Date());

  // Remove weekAvatars and use a single avatar for all
  const questionMarkAvatar = {
    src: "/Question.png", // Fixed path - removed /public/
    fallback: "?",
  };

  // Update time every second for live countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTimeRemaining = (endDate: string | null) => {
    if (!endDate) return "TBD";

    const now = currentTime.getTime();
    const end = new Date(endDate).getTime();
    const distance = end - now;

    if (distance < 0) return "Ended";

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    return `${days}days ${hours.toString().padStart(2, "0")}hours ${minutes
      .toString()
      .padStart(2, "0")}min ${seconds.toString().padStart(2, "0")}sec`;
  };

  const activeWeekData = weeks.find((week) => week.id === currentWeekId);

  if (!weeks.length) {
    return (
      <div
        className="flex justify-center py-4 w-full rounded-3xl"
        style={{ backgroundColor: "#292B2F" }}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1
              className={`${pressStart2P.className} text-xl md:text-2xl font-bold text-center mt-4`}
              style={{ color: "#B3CDA8" }}
            >
              Loading...
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex justify-center py-4 w-full rounded-3xl"
      style={{ backgroundColor: "#292B2F" }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1
            className={`${pressStart2P.className} text-xl md:text-2xl font-bold text-center mt-4`}
            style={{ color: "#B3CDA8" }}
          >
            CASH PRIZE
          </h1>
          <h2
            className={`${pressStart2P.className} text-3xl md:text-5xl font-bold text-center mt-6`}
            style={{ color: "#B3CDA8" }}
          >
            {totalPrize.toLocaleString()}
          </h2>
          <div className="flex flex-row flex-wrap justify-center gap-4 mt-8">
            {weeks.map((week) => (
              <div key={week.id} className="flex flex-col items-center">
                <Button
                  className={`bg-dark-background rounded-xl border-2 border-transparent hover:bg-dark active:bg-dark hover:border-[#B3CDA8] active:border-[#B3CDA8] transition-colors ${
                    currentWeekId === week.id ? "ring-2 ring-[#B3CDA8]" : ""
                  }`}
                  onClick={() => setCurrentWeekId(week.id)}
                >
                  <span
                    className={`${pressStart2P.className} text-2m font-bold`}
                    style={{ color: "#B3CDA8" }}
                  >
                    {week.title || `Week ${week.week_number}`}
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
            <p>Deadline: {getTimeRemaining(activeWeekData?.ends_at || null)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
