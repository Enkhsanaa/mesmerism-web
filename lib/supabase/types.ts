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
  avatarUrl: string | null;
  coverImageUrl: string | null;
};
