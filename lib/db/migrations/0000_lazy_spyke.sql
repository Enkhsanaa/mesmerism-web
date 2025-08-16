-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."app_permission" AS ENUM('roles.manage', 'users.moderate', 'profiles.manage_all', 'weeks.manage', 'payments.manage', 'votes.view_all');--> statement-breakpoint
CREATE TYPE "public"."app_role" AS ENUM('admin', 'moderator', 'creator');--> statement-breakpoint
CREATE TYPE "public"."coin_tx_reason" AS ENUM('topup', 'vote_purchase', 'adjustment', 'refund');--> statement-breakpoint
CREATE TYPE "public"."message_source" AS ENUM('user', 'creator', 'moderator', 'admin', 'system');--> statement-breakpoint
CREATE TYPE "public"."topup_status" AS ENUM('pending', 'confirmed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('ONLINE', 'OFFLINE');--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "app_role" NOT NULL,
	CONSTRAINT "user_roles_user_id_role_key" UNIQUE("user_id","role")
);
--> statement-breakpoint
ALTER TABLE "user_roles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "coin_topups" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" bigint NOT NULL,
	"status" "topup_status" DEFAULT 'pending' NOT NULL,
	"provider" text,
	"provider_ref" text,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	CONSTRAINT "coin_topups_provider_provider_ref_key" UNIQUE("provider","provider_ref"),
	CONSTRAINT "coin_topups_amount_check" CHECK (amount > 0)
);
--> statement-breakpoint
ALTER TABLE "coin_topups" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "coin_ledger" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"delta" bigint NOT NULL,
	"reason" "coin_tx_reason" NOT NULL,
	"ref_topup_id" bigint,
	"ref_vote_order_id" bigint,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "coin_ledger" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "vote_orders" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"buyer_user_id" uuid NOT NULL,
	"creator_user_id" uuid NOT NULL,
	"week_id" bigint NOT NULL,
	"votes" integer NOT NULL,
	"coins_spent" bigint NOT NULL,
	CONSTRAINT "vote_orders_coins_spent_check" CHECK (coins_spent > 0),
	CONSTRAINT "vote_orders_votes_check" CHECK (votes > 0)
);
--> statement-breakpoint
ALTER TABLE "vote_orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"role" "app_role" NOT NULL,
	"permission" "app_permission" NOT NULL,
	CONSTRAINT "role_permissions_role_permission_key" UNIQUE("role","permission")
);
--> statement-breakpoint
ALTER TABLE "role_permissions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "app_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"int_value" integer,
	"text_value" text,
	"json_value" jsonb
);
--> statement-breakpoint
ALTER TABLE "app_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"username" text NOT NULL,
	"status" "user_status" DEFAULT 'OFFLINE',
	"avatar_url" text,
	"color" text DEFAULT '#888888',
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	CONSTRAINT "users_color_check" CHECK (color ~* '^#([0-9a-f]{6})$'::text)
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "messages" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"message" text,
	"author_user_id" uuid,
	"author_username" text,
	"author_avatar_url" text,
	"author_color" text,
	"message_source" "message_source" NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid
);
--> statement-breakpoint
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"title" text NOT NULL,
	"short_intro" text,
	"description" text,
	"cover_image_url" text,
	"avatar_url" text,
	"intro_video_url" text,
	"social_links" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"subscriber_count" bigint DEFAULT 0 NOT NULL,
	CONSTRAINT "profiles_subscriber_count_check" CHECK (subscriber_count >= 0)
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_suspensions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"target_user_id" uuid NOT NULL,
	"created_by" uuid,
	"reason" text,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_suspensions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "competition_weeks" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"week_number" smallint NOT NULL,
	"title" text,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	CONSTRAINT "competition_weeks_week_number_check" CHECK ((week_number >= 1) AND (week_number <= 4))
);
--> statement-breakpoint
ALTER TABLE "competition_weeks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "week_participants" (
	"week_id" bigint NOT NULL,
	"creator_user_id" uuid NOT NULL,
	CONSTRAINT "week_participants_pkey" PRIMARY KEY("week_id","creator_user_id")
);
--> statement-breakpoint
ALTER TABLE "week_participants" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coin_topups" ADD CONSTRAINT "coin_topups_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coin_ledger" ADD CONSTRAINT "coin_ledger_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coin_ledger" ADD CONSTRAINT "coin_ledger_vote_order_fk" FOREIGN KEY ("ref_vote_order_id") REFERENCES "public"."vote_orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote_orders" ADD CONSTRAINT "vote_orders_buyer_user_id_fkey" FOREIGN KEY ("buyer_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote_orders" ADD CONSTRAINT "vote_orders_creator_must_be_participant" FOREIGN KEY ("creator_user_id","week_id") REFERENCES "public"."week_participants"("week_id","creator_user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote_orders" ADD CONSTRAINT "vote_orders_creator_user_id_fkey" FOREIGN KEY ("creator_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote_orders" ADD CONSTRAINT "vote_orders_week_id_fkey" FOREIGN KEY ("week_id") REFERENCES "public"."competition_weeks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_suspensions" ADD CONSTRAINT "user_suspensions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_suspensions" ADD CONSTRAINT "user_suspensions_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "week_participants" ADD CONSTRAINT "week_participants_creator_user_id_fkey" FOREIGN KEY ("creator_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "week_participants" ADD CONSTRAINT "week_participants_week_id_fkey" FOREIGN KEY ("week_id") REFERENCES "public"."competition_weeks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "coin_topups_user_status_created_idx" ON "coin_topups" USING btree ("user_id" timestamptz_ops,"status" timestamptz_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "coin_ledger_one_per_topup" ON "coin_ledger" USING btree ("ref_topup_id" int8_ops) WHERE (ref_topup_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX "coin_ledger_user_created_idx" ON "coin_ledger" USING btree ("user_id" timestamptz_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "coin_ledger_user_idx" ON "coin_ledger" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "coin_ledger_voteorder_idx" ON "coin_ledger" USING btree ("ref_vote_order_id" int8_ops);--> statement-breakpoint
CREATE INDEX "vote_orders_buyer_created_idx" ON "vote_orders" USING btree ("buyer_user_id" timestamptz_ops,"created_at" uuid_ops);--> statement-breakpoint
CREATE INDEX "vote_orders_week_creator_idx2" ON "vote_orders" USING btree ("week_id" int8_ops,"creator_user_id" int8_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_lower_uniq" ON "users" USING btree (lower(email) text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_lower_uniq" ON "users" USING btree (lower(username) text_ops);--> statement-breakpoint
CREATE INDEX "messages_author_idx" ON "messages" USING btree ("author_user_id" timestamptz_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "messages_created_not_deleted_idx" ON "messages" USING btree ("created_at" timestamptz_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "user_suspensions_target_expires_idx" ON "user_suspensions" USING btree ("target_user_id" timestamptz_ops,"expires_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "user_suspensions_target_perm_idx" ON "user_suspensions" USING btree ("target_user_id" uuid_ops) WHERE (expires_at IS NULL);--> statement-breakpoint
CREATE INDEX "vote_orders_week_creator_idx" ON "week_participants" USING btree ("week_id" int8_ops,"creator_user_id" uuid_ops);--> statement-breakpoint
CREATE VIEW "public"."user_coin_balances" AS (SELECT u.id AS user_id, COALESCE(sum(l.delta), 0::numeric) AS balance FROM users u LEFT JOIN coin_ledger l ON l.user_id = u.id GROUP BY u.id);--> statement-breakpoint
CREATE VIEW "public"."app_public_settings" AS (SELECT key, int_value, text_value, "json_value" FROM app_settings WHERE key = 'coins_per_vote'::text);--> statement-breakpoint
CREATE POLICY "user_roles.select.self" ON "user_roles" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "user_roles.select.roles.manage" ON "user_roles" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "user_roles.manage.roles.manage" ON "user_roles" AS PERMISSIVE FOR ALL TO public;--> statement-breakpoint
CREATE POLICY "topups.select.self" ON "coin_topups" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "topups.insert.self_pending" ON "coin_topups" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "topups.manage.payments.manage" ON "coin_topups" AS PERMISSIVE FOR ALL TO public;--> statement-breakpoint
CREATE POLICY "ledger.select.self" ON "coin_ledger" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "ledger.manage.payments.manage" ON "coin_ledger" AS PERMISSIVE FOR ALL TO public;--> statement-breakpoint
CREATE POLICY "votes.select.self" ON "vote_orders" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = buyer_user_id));--> statement-breakpoint
CREATE POLICY "votes.select.view_all" ON "vote_orders" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "votes.manage.view_all" ON "vote_orders" AS PERMISSIVE FOR ALL TO public;--> statement-breakpoint
CREATE POLICY "role_permissions.select.roles.manage" ON "role_permissions" AS PERMISSIVE FOR SELECT TO public USING (authorize('roles.manage'::app_permission, auth.uid()));--> statement-breakpoint
CREATE POLICY "role_permissions.manage.roles.manage" ON "role_permissions" AS PERMISSIVE FOR ALL TO public;--> statement-breakpoint
CREATE POLICY "settings.manage.roles.manage" ON "app_settings" AS PERMISSIVE FOR ALL TO public USING (authorize('roles.manage'::app_permission, auth.uid())) WITH CHECK (authorize('roles.manage'::app_permission, auth.uid()));--> statement-breakpoint
CREATE POLICY "users.select.authenticated" ON "users" AS PERMISSIVE FOR SELECT TO public USING ((auth.role() = 'authenticated'::text));--> statement-breakpoint
CREATE POLICY "users.insert.self" ON "users" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "users.update.self" ON "users" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "messages.select.authenticated" ON "messages" AS PERMISSIVE FOR SELECT TO public USING ((auth.role() = 'authenticated'::text));--> statement-breakpoint
CREATE POLICY "messages.insert.self" ON "messages" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "messages.insert.system" ON "messages" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "messages.update.self_not_deleted" ON "messages" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "messages.update.moderate" ON "messages" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "profiles.select.public" ON "profiles" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "profiles.manage.creator_self" ON "profiles" AS PERMISSIVE FOR ALL TO public;--> statement-breakpoint
CREATE POLICY "profiles.manage.all" ON "profiles" AS PERMISSIVE FOR ALL TO public;--> statement-breakpoint
CREATE POLICY "suspensions.select.moderate" ON "user_suspensions" AS PERMISSIVE FOR SELECT TO public USING (authorize('users.moderate'::app_permission, auth.uid()));--> statement-breakpoint
CREATE POLICY "suspensions.manage.moderate" ON "user_suspensions" AS PERMISSIVE FOR ALL TO public;--> statement-breakpoint
CREATE POLICY "weeks.select.public" ON "competition_weeks" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "weeks.manage.weeks.manage" ON "competition_weeks" AS PERMISSIVE FOR ALL TO public;--> statement-breakpoint
CREATE POLICY "participants.select.public" ON "week_participants" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "participants.manage.weeks.manage" ON "week_participants" AS PERMISSIVE FOR ALL TO public;
*/