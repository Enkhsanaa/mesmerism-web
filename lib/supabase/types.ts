type UserSuspension = {
  id: string;
  target_user_id: string;
  created_by: string;
  reason: string;
  expires_at: string;
};

type DbUser = {
  id: string;
  username: string;
  avatar_url: string;
  color: string;
  created_at: string;
};

type LeaderboardEntry = {
  creator_user_id: string;
  percent: number;
  rank: number;
};

type WeekStanding = {
  weekId: number;
  weekNumber: number | null;
  weekTitle: string | null;

  rank: number; // 1, 2, 3, ...
  percent: number; // e.g. 37.5

  creatorId: string; // uuid
  username: string | null;
  profileTitle: string | null;
  bubbleText: string | null;
  avatarUrl: string | null;
  coverImageUrl: string | null;
};

type DbCompetitionWeek = {
  id: number;
  week_number: number;
  title: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
};
