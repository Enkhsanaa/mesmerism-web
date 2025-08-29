import { useRealtime } from "@/app/(dashboard)/realtime-provider";
import { useCallback, useEffect, useState } from "react";
import { useWeekStore } from "./use-week-store";
import { useCreatorProfileStore } from "./use-creator-profile-store";

export const useLeaderboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [creators, setCreators] = useState<WeekStanding[]>([]);
  const { supabase, subscribe } = useRealtime();
  const { currentWeekId } = useWeekStore();
  const { profiles, getProfile, isInitialized } = useCreatorProfileStore();

  const mapLeaderboard = useCallback(
    (r: LeaderboardEntry) => {
      const prof = getProfile(r.creator_user_id);
      return {
        weekId: r.week_id as number,
        weekNumber: r.week_id as number,
        weekTitle: `Week ${r.week_id}`,

        rank: r.rank as number,
        percent: Number(r.percent), // numeric -> number

        creatorId: r.creator_user_id as string,
        username: prof?.title ?? null,
        profileTitle: prof?.title ?? null,
        bubbleText: prof?.bubble_text ?? null,
        avatarUrl: prof?.avatar_url ?? null,
        coverImageUrl: prof?.cover_image_url ?? null,
      };
    },
    [profiles, isInitialized]
  );

  useEffect(() => {
    if (!isInitialized) return;
    const setupLeaderboard = async () => {
      setIsLoading(true);
      try {
        const { data, error: lbErr } = await supabase.rpc(
          "get_week_leaderboard_cached",
          { p_week_id: currentWeekId }
        );

        if (lbErr) throw lbErr;

        const leaderboard = data as LeaderboardEntry[];

        if (leaderboard.length === 0) {
          setCreators([]);
          return;
        }

        const rows: WeekStanding[] = (leaderboard ?? [])
          .map(mapLeaderboard)
          .sort((a: WeekStanding, b: WeekStanding) => a.rank - b.rank);

        setCreators(rows);
      } catch (error) {
        console.error("Error loading leaderboard:", error);
        setCreators([]);
      } finally {
        setIsLoading(false);
      }
    };
    setupLeaderboard();
  }, [currentWeekId, isInitialized]);

  // Listen for vote creator events
  useEffect(() => {
    const handleVoteCreator = (payload: {
      id: string;
      week_id: number;
      created_at: string;
      creator_user_id: string;
      leaderboard: {
        week_id: number;
        creator_user_id: string;
        percent: number;
        rank: number;
      }[];
    }) => {
      if (!creators || creators.length < 1) return;
      console.log("VOTE_CREATOR", payload);
      const updateLeaderboard = async () => {
        return Promise.all(
          payload.leaderboard.map(async (r: LeaderboardEntry) => {
            const leaderboardEntry = creators.find(
              (l: WeekStanding) => l.creatorId === r.creator_user_id
            );
            if (!leaderboardEntry) return mapLeaderboard(r);
            return {
              ...leaderboardEntry,
              percent: r.percent,
              rank: r.rank,
            } as WeekStanding;
          })
        );
      };
      updateLeaderboard().then((newLeaderboard) => {
        setCreators(newLeaderboard);
      });
    };

    const unsubscribeVoteCreator = subscribe("VOTE_CREATOR", handleVoteCreator);

    return () => {
      unsubscribeVoteCreator();
    };
  }, [subscribe]);
  return {
    isLoading,
    creators,
  };
};
