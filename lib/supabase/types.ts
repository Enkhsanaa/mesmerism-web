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

type DbUserOverview = {
  id: string;
  username: string;
  email: string;
  color: string;
  avatar_url: string;
  roles: ("admin" | "moderator" | "creator")[];
  message_source: "admin" | "moderator" | "creator" | "user" | "system";
  suspended: boolean;
  suspension_reason: string | null;
  suspension_expires_at: string | null;
  balance: number;
};

type LeaderboardEntry = {
  week_id: number;
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

type DbProfile = {
  user_id: string;
  created_at: string;
  updated_at: string;
  bubble_text: string;
  title: string;
  short_intro: string;
  description: string;
  cover_image_url: string;
  avatar_url: string;
  intro_video_url: string;
  social_links: Record<string, string>;
  subscriber_count: number;
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
