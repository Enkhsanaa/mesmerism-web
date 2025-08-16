"use client";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import VoteModal from "./modals/vote.modal";
import { useState } from "react";

export default function Youtubelist() {
  const [openVoteModal, setOpenVoteModal] = useState(false);

  const handleCloseVoteModal = () => {
    setOpenVoteModal(false);
  };

  return (
    <>
      <div
        className="flex flex-col justify-center py-4 w-[750px] h-[140px] rounded-3xl mt-5"
        style={{ backgroundColor: "#292B2F" }}
      >
        <div className="mx-auto relative flex items-center bg-dark-background w-[686px] h-[100px] rounded-3xl px-6">
          {/* Left: Rank */}
          <span className="text-white text-base mr-4">1</span>
          {/* Avatar with badge */}
          <div className="relative mr-4">
            <Avatar className="size-12 border-yellow-300 border-2">
              <AvatarImage src="https://github.com/enkhsanaa.png" />
              <AvatarFallback>EN</AvatarFallback>
            </Avatar>
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-700 text-xs text-white px-2 py-0.5 rounded-full">
              PLS
            </span>
          </div>
          {/* Username and progress */}
          <div className="flex-1">
            <div className="text-white font-semibold">Markiplier</div>
            <div className="w-full bg-gray-800 rounded-full h-1">
              <div
                className="bg-yellow-300 h-1 rounded-full"
                style={{ width: "80%" }}
              />
            </div>
          </div>
          {/* Right: Button with accent */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
            <button
              className="flex items-center gap-2 bg-transparent text-white px-4 py-2 rounded-2xl font-bold shadow-lg"
              onClick={() => setOpenVoteModal(true)}
            >
              Санал өгөх
            </button>
          </div>
          {/* Accent flame/shape can be added as an absolutely positioned SVG or image */}
          {/* <img src="/flame-accent.svg" className="absolute right-0 top-0 h-full" alt="" /> */}
        </div>
      </div>

      {/* Vote Modal */}
      <VoteModal
        availableCoins={500}
        isOpen={openVoteModal}
        onClose={handleCloseVoteModal}
        username="Markiplier"
      />
    </>
  );
}
