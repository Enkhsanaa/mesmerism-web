"use client";

import { useModal } from "@/app/(dashboard)/modal-provider";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, HandHeart, Search } from "lucide-react";
import { toast } from "sonner";
import { useState, useMemo, useEffect, useRef } from "react";
import BubbleIcon from "./icons/bubble";
import Fire from "./icons/fire";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { GlassButton } from "./ui/glass-button";
import { Input } from "./ui/input";

// Fuzzy search function
function fuzzySearch(query: string, text: string): boolean {
  if (!query) return true;

  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  let queryIndex = 0;
  let textIndex = 0;

  while (queryIndex < queryLower.length && textIndex < textLower.length) {
    if (queryLower[queryIndex] === textLower[textIndex]) {
      queryIndex++;
    }
    textIndex++;
  }

  return queryIndex === queryLower.length;
}

function CreatorCard({
  creator,
  previousRank,
}: {
  creator: WeekStanding;
  previousRank: number | null;
}) {
  const { setSelectedCreator, setVoteModalOpen } = useModal();

  const getInitials = (username: string | null) => {
    if (!username) return "??";
    return username.slice(0, 2).toUpperCase();
  };

  // Calculate ranking change
  const getRankingChange = () => {
    if (!previousRank) return null; // No previous rank to compare

    const change = previousRank - creator.rank;
    if (change > 0) {
      return { type: "up", value: change };
    } else if (change < 0) {
      return { type: "down", value: Math.abs(change) };
    } else {
      return { type: "same", value: 0 };
    }
  };

  const rankingChange = getRankingChange();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        layout: {
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
        opacity: { duration: 0.3 },
        y: { duration: 0.3 },
      }}
    >
      <div className="flex flex-col justify-center w-full rounded-3xl">
        <motion.div
          className="mx-auto relative flex items-center bg-dark-background w-full h-[100px] rounded-3xl px-6 isolate"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center flex-3/5 gap-2">
            {/* Left: Rank */}
            <div className="flex flex-col justify-around items-center">
              <motion.span
                className="text-white text-base font-semibold"
                key={creator.rank}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {creator.rank}
              </motion.span>
              {/* Ranking change indicator */}
              {rankingChange && (
                <AnimatePresence mode="wait">
                  {rankingChange.type === "up" && (
                    <motion.p
                      key="up"
                      className="flex items-center gap-1"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowUp className="text-[#4CAF50] size-4" />
                      <span className="text-[#3BA55C] text-sm font-semibold">
                        {rankingChange.value}
                      </span>
                    </motion.p>
                  )}

                  {rankingChange.type === "down" && (
                    <motion.p
                      key="down"
                      className="flex items-center gap-1"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowDown className="text-[#E53935] size-4" />
                      <span className="text-[#EF5350] text-sm font-semibold">
                        {rankingChange.value}
                      </span>
                    </motion.p>
                  )}

                  {rankingChange.type === "same" && (
                    <motion.p
                      key="same"
                      className="flex items-center gap-1"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-[#444444] text-sm font-semibold">
                        -
                      </span>
                    </motion.p>
                  )}
                </AnimatePresence>
              )}
            </div>
            {/* Avatar with badge */}
            <div className="relative mr-4">
              <Avatar className="size-12 border-yellow-300 border-2">
                <AvatarImage src={creator.avatarUrl || ""} />
                <AvatarFallback>{getInitials(creator.username)}</AvatarFallback>
              </Avatar>
              {!!creator.bubbleText && (
                <div className="absolute top-0 -translate-y-4/5 right-0 translate-x-3/4 w-[84px] h-[43px]">
                  <BubbleIcon className="text-white w-[84px] h-[43px]" />
                  <span className="absolute top-[14px] left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-white font-medium w-[84px] text-center overflow-hidden text-ellipsis whitespace-nowrap px-1 z-10">
                    {creator.bubbleText}
                  </span>
                </div>
              )}
            </div>
            {/* Username and progress */}
            <div className="flex-1 h-full flex gap-1 flex-col justify-between">
              <motion.div className="text-white font-semibold" layout>
                {creator.profileTitle || creator.username || "Unknown Creator"}
              </motion.div>
              <div className="w-full bg-gray-800 rounded-full h-1 overflow-hidden">
                <motion.div
                  className="bg-yellow-300 h-1 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(creator.percent, 100)}%` }}
                  transition={{
                    duration: 0.8,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                />
              </div>
              <motion.div
                className="text-white text-sm"
                key={creator.percent.toFixed(2)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {creator.percent.toFixed(2)}%
              </motion.div>
            </div>
          </div>
          {/* Right: Button with accent */}
          <div className="flex-2/5 flex justify-end">
            <GlassButton
              onClick={() => {
                if (!creator.username) {
                  toast.error("Unknown Creator");
                  return;
                }
                setSelectedCreator({
                  id: creator.creatorId,
                  username: creator.username,
                  avatar_url: creator.avatarUrl || "",
                  color: "#FAD02C",
                  created_at: new Date().toISOString(),
                  received_votes: 0,
                  quote: "",
                });
                setVoteModalOpen(true);
              }}
              size="md"
            >
              <div className="flex items-center gap-2">
                <HandHeart className="size-4" />
                Санал өгөх
              </div>
            </GlassButton>
          </div>
          {creator.rank < 4 && (
            <Fire
              className={cn(
                "absolute right-0 top-3 bottom-0 w-[344px] -z-10",
                creator.rank === 1 && "-top-20",
                creator.rank === 2 && "-top-10",
                creator.rank === 3 && "-top-5"
              )}
            />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

// Loading skeleton component
function CreatorCardSkeleton() {
  return (
    <div className="flex flex-col justify-center w-full rounded-3xl">
      <div className="mx-auto relative flex items-center bg-dark-background w-full h-[100px] rounded-3xl px-6 animate-pulse">
        <div className="flex items-center flex-3/5">
          {/* Rank skeleton */}
          <div className="w-4 h-4 bg-gray-600 rounded mr-4"></div>
          {/* Avatar skeleton */}
          <div className="size-12 bg-gray-600 rounded-full mr-4 border-2 border-gray-500"></div>
          {/* Username and progress skeleton */}
          <div className="flex-1 h-full flex gap-1 flex-col justify-between">
            <div className="w-32 h-4 bg-gray-600 rounded"></div>
            <div className="w-full bg-gray-800 rounded-full h-1">
              <div className="bg-gray-600 h-1 rounded-full w-1/3"></div>
            </div>
            <div className="w-12 h-3 bg-gray-600 rounded"></div>
          </div>
        </div>
        {/* Button skeleton */}
        <div className="flex-2/5 flex justify-end">
          <div className="w-24 h-8 bg-gray-600 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

export default function Youtubelist() {
  const { isLoading, creators } = useLeaderboard();
  const [searchQuery, setSearchQuery] = useState("");
  const [previousRanks, setPreviousRanks] = useState<Map<string, number>>(
    new Map()
  );
  const previousCreatorsRef = useRef<WeekStanding[]>([]);

  // Track ranking changes
  useEffect(() => {
    if (creators.length > 0) {
      const newPreviousRanks = new Map<string, number>();

      creators.forEach((creator) => {
        const previousCreator = previousCreatorsRef.current.find(
          (c) => c.creatorId === creator.creatorId
        );
        if (previousCreator) {
          newPreviousRanks.set(creator.creatorId, previousCreator.rank);
        }
      });

      setPreviousRanks(newPreviousRanks);
      previousCreatorsRef.current = [...creators];
    }
  }, [creators]);

  const filteredCreators = useMemo(() => {
    if (!searchQuery) {
      return creators;
    }
    return creators.filter((creator) => {
      const matchesUsername = fuzzySearch(searchQuery, creator.username || "");
      const matchesProfileTitle = fuzzySearch(
        searchQuery,
        creator.profileTitle || ""
      );
      return matchesUsername || matchesProfileTitle;
    });
  }, [creators, searchQuery]);

  console.log("rerendering");

  return (
    <div className="flex flex-col gap-6 bg-[#292B2F] rounded-3xl p-8 max-h-[80vh] overflow-hidden">
      <motion.div
        className="relative w-full m-0 p-0"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#DCDDDE] w-5 h-5" />
        <Input
          type="text"
          name="search"
          placeholder="Youtuber хайх"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 pr-12 bg-[#34373C] border-[#34373C] text-[#DCDDDE] placeholder:text-[#DCDDDE] h-12 rounded-lg"
        />
      </motion.div>

      {searchQuery && (
        <motion.div
          className="text-sm text-gray-400 mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {filteredCreators.length} Youtuber олдлоо
        </motion.div>
      )}

      <div className="grid gap-4 relative">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            // Show skeleton loaders while loading
            Array.from({ length: 40 }).map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                }}
              >
                <CreatorCardSkeleton />
              </motion.div>
            ))
          ) : filteredCreators.length > 0 ? (
            // Show actual creators when loaded
            filteredCreators.map((creator, index) => (
              <motion.div
                key={creator.creatorId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                <CreatorCard
                  creator={creator}
                  previousRank={previousRanks.get(creator.creatorId) || null}
                />
              </motion.div>
            ))
          ) : searchQuery ? (
            // Show no search results message
            <motion.div
              className="text-center py-12 text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p>"{searchQuery}" гэсэн хайлтад тохирох Youtuber олдсонгүй</p>
            </motion.div>
          ) : (
            // Show empty state when no creators found
            <motion.div
              className="text-center py-12 text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p>Энэ 7 хоногт өрсөлдөх Youtuber-үүд сонгогдоогүй байна</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
