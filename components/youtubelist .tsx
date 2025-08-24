"use client";

import { useRealtime } from "@/app/(dashboard)/realtime-provider";
import { cn } from "@/lib/utils";
import { HandHeart, Search } from "lucide-react";
import { useEffect, useState } from "react";
import BubbleIcon from "./icons/bubble";
import Fire from "./icons/fire";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { GlassButton } from "./ui/glass-button";
import { Input } from "./ui/input";
import { useModal } from "@/app/(dashboard)/modal-provider";
import { toast } from "sonner";

function CreatorCard({ creator }: { creator: WeekStanding }) {
  const { setSelectedCreator, setVoteModalOpen } = useModal();

  const getInitials = (username: string | null) => {
    if (!username) return "??";
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <div>
      <div className="flex flex-col justify-center w-full rounded-3xl">
        <div className="mx-auto relative flex items-center bg-dark-background w-full h-[100px] rounded-3xl px-6 isolate">
          <div className="flex items-center flex-3/5">
            {/* Left: Rank */}
            <span className="text-white text-base mr-4">{creator.rank}</span>
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
              <div className="text-white font-semibold">
                {creator.profileTitle || creator.username || "Unknown Creator"}
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1">
                <div
                  className="bg-yellow-300 h-1 rounded-full"
                  style={{ width: `${Math.min(creator.percent, 100)}%` }}
                />
              </div>
              <div className="text-white text-sm">
                {creator.percent.toFixed(2)}%
              </div>
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
        </div>
      </div>
    </div>
  );
}

export default function Youtubelist() {
  const [creators, setCreators] = useState<WeekStanding[]>([]);
  const { supabase, currentWeekId } = useRealtime();

  useEffect(() => {
    const setupLeaderboard = async () => {
      // 1) call the security-definer function for the week
      const { data: leaderboard, error: lbErr } = await supabase.rpc(
        "get_week_leaderboard_cached",
        { p_week_id: currentWeekId }
      );

      if (lbErr) throw lbErr;

      // 2) fetch public profile/user fields for those creators (optional)
      const creatorIds = leaderboard.map((r: any) => r.creator_user_id);
      const uniqCreatorIds = Array.from(new Set(creatorIds));
      if (uniqCreatorIds.length === 0) return [];

      const [
        { data: profiles, error: pErr },
        { data: users, error: uErr },
        { data: wk, error: wErr },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("user_id, title, avatar_url, cover_image_url, bubble_text")
          .in("user_id", uniqCreatorIds),
        supabase.from("users").select("id, username").in("id", uniqCreatorIds),
        supabase
          .from("competition_weeks")
          .select("id, week_number, title")
          .eq("id", currentWeekId)
          .maybeSingle(),
      ]);

      if (pErr) throw pErr;
      if (uErr) throw uErr;
      if (wErr) throw wErr;

      const profileById = new Map(
        (profiles ?? []).map((p) => [
          p.user_id as string,
          p as {
            user_id: string;
            title: string | null;
            avatar_url: string | null;
            cover_image_url: string | null;
            bubble_text: string | null;
          },
        ])
      );
      const userById = new Map(
        (users ?? []).map((u) => [
          u.id as string,
          u as { id: string; username: string | null },
        ])
      );

      const weekNumber = wk?.week_number ?? null;
      const weekTitle =
        wk?.title ?? (weekNumber != null ? `Week ${weekNumber}` : null);

      // 2c) Build typed rows
      const rows: WeekStanding[] = (leaderboard ?? [])
        .map((r: any) => {
          const prof = profileById.get(r.creator_user_id);
          const usr = userById.get(r.creator_user_id);
          return {
            weekId: r.week_id as number,
            weekNumber,
            weekTitle,

            rank: r.rank as number,
            percent: Number(r.percent), // numeric -> number

            creatorId: r.creator_user_id as string,
            username: usr?.username ?? null,
            profileTitle: prof?.title ?? null,
            bubbleText: prof?.bubble_text ?? null,
            avatarUrl: prof?.avatar_url ?? null,
            coverImageUrl: prof?.cover_image_url ?? null,
          } satisfies WeekStanding;
        })
        .sort((a: WeekStanding, b: WeekStanding) => a.rank - b.rank);

      setCreators(rows);
    };
    setupLeaderboard();
  }, [currentWeekId]);

  return (
    <div className="flex flex-col gap-6 bg-[#292B2F] rounded-3xl p-8">
      <div className="relative w-full m-0 p-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#DCDDDE] w-5 h-5" />
        <Input
          type="text"
          name="search"
          placeholder="Youtuber хайх"
          defaultValue={""}
          className="pl-12 pr-12 bg-[#34373C] border-[#34373C] text-[#DCDDDE] placeholder:text-[#DCDDDE] h-12 rounded-lg"
        />
      </div>
      <div className="grid gap-4">
        {creators.map((creator) => (
          <CreatorCard key={creator.creatorId} creator={creator} />
        ))}
      </div>
    </div>
  );
}
