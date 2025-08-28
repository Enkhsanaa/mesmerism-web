import { useRealtimeStore } from "@/lib/stores/realtime-store";
import { useEffect, useState } from "react";

export const useLeaderboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [creators, setCreators] = useState<WeekStanding[]>([]);
  const { supabase, currentWeekId, subscribe } = useRealtimeStore();

  useEffect(() => {
    const setupLeaderboard = async () => {
      setIsLoading(true);
      try {
        // 1) call the security-definer function for the week
        const { data: leaderboard, error: lbErr } = await supabase.rpc(
          "get_week_leaderboard_cached",
          { p_week_id: currentWeekId }
        );

        if (lbErr) throw lbErr;

        // 2) fetch public profile/user fields for those creators (optional)
        const creatorIds = leaderboard.map(
          (r: LeaderboardEntry) => r.creator_user_id
        );
        const uniqCreatorIds = Array.from(new Set(creatorIds));
        if (uniqCreatorIds.length === 0) {
          setCreators([]);
          return;
        }

        const [
          { data: profiles, error: pErr },
          { data: users, error: uErr },
          { data: wk, error: wErr },
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("user_id, title, avatar_url, cover_image_url, bubble_text")
            .in("user_id", uniqCreatorIds),
          supabase
            .from("users")
            .select("id, username")
            .in("id", uniqCreatorIds),
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
      } catch (error) {
        console.error("Error loading leaderboard:", error);
        setCreators([]);
      } finally {
        setIsLoading(false);
      }
    };
    setupLeaderboard();
  }, [currentWeekId]);

  // Listen for vote creator events
  useEffect(() => {
    const handleVoteCreator = (payload: {
      id: string;
      week_id: number;
      created_at: string;
      creator_user_id: string;
      leaderboard: {
        creator_user_id: string;
        percent: number;
        rank: number;
      }[];
    }) => {
      if (!creators || creators.length < 1) return;
      console.log("VOTE_CREATOR", payload);
      const updateLeaderboard = async () => {
        const { data: week, error: wErr } = await supabase
          .from("competition_weeks")
          .select("id, week_number, title")
          .eq("id", payload.week_id)
          .maybeSingle();

        if (wErr) throw wErr;

        const weekNumber = week?.week_number ?? null;
        const weekTitle =
          week?.title ?? (weekNumber != null ? `Week ${weekNumber}` : null);

        return Promise.all(
          payload.leaderboard.map(async (r: LeaderboardEntry) => {
            const leaderboardEntry = creators.find(
              (l: WeekStanding) => l.creatorId === r.creator_user_id
            );
            if (!leaderboardEntry) {
              // fetch profile and user from db
              const { data: profile, error: pErr } = await supabase
                .from("profiles")
                .select(
                  "user_id, title, avatar_url, cover_image_url, bubble_text"
                )
                .eq("user_id", r.creator_user_id)
                .maybeSingle();
              const { data: user, error: uErr } = await supabase
                .from("users")
                .select("id, username")
                .eq("id", r.creator_user_id)
                .maybeSingle();

              if (pErr) throw pErr;
              if (uErr) throw uErr;

              return {
                weekId: payload.week_id,
                weekNumber,
                weekTitle,

                creatorId: r.creator_user_id,
                username: user?.username ?? null,
                profileTitle: profile?.title ?? null,
                bubbleText: profile?.bubble_text ?? null,
                avatarUrl: profile?.avatar_url ?? null,
                coverImageUrl: profile?.cover_image_url ?? null,
              } as WeekStanding;
            }
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
