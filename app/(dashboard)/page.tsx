"use client";

import Banner from "@/components/banner";
import { LivechatClient } from "@/components/livechat-client";
import Prize from "@/components/prize";
import YoutubeList from "@/components/youtubelist ";

export default function Home() {
  return (
    <>
      <Banner />
      <div className="md:flex flex-wrap w-full gap-5">
        <div className="flex-1 flex flex-col gap-8">
          <Prize />
          <YoutubeList />
        </div>
        <div className="flex-1 max-w-[530px]">
          <LivechatClient />
        </div>
      </div>
    </>
  );
}
