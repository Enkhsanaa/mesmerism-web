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
