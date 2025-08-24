"use client";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import VoteModal from "./modals/vote.modal";
import { useEffect, useState } from "react";
import { useRealtime } from "@/app/(dashboard)/realtime-provider";

function CreatorCard({ creator }: { creator: WeekStanding }) {
  const [openVoteModal, setOpenVoteModal] = useState(false);

  const handleCloseVoteModal = () => {
    setOpenVoteModal(false);
  };
  return (
    <div>
      <div
        className="flex flex-col justify-center py-4 w-full h-[140px] rounded-3xl mt-5 px-6"
        style={{ backgroundColor: "#292B2F" }}
      >
        <div className="mx-auto relative flex items-center bg-dark-background w-full h-[100px] rounded-3xl px-6">
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
        isOpen={openVoteModal}
        onClose={handleCloseVoteModal}
        creator={{
          id: "1",
          username: "Markiplier",
          avatar_url: "https://github.com/enkhsanaa.png",
          color: "#FAD02C",
        }}
      />
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
          .select("user_id, title, avatar_url, cover_image_url")
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
    <>
      {creators.map((creator) => (
        <CreatorCard key={creator.creatorId} creator={creator} />
      ))}
    </>
  );
}
