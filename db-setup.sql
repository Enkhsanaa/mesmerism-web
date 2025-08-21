-- =============================================================================
-- REVAMPED SCHEMA: Roles + Creator Profiles + Global Chat + Coins & Voting
-- =============================================================================

-- -----------------------
-- Custom types
-- -----------------------
create type public.app_permission as enum (
  'roles.manage',
  'users.moderate',
  'profiles.manage_all',
  'weeks.manage',
  'payments.manage',
  'votes.view_all'
);

create type public.app_role as enum ('admin', 'moderator', 'creator');

create type public.user_status as enum ('ONLINE', 'OFFLINE');

create type public.topup_status as enum ('pending', 'confirmed', 'failed');

create type public.coin_tx_reason as enum ('topup', 'vote_purchase', 'adjustment', 'refund');

-- include 'moderator' for accurate author “class”
create type public.message_source as enum ('user', 'creator', 'moderator', 'admin', 'system');

-- -----------------------
-- USERS
-- -----------------------
create table public.users (
  id            uuid primary key, -- UUID (can be from auth.users or generated in-app)
  email         text not null,
  password_hash text not null,
  username      text not null,
  status        public.user_status default 'OFFLINE'::public.user_status,
  avatar_url    text,
  color         text check (color ~* '^#([0-9a-f]{6})$') default '#888888',
  created_at    timestamptz not null default timezone('utc', now())
);
comment on table public.users is 'Profile data for each user.';
comment on column public.users.password_hash is 'Hashed password (bcrypt, argon2, etc.).';
comment on column public.users.id is 'References the internal Supabase Auth user.';

-- Case-insensitive usernames (Alice == alice)
create unique index users_username_lower_uniq on public.users (lower(username));

-- Enforce unique emails (case-insensitive)
create unique index users_email_lower_uniq on public.users (lower(email));

-- -----------------------
-- ROLES & PERMISSIONS
-- -----------------------
create table public.user_roles (
  id        bigserial primary key,
  user_id   uuid not null references public.users(id),
  role      public.app_role not null,
  unique (user_id, role)
);
comment on table public.user_roles is 'Application roles for each user.';

create table public.role_permissions (
  id           bigserial primary key,
  role         public.app_role not null,
  permission   public.app_permission not null,
  unique (role, permission)
);
comment on table public.role_permissions is 'Application permissions for each role.';

-- RBAC: authorize()
create or replace function public.authorize(
  requested_permission public.app_permission,
  user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
  declare bind_permissions int;
  begin
    select count(*)
    into bind_permissions
    from public.role_permissions rp
    join public.user_roles ur on rp.role = ur.role
    where rp.permission = requested_permission
      and ur.user_id = user_id;

    return bind_permissions > 0;
  end;
$$;

-- Role-class for messages (admin > moderator > creator > user)
create or replace function public.role_class_for_user(u uuid)
returns public.message_source
language sql
stable
as $$
  select case
    when exists (select 1 from public.user_roles r where r.user_id = u and r.role = 'admin') then 'admin'::public.message_source
    when exists (select 1 from public.user_roles r where r.user_id = u and r.role = 'moderator') then 'moderator'::public.message_source
    when exists (select 1 from public.user_roles r where r.user_id = u and r.role = 'creator') then 'creator'::public.message_source
    else 'user'::public.message_source
  end;
$$;

-- -----------------------
-- CREATOR PROFILES
-- -----------------------
create table public.profiles (
  user_id             uuid primary key references public.users(id),
  created_at          timestamptz not null default timezone('utc', now()),
  updated_at          timestamptz not null default timezone('utc', now()),
  title               text not null,
  short_intro         text,
  description         text,
  cover_image_url     text,
  avatar_url          text,
  intro_video_url     text,
  social_links        jsonb not null default '{}'::jsonb, -- {"twitter":"...","youtube":"..."}
  subscriber_count    bigint not null default 0 check (subscriber_count >= 0)
);

create or replace function public.touch_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute procedure public.touch_profiles_updated_at();

-- -----------------------
-- MODERATION (Timeouts/Bans)
-- -----------------------
create table public.user_suspensions (
  id              bigserial primary key,
  target_user_id  uuid not null references public.users(id),
  created_by      uuid references public.users(id),
  reason          text,
  -- NULL expires_at = permanent ban; otherwise timeout until expires_at
  expires_at      timestamptz,
  created_at      timestamptz not null default timezone('utc', now())
);

create or replace function public.is_user_suspended(u uuid)
returns boolean
stable
language sql
as $$
  select exists (
    select 1
    from public.user_suspensions s
    where s.target_user_id = u
      and (s.expires_at is null or s.expires_at > now())
  );
$$;

-- Helpful indexes for suspension checks
create index if not exists user_suspensions_target_expires_idx
  on public.user_suspensions (target_user_id, expires_at);
create index if not exists user_suspensions_target_perm_idx
  on public.user_suspensions (target_user_id)
  where expires_at is null;

-- -----------------------
-- GLOBAL MESSAGES (no channels)
-- -----------------------
create table public.messages (
  id                 bigserial primary key,
  created_at         timestamptz not null default timezone('utc', now()),
  updated_at         timestamptz not null default timezone('utc', now()),
  message            text,
  -- author; nullable for system messages
  author_user_id     uuid references public.users(id),
  -- denormalized author snapshot at post time
  author_username    text,
  author_avatar_url  text,
  author_color       text,
  -- who this is "from" (computed on insert; 'system' for system messages)
  message_source     public.message_source not null,
  -- soft delete
  deleted_at         timestamptz,
  deleted_by         uuid references public.users(id)
);

comment on table public.messages is 'Global chat messages. No channels. Includes author snapshot & soft delete.';

create or replace function public.messages_before_insert()
returns trigger
language plpgsql
as $$
declare
  v_username text;
  v_avatar   text;
  v_color    text;
begin
  if new.author_user_id is null then
    -- System message
    new.message_source := 'system';
    new.author_username := 'SYSTEM';
    new.author_avatar_url := coalesce(new.author_avatar_url, null);
    new.author_color := coalesce(new.author_color, '#000000');
  else
    select u.username, u.avatar_url, u.color
    into v_username, v_avatar, v_color
    from public.users u
    where u.id = new.author_user_id;

    if v_username is null then
      raise exception 'Invalid author_user_id';
    end if;

    new.author_username   := v_username;
    new.author_avatar_url := v_avatar;
    new.author_color      := v_color;
    new.message_source    := public.role_class_for_user(new.author_user_id);
  end if;

  return new;
end;
$$;

create or replace function public.messages_before_update()
returns trigger
language plpgsql
as $$
begin
  -- No changing author after creation
  if new.author_user_id is distinct from old.author_user_id then
    raise exception 'author_user_id is immutable';
  end if;

  -- Disallow edits after soft deletion
  if old.deleted_at is not null then
    raise exception 'Message already deleted';
  end if;

  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_messages_bi on public.messages;
create trigger trg_messages_bi
before insert on public.messages
for each row execute procedure public.messages_before_insert();

drop trigger if exists trg_messages_bu on public.messages;
create trigger trg_messages_bu
before update on public.messages
for each row execute procedure public.messages_before_update();

-- Soft-delete RPC (owner or mod/admin)
create or replace function public.mark_message_deleted(p_message_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_author uuid;
  v_deleted_at timestamptz;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select author_user_id, deleted_at into v_author, v_deleted_at
  from public.messages
  where id = p_message_id;

  if not found then
    raise exception 'Message not found';
  end if;

  if v_deleted_at is not null then
    raise exception 'Message already deleted';
  end if;

  if v_uid <> v_author and not public.authorize('users.moderate', v_uid) then
    raise exception 'Forbidden';
  end if;

  update public.messages
  set deleted_at = timezone('utc', now()),
      deleted_by = v_uid
  where id = p_message_id;
end;
$$;

-- Admin/mod-only system message RPC
create or replace function public.post_system_message(p_message text)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_id bigint;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;
  if not public.authorize('users.moderate', v_uid) then
    raise exception 'Only moderators/admins can post system messages';
  end if;

  insert into public.messages (message, author_user_id) values (p_message, null)
  returning id into v_id;

  return v_id;
end;
$$;

-- Helpful message indexes
create index if not exists messages_created_not_deleted_idx
  on public.messages (created_at desc) where deleted_at is null;
create index if not exists messages_author_idx
  on public.messages (author_user_id, created_at desc);

-- -----------------------
-- COINS: Top-ups & Ledger
-- -----------------------
create table public.coin_topups (
  id            bigserial primary key,
  user_id       uuid not null references public.users(id),
  amount        bigint not null check (amount > 0),
  status        public.topup_status not null default 'pending',
  provider      text,
  provider_ref  text,
  created_at    timestamptz not null default timezone('utc', now()),
  updated_at    timestamptz not null default timezone('utc', now()),
  unique (provider, provider_ref)
);

create or replace function public.touch_topups_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

create trigger trg_topups_updated_at
before update on public.coin_topups
for each row execute procedure public.touch_topups_updated_at();

create table public.coin_ledger (
  id                bigserial primary key,
  user_id           uuid not null references public.users(id),
  delta             bigint not null, -- +credit, -debit
  reason            public.coin_tx_reason not null,
  ref_topup_id      bigint,
  ref_vote_order_id bigint,
  created_at        timestamptz not null default timezone('utc', now())
);
create index coin_ledger_user_idx on public.coin_ledger (user_id);
create index coin_ledger_user_created_idx on public.coin_ledger (user_id, created_at desc);
create unique index coin_ledger_one_per_topup
  on public.coin_ledger (ref_topup_id)
  where ref_topup_id is not null;
create index coin_ledger_voteorder_idx on public.coin_ledger (ref_vote_order_id);

-- credit coins when a topup is confirmed
create or replace function public.credit_coins_on_topup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'confirmed' and (old.status is distinct from 'confirmed') then
    insert into public.coin_ledger (user_id, delta, reason, ref_topup_id)
    values (new.user_id, new.amount, 'topup', new.id)
    on conflict (ref_topup_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger trg_topup_confirm_credit
after update on public.coin_topups
for each row execute procedure public.credit_coins_on_topup();

create or replace view public.user_coin_balances as
select
  u.id as user_id,
  coalesce(sum(l.delta), 0) as balance
from public.users u
left join public.coin_ledger l on l.user_id = u.id
group by u.id;

create index coin_topups_user_status_created_idx
  on public.coin_topups (user_id, status, created_at desc);

-- -----------------------
-- COMPETITION: Weeks & Participants
-- -----------------------
create table public.competition_weeks (
  id          bigserial primary key,
  week_number smallint not null check (week_number between 1 and 4),
  title       text,
  starts_at   timestamptz,
  ends_at     timestamptz,
  is_active   boolean not null default true,
  created_at  timestamptz not null default timezone('utc', now())
);

create table public.week_participants (
  week_id          bigint not null references public.competition_weeks(id),
  creator_user_id  uuid not null references public.users(id),
  primary key (week_id, creator_user_id)
);

create index vote_orders_week_creator_idx on public.week_participants (week_id, creator_user_id);

-- -----------------------
-- VOTES: Settings, Orders (coins -> votes)
-- -----------------------
create table public.app_settings (
  key text primary key,
  int_value integer,
  text_value text,
  json_value jsonb
);

-- Public, read-only view for safe config exposure (optional)
create or replace view public.app_public_settings as
select key, int_value, text_value, json_value
from public.app_settings
where key in ('coins_per_vote');

-- Definer-secure getter so callers don’t need direct table rights
create or replace function public.coins_per_vote()
returns integer
stable
security definer
set search_path = ''
language sql
as $$
  select coalesce(
    (select int_value from public.app_settings where key = 'coins_per_vote'),
    1
  );
$$;

insert into public.app_settings (key, int_value) values ('coins_per_vote', 1)
on conflict (key) do nothing;

create table public.vote_orders (
  id               bigserial primary key,
  created_at       timestamptz not null default timezone('utc', now()),
  buyer_user_id    uuid not null references public.users(id),
  creator_user_id  uuid not null references public.users(id),
  week_id          bigint not null references public.competition_weeks(id),
  votes            integer not null check (votes > 0),
  coins_spent      bigint  not null check (coins_spent > 0),
  constraint vote_orders_creator_must_be_participant
    foreign key (week_id, creator_user_id)
    references public.week_participants(week_id, creator_user_id)
);
create index vote_orders_buyer_created_idx on public.vote_orders (buyer_user_id, created_at desc);
create index vote_orders_week_creator_idx2 on public.vote_orders (week_id, creator_user_id);

alter table public.coin_ledger
  add constraint coin_ledger_vote_order_fk
  foreign key (ref_vote_order_id) references public.vote_orders(id) on delete set null;

-- Purchase votes with per-user advisory lock to prevent double-spend
create or replace function public.purchase_votes(
  p_creator_id uuid,
  p_week_id bigint,
  p_votes integer
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_rate int;
  v_cost bigint;
  v_balance bigint;
  v_order_id bigint;
  v_lock_key bigint;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  if p_votes is null or p_votes <= 0 then
    raise exception 'votes must be a positive integer';
  end if;

  -- Block suspended users from purchasing votes
  -- if public.is_user_suspended(v_user) then
  --   raise exception 'User is suspended and cannot purchase votes';
  -- end if;

  -- Ensure week is active and currently open
  perform 1
  from public.competition_weeks w
  where w.id = p_week_id
    and w.is_active
    and (w.starts_at is null or w.starts_at <= now())
    and (w.ends_at   is null or w.ends_at   >= now());
  if not found then
    raise exception 'This week is not currently open for voting';
  end if;


  -- Ensure target is a participant for the given week
  perform 1
  from public.week_participants wp
  where wp.week_id = p_week_id and wp.creator_user_id = p_creator_id;
  if not found then
    raise exception 'Creator is not a participant for the specified week';
  end if;

  -- Per-user advisory lock (hash UUID -> bigint)
  select ('x'||substr(md5(v_user::text),1,16))::bit(64)::bigint into v_lock_key;
  perform pg_advisory_xact_lock(v_lock_key);

  -- Cost = votes * coins_per_vote()
  select public.coins_per_vote() into v_rate;
  v_cost := p_votes * v_rate;

  -- Current balance (locked by advisory, so safe enough)
  select coalesce(sum(delta),0) into v_balance
  from public.coin_ledger
  where user_id = v_user;

  if v_balance < v_cost then
    raise exception 'INSUFFICIENT_FUNDS: need %, have %', v_cost, v_balance;
  end if;

  -- Create vote order
  insert into public.vote_orders (buyer_user_id, creator_user_id, week_id, votes, coins_spent)
  values (v_user, p_creator_id, p_week_id, p_votes, v_cost)
  returning id into v_order_id;

  -- Deduct coins
  insert into public.coin_ledger (user_id, delta, reason, ref_vote_order_id)
  values (v_user, -v_cost, 'vote_purchase', v_order_id);

  return v_order_id;
end;
$$;

-- Leaderboard by percentage (hide raw counts)
create or replace function public.get_week_leaderboard(p_week_id bigint)
returns table (
  week_id bigint,
  creator_user_id uuid,
  percent numeric(6,2),
  rank integer
)
language sql
security definer
set search_path = ''
as $$
  with totals as (
    select coalesce(sum(vo.votes),0)::numeric as total_votes
    from public.vote_orders vo
    where vo.week_id = p_week_id
  ),
  per_creator as (
    select
      wp.week_id,
      wp.creator_user_id,
      coalesce(sum(vo.votes),0)::numeric as votes
    from public.week_participants wp
    left join public.vote_orders vo
      on vo.week_id = wp.week_id
     and vo.creator_user_id = wp.creator_user_id
    where wp.week_id = p_week_id
    group by wp.week_id, wp.creator_user_id
  ),
  with_pct as (
    select
      pc.week_id,
      pc.creator_user_id,
      case when t.total_votes = 0 then 0
           else round((pc.votes / nullif(t.total_votes,0)) * 100.0, 2)
      end as percent,
      pc.votes
    from per_creator pc
    cross join totals t
  )
  select
    week_id,
    creator_user_id,
    percent,
    rank() over (partition by week_id order by votes desc, creator_user_id asc) as rank
  from with_pct
  order by rank;
$$;

-- -----------------------
-- RLS: Enable & Policies (refactored to use authorize() where appropriate)
-- -----------------------
alter table public.users              enable row level security;
alter table public.user_roles         enable row level security;
alter table public.role_permissions   enable row level security;
alter table public.profiles           enable row level security;
alter table public.user_suspensions   enable row level security;
alter table public.messages           enable row level security;
alter table public.coin_topups        enable row level security;
alter table public.coin_ledger        enable row level security;
alter table public.competition_weeks  enable row level security;
alter table public.week_participants  enable row level security;
alter table public.vote_orders        enable row level security;
alter table public.app_settings       enable row level security;

-- USERS
create policy "users.select.authenticated" on public.users
  for select using (auth.role() = 'authenticated');

create policy "users.insert.self" on public.users
  for insert with check (auth.uid() = id);

create policy "users.update.self" on public.users
  for update using (auth.uid() = id);

-- USER ROLES
create policy "user_roles.select.self" on public.user_roles
  for select using (auth.uid() = user_id);

create policy "user_roles.select.roles.manage" on public.user_roles
  for select using (public.authorize('roles.manage', auth.uid()));

create policy "user_roles.manage.roles.manage" on public.user_roles
  for all
  using (public.authorize('roles.manage', auth.uid()))
  with check (public.authorize('roles.manage', auth.uid()));

-- ROLE PERMISSIONS
create policy "role_permissions.select.roles.manage" on public.role_permissions
  for select using (public.authorize('roles.manage', auth.uid()));

create policy "role_permissions.manage.roles.manage" on public.role_permissions
  for all
  using (public.authorize('roles.manage', auth.uid()))
  with check (public.authorize('roles.manage', auth.uid()));

-- PROFILES (public read; creators manage own; admins manage all via permission)
create policy "profiles.select.public" on public.profiles
  for select using (true);

create policy "profiles.manage.creator_self" on public.profiles
  for all
  using (
    auth.uid() = user_id
    and exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'creator')
  )
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'creator')
  );

create policy "profiles.manage.all" on public.profiles
  for all
  using (public.authorize('profiles.manage_all', auth.uid()))
  with check (public.authorize('profiles.manage_all', auth.uid()));

-- SUSPENSIONS (mods & admins manage/read -> users.moderate)
create policy "suspensions.select.moderate" on public.user_suspensions
  for select using (public.authorize('users.moderate', auth.uid()));

create policy "suspensions.manage.moderate" on public.user_suspensions
  for all
  using (public.authorize('users.moderate', auth.uid()))
  with check (public.authorize('users.moderate', auth.uid()));

-- MESSAGES
create policy "messages.select.authenticated" on public.messages
  for select using (auth.role() = 'authenticated');

-- users can create normal messages (not system) if not suspended
create policy "messages.insert.self" on public.messages
  for insert
  with check (
    author_user_id = auth.uid()
    and not public.is_user_suspended(auth.uid())
  );

-- admins/mods can create SYSTEM messages (author_user_id must be null)
create policy "messages.insert.system" on public.messages
  for insert
  with check (
    author_user_id is null
    and public.authorize('users.moderate', auth.uid())
  );

-- users can update their own messages iff not deleted and not suspended
create policy "messages.update.self_not_deleted" on public.messages
  for update
  using (
    author_user_id = auth.uid()
    and deleted_at is null
    and not public.is_user_suspended(auth.uid())
  )
  with check (
    author_user_id = auth.uid()
    and deleted_at is null
    and not public.is_user_suspended(auth.uid())
  );

-- moderators/admins can update any message that is not yet deleted
create policy "messages.update.moderate" on public.messages
  for update
  using (
    deleted_at is null
    and public.authorize('users.moderate', auth.uid())
  )
  with check (
    deleted_at is null
    and public.authorize('users.moderate', auth.uid())
  );

-- COIN TOPUPS
create policy "topups.select.self" on public.coin_topups
  for select using (auth.uid() = user_id);

create policy "topups.insert.self_pending" on public.coin_topups
  for insert with check (auth.uid() = user_id);

create policy "topups.manage.payments.manage" on public.coin_topups
  for all
  using (public.authorize('payments.manage', auth.uid()))
  with check (public.authorize('payments.manage', auth.uid()));

-- COIN LEDGER (read own; admin manage via payments.manage)
create policy "ledger.select.self" on public.coin_ledger
  for select using (auth.uid() = user_id);

create policy "ledger.manage.payments.manage" on public.coin_ledger
  for all
  using (public.authorize('payments.manage', auth.uid()))
  with check (public.authorize('payments.manage', auth.uid()));

-- APP SETTINGS
-- Manage: admins via roles.manage or a dedicated permission (keep as admin via seed below)
create policy "settings.manage.roles.manage" on public.app_settings
  for all
  using (public.authorize('roles.manage', auth.uid()))
  with check (public.authorize('roles.manage', auth.uid()));

-- Optional: public read via view `app_public_settings`; keep base table locked down.

-- COMPETITION WEEKS (public read; manage via weeks.manage)
create policy "weeks.select.public" on public.competition_weeks
  for select using (true);

create policy "weeks.manage.weeks.manage" on public.competition_weeks
  for all
  using (public.authorize('weeks.manage', auth.uid()))
  with check (public.authorize('weeks.manage', auth.uid()));

-- WEEK PARTICIPANTS (public read; manage via weeks.manage; ensure creator role)
create policy "participants.select.public" on public.week_participants
  for select using (true);

create policy "participants.manage.weeks.manage" on public.week_participants
  for all
  using (public.authorize('weeks.manage', auth.uid()))
  with check (
    public.authorize('weeks.manage', auth.uid())
    and exists (
      select 1 from public.user_roles ur2
      where ur2.user_id = week_participants.creator_user_id
        and ur2.role = 'creator'
    )
  );

-- VOTE ORDERS (buyers read own; admin read/manage all via votes.view_all)
create policy "votes.select.self" on public.vote_orders
  for select using (auth.uid() = buyer_user_id);

create policy "votes.select.view_all" on public.vote_orders
  for select using (public.authorize('votes.view_all', auth.uid()));

create policy "votes.manage.view_all" on public.vote_orders
  for all
  using (public.authorize('votes.view_all', auth.uid()))
  with check (public.authorize('votes.view_all', auth.uid()));

-- -----------------------
-- NO HARD DELETES ANYWHERE
-- -----------------------
create or replace function public.prevent_delete()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Deletes are disabled; use soft-delete or updates instead.';
  return null;
end;
$$;

-- Attach BEFORE DELETE guard to every base table
create trigger no_delete_users               before delete on public.users               for each row execute procedure public.prevent_delete();
create trigger no_delete_user_roles          before delete on public.user_roles          for each row execute procedure public.prevent_delete();
create trigger no_delete_role_permissions    before delete on public.role_permissions    for each row execute procedure public.prevent_delete();
create trigger no_delete_profiles            before delete on public.profiles            for each row execute procedure public.prevent_delete();
create trigger no_delete_user_suspensions    before delete on public.user_suspensions    for each row execute procedure public.prevent_delete();
create trigger no_delete_messages            before delete on public.messages            for each row execute procedure public.prevent_delete();
create trigger no_delete_coin_topups         before delete on public.coin_topups         for each row execute procedure public.prevent_delete();
create trigger no_delete_coin_ledger         before delete on public.coin_ledger         for each row execute procedure public.prevent_delete();
create trigger no_delete_competition_weeks   before delete on public.competition_weeks   for each row execute procedure public.prevent_delete();
create trigger no_delete_week_participants   before delete on public.week_participants   for each row execute procedure public.prevent_delete();
create trigger no_delete_vote_orders         before delete on public.vote_orders         for each row execute procedure public.prevent_delete();
create trigger no_delete_app_settings        before delete on public.app_settings        for each row execute procedure public.prevent_delete();

-- -----------------------
-- REPLICA IDENTITY (for realtime "previous data")
-- -----------------------
alter table public.users              replica identity full;
alter table public.messages           replica identity full;
alter table public.profiles           replica identity full;
alter table public.user_suspensions   replica identity full;
alter table public.competition_weeks  replica identity full;
alter table public.week_participants  replica identity full;

-- -----------------------
-- TRIGGER: New auth user -> public.users (+ initial roles)
-- -----------------------
create or replace function public.handle_new_user()
returns trigger
set search_path = ''
security definer
language plpgsql
as $$
  declare
    is_first_user boolean;
  begin
    -- prevent race in first-user admin promotion
    perform pg_advisory_xact_lock(42);

  insert into public.users (id, email, username, password_hash, avatar_url)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'username', new.email), '', null);  -- empty password_hash if coming from Supabase

    -- First user becomes admin (re-check under lock)
    select count(*) = 1 from auth.users into is_first_user;
    if is_first_user then
      insert into public.user_roles (user_id, role) values (new.id, 'admin')
      on conflict do nothing;
    end if;

    -- Plus-address overrides for quick testing
    if position('+supaadmin@' in new.email) > 0 then
      insert into public.user_roles (user_id, role) values (new.id, 'admin')
      on conflict do nothing;
    elsif position('+supamod@' in new.email) > 0 then
      insert into public.user_roles (user_id, role) values (new.id, 'moderator')
      on conflict do nothing;
    elsif position('+supacreator@' in new.email) > 0 then
      insert into public.user_roles (user_id, role) values (new.id, 'creator')
      on conflict do nothing;
    end if;

    return new;
  end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -----------------------
-- REALTIME PUBLICATION (no channels)
-- -----------------------
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;

alter publication supabase_realtime add table
  public.messages,
  public.users,
  public.profiles,
  public.user_suspensions,
  public.competition_weeks,
  public.week_participants;
  
-- 1) Function: broadcast every change on public.messages
create or replace function public.messages_changes()
returns trigger
security definer
language plpgsql
set search_path = public
as $$
begin
  -- One global topic for all messages (no channels in your schema)
  perform realtime.broadcast_changes(
    'topic:messages',   -- clients subscribe to this topic
    TG_OP,              -- event name clients can filter on: INSERT | UPDATE | DELETE
    TG_OP,              -- operation (mirrors event)
    TG_TABLE_NAME,      -- 'messages'
    TG_TABLE_SCHEMA,    -- 'public'
    NEW,                -- new row (NULL on DELETE)
    OLD                 -- old row (NULL on INSERT)
  );
  return null;          -- AFTER statement, we don't modify the row
end;
$$;

-- 2) AFTER trigger to capture all row-level mutations
drop trigger if exists trg_messages_changes on public.messages;
create trigger trg_messages_changes
after insert or update or delete on public.messages
for each row execute procedure public.messages_changes();
-- -----------------------
-- PERMISSIONS SEED
-- -----------------------
insert into public.role_permissions (role, permission) values
  ('admin',      'roles.manage'),
  ('admin',      'users.moderate'),
  ('admin',      'profiles.manage_all'),
  ('admin',      'weeks.manage'),
  ('admin',      'payments.manage'),
  ('admin',      'votes.view_all'),
  ('moderator',  'users.moderate')
on conflict (role, permission) do nothing;

-- -----------------------
-- DUMMY DATA (optional)
-- -----------------------
-- insert into public.users (id, username, email, password_hash)
-- values ('8d0fd2b3-9ca7-4d9e-a95f-9e13dded323e', 'supabot', 'sanaenkh+admin@gmail.com', '')
-- on conflict (id) do nothing;

-- insert into public.messages (message, author_user_id)
-- values ('Hello World 👋', '8d0fd2b3-9ca7-4d9e-a95f-9e13dded323e')
-- on conflict do nothing;

-- Create 4 competition weeks (titles only)
insert into public.competition_weeks (week_number, title, starts_at, ends_at, is_active)
values
  (1, 'Week 1',
     timestamptz '2025-09-01 00:00:00+08',
     timestamptz '2025-09-07 23:59:59+08',
     true),
  (2, 'Week 2',
     timestamptz '2025-09-08 00:00:00+08',
     timestamptz '2025-09-14 23:59:59+08',
     true),
  (3, 'Week 3',
     timestamptz '2025-09-15 00:00:00+08',
     timestamptz '2025-09-21 23:59:59+08',
     true),
  (4, 'Week 4',
     timestamptz '2025-09-22 00:00:00+08',
     timestamptz '2025-09-28 23:59:59+08',
     true)
on conflict do nothing;