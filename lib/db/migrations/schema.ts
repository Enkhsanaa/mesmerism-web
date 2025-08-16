import {
  pgTable,
  foreignKey,
  unique,
  pgPolicy,
  bigserial,
  uuid,
  index,
  check,
  bigint,
  text,
  timestamp,
  uniqueIndex,
  integer,
  jsonb,
  smallint,
  boolean,
  primaryKey,
  pgView,
  numeric,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const appPermission = pgEnum("app_permission", [
  "roles.manage",
  "users.moderate",
  "profiles.manage_all",
  "weeks.manage",
  "payments.manage",
  "votes.view_all",
]);
export const appRole = pgEnum("app_role", ["admin", "moderator", "creator"]);
export const coinTxReason = pgEnum("coin_tx_reason", [
  "topup",
  "vote_purchase",
  "adjustment",
  "refund",
]);
export const messageSource = pgEnum("message_source", [
  "user",
  "creator",
  "moderator",
  "admin",
  "system",
]);
export const topupStatus = pgEnum("topup_status", [
  "pending",
  "confirmed",
  "failed",
]);
export const userStatus = pgEnum("user_status", ["ONLINE", "OFFLINE"]);

export const userRoles = pgTable(
  "user_roles",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    role: appRole().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "user_roles_user_id_fkey",
    }),
    unique("user_roles_user_id_role_key").on(table.userId, table.role),
    pgPolicy("user_roles.select.self", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy("user_roles.select.roles.manage", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
    pgPolicy("user_roles.manage.roles.manage", {
      as: "permissive",
      for: "all",
      to: ["public"],
    }),
  ]
);

export const coinTopups = pgTable(
  "coin_topups",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    amount: bigint({ mode: "number" }).notNull(),
    status: topupStatus().default("pending").notNull(),
    provider: text(),
    providerRef: text("provider_ref"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
  },
  (table) => [
    index("coin_topups_user_status_created_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("timestamptz_ops"),
      table.status.asc().nullsLast().op("timestamptz_ops"),
      table.createdAt.desc().nullsFirst().op("timestamptz_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "coin_topups_user_id_fkey",
    }),
    unique("coin_topups_provider_provider_ref_key").on(
      table.provider,
      table.providerRef
    ),
    pgPolicy("topups.select.self", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy("topups.insert.self_pending", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
    pgPolicy("topups.manage.payments.manage", {
      as: "permissive",
      for: "all",
      to: ["public"],
    }),
    check("coin_topups_amount_check", sql`amount > 0`),
  ]
);

export const coinLedger = pgTable(
  "coin_ledger",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    delta: bigint({ mode: "number" }).notNull(),
    reason: coinTxReason().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    refTopupId: bigint("ref_topup_id", { mode: "number" }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    refVoteOrderId: bigint("ref_vote_order_id", { mode: "number" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("coin_ledger_one_per_topup")
      .using("btree", table.refTopupId.asc().nullsLast().op("int8_ops"))
      .where(sql`(ref_topup_id IS NOT NULL)`),
    index("coin_ledger_user_created_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("timestamptz_ops"),
      table.createdAt.desc().nullsFirst().op("timestamptz_ops")
    ),
    index("coin_ledger_user_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops")
    ),
    index("coin_ledger_voteorder_idx").using(
      "btree",
      table.refVoteOrderId.asc().nullsLast().op("int8_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "coin_ledger_user_id_fkey",
    }),
    foreignKey({
      columns: [table.refVoteOrderId],
      foreignColumns: [voteOrders.id],
      name: "coin_ledger_vote_order_fk",
    }).onDelete("set null"),
    pgPolicy("ledger.select.self", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy("ledger.manage.payments.manage", {
      as: "permissive",
      for: "all",
      to: ["public"],
    }),
  ]
);

export const voteOrders = pgTable(
  "vote_orders",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    buyerUserId: uuid("buyer_user_id").notNull(),
    creatorUserId: uuid("creator_user_id").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    weekId: bigint("week_id", { mode: "number" }).notNull(),
    votes: integer().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    coinsSpent: bigint("coins_spent", { mode: "number" }).notNull(),
  },
  (table) => [
    index("vote_orders_buyer_created_idx").using(
      "btree",
      table.buyerUserId.asc().nullsLast().op("timestamptz_ops"),
      table.createdAt.desc().nullsFirst().op("uuid_ops")
    ),
    index("vote_orders_week_creator_idx2").using(
      "btree",
      table.weekId.asc().nullsLast().op("int8_ops"),
      table.creatorUserId.asc().nullsLast().op("int8_ops")
    ),
    foreignKey({
      columns: [table.buyerUserId],
      foreignColumns: [users.id],
      name: "vote_orders_buyer_user_id_fkey",
    }),
    foreignKey({
      columns: [table.creatorUserId, table.weekId],
      foreignColumns: [weekParticipants.weekId, weekParticipants.creatorUserId],
      name: "vote_orders_creator_must_be_participant",
    }),
    foreignKey({
      columns: [table.creatorUserId],
      foreignColumns: [users.id],
      name: "vote_orders_creator_user_id_fkey",
    }),
    foreignKey({
      columns: [table.weekId],
      foreignColumns: [competitionWeeks.id],
      name: "vote_orders_week_id_fkey",
    }),
    pgPolicy("votes.select.self", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(auth.uid() = buyer_user_id)`,
    }),
    pgPolicy("votes.select.view_all", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
    pgPolicy("votes.manage.view_all", {
      as: "permissive",
      for: "all",
      to: ["public"],
    }),
    check("vote_orders_coins_spent_check", sql`coins_spent > 0`),
    check("vote_orders_votes_check", sql`votes > 0`),
  ]
);

export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    role: appRole().notNull(),
    permission: appPermission().notNull(),
  },
  (table) => [
    unique("role_permissions_role_permission_key").on(
      table.role,
      table.permission
    ),
    pgPolicy("role_permissions.select.roles.manage", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`authorize('roles.manage'::app_permission, auth.uid())`,
    }),
    pgPolicy("role_permissions.manage.roles.manage", {
      as: "permissive",
      for: "all",
      to: ["public"],
    }),
  ]
);

export const appSettings = pgTable(
  "app_settings",
  {
    key: text().primaryKey().notNull(),
    intValue: integer("int_value"),
    textValue: text("text_value"),
    jsonValue: jsonb("json_value"),
  },
  (table) => [
    pgPolicy("settings.manage.roles.manage", {
      as: "permissive",
      for: "all",
      to: ["public"],
      using: sql`authorize('roles.manage'::app_permission, auth.uid())`,
      withCheck: sql`authorize('roles.manage'::app_permission, auth.uid())`,
    }),
  ]
);

export const users = pgTable(
  "users",
  {
    id: uuid().primaryKey().notNull(),
    email: text().notNull(),
    passwordHash: text("password_hash").notNull(),
    username: text().notNull(),
    status: userStatus().default("OFFLINE"),
    avatarUrl: text("avatar_url"),
    color: text().default("#888888"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("users_email_lower_uniq").using("btree", sql`lower(email)`),
    uniqueIndex("users_username_lower_uniq").using(
      "btree",
      sql`lower(username)`
    ),
    pgPolicy("users.select.authenticated", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(auth.role() = 'authenticated'::text)`,
    }),
    pgPolicy("users.insert.self", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
    pgPolicy("users.update.self", {
      as: "permissive",
      for: "update",
      to: ["public"],
    }),
    check("users_color_check", sql`color ~* '^#([0-9a-f]{6})$'::text`),
  ]
);

export const messages = pgTable(
  "messages",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    message: text(),
    authorUserId: uuid("author_user_id"),
    authorUsername: text("author_username"),
    authorAvatarUrl: text("author_avatar_url"),
    authorColor: text("author_color"),
    messageSource: messageSource("message_source").notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
    deletedBy: uuid("deleted_by"),
  },
  (table) => [
    index("messages_author_idx").using(
      "btree",
      table.authorUserId.asc().nullsLast().op("timestamptz_ops"),
      table.createdAt.desc().nullsFirst().op("timestamptz_ops")
    ),
    index("messages_created_not_deleted_idx")
      .using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops"))
      .where(sql`(deleted_at IS NULL)`),
    foreignKey({
      columns: [table.authorUserId],
      foreignColumns: [users.id],
      name: "messages_author_user_id_fkey",
    }),
    foreignKey({
      columns: [table.deletedBy],
      foreignColumns: [users.id],
      name: "messages_deleted_by_fkey",
    }),
    pgPolicy("messages.select.authenticated", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(auth.role() = 'authenticated'::text)`,
    }),
    pgPolicy("messages.insert.self", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
    pgPolicy("messages.insert.system", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
    pgPolicy("messages.update.self_not_deleted", {
      as: "permissive",
      for: "update",
      to: ["public"],
    }),
    pgPolicy("messages.update.moderate", {
      as: "permissive",
      for: "update",
      to: ["public"],
    }),
  ]
);

export const profiles = pgTable(
  "profiles",
  {
    userId: uuid("user_id").primaryKey().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    title: text().notNull(),
    shortIntro: text("short_intro"),
    description: text(),
    coverImageUrl: text("cover_image_url"),
    avatarUrl: text("avatar_url"),
    introVideoUrl: text("intro_video_url"),
    socialLinks: jsonb("social_links").default({}).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    subscriberCount: bigint("subscriber_count", { mode: "number" })
      .default(0)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "profiles_user_id_fkey",
    }),
    pgPolicy("profiles.select.public", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`true`,
    }),
    pgPolicy("profiles.manage.creator_self", {
      as: "permissive",
      for: "all",
      to: ["public"],
    }),
    pgPolicy("profiles.manage.all", {
      as: "permissive",
      for: "all",
      to: ["public"],
    }),
    check("profiles_subscriber_count_check", sql`subscriber_count >= 0`),
  ]
);

export const userSuspensions = pgTable(
  "user_suspensions",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    targetUserId: uuid("target_user_id").notNull(),
    createdBy: uuid("created_by"),
    reason: text(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
  },
  (table) => [
    index("user_suspensions_target_expires_idx").using(
      "btree",
      table.targetUserId.asc().nullsLast().op("timestamptz_ops"),
      table.expiresAt.asc().nullsLast().op("timestamptz_ops")
    ),
    index("user_suspensions_target_perm_idx")
      .using("btree", table.targetUserId.asc().nullsLast().op("uuid_ops"))
      .where(sql`(expires_at IS NULL)`),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "user_suspensions_created_by_fkey",
    }),
    foreignKey({
      columns: [table.targetUserId],
      foreignColumns: [users.id],
      name: "user_suspensions_target_user_id_fkey",
    }),
    pgPolicy("suspensions.select.moderate", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`authorize('users.moderate'::app_permission, auth.uid())`,
    }),
    pgPolicy("suspensions.manage.moderate", {
      as: "permissive",
      for: "all",
      to: ["public"],
    }),
  ]
);

export const competitionWeeks = pgTable(
  "competition_weeks",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    weekNumber: smallint("week_number").notNull(),
    title: text(),
    startsAt: timestamp("starts_at", { withTimezone: true, mode: "string" }),
    endsAt: timestamp("ends_at", { withTimezone: true, mode: "string" }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
  },
  (table) => [
    pgPolicy("weeks.select.public", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`true`,
    }),
    pgPolicy("weeks.manage.weeks.manage", {
      as: "permissive",
      for: "all",
      to: ["public"],
    }),
    check(
      "competition_weeks_week_number_check",
      sql`(week_number >= 1) AND (week_number <= 4)`
    ),
  ]
);

export const weekParticipants = pgTable(
  "week_participants",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    weekId: bigint("week_id", { mode: "number" }).notNull(),
    creatorUserId: uuid("creator_user_id").notNull(),
  },
  (table) => [
    index("vote_orders_week_creator_idx").using(
      "btree",
      table.weekId.asc().nullsLast().op("int8_ops"),
      table.creatorUserId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.creatorUserId],
      foreignColumns: [users.id],
      name: "week_participants_creator_user_id_fkey",
    }),
    foreignKey({
      columns: [table.weekId],
      foreignColumns: [competitionWeeks.id],
      name: "week_participants_week_id_fkey",
    }),
    primaryKey({
      columns: [table.weekId, table.creatorUserId],
      name: "week_participants_pkey",
    }),
    pgPolicy("participants.select.public", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`true`,
    }),
    pgPolicy("participants.manage.weeks.manage", {
      as: "permissive",
      for: "all",
      to: ["public"],
    }),
  ]
);
export const userCoinBalances = pgView("user_coin_balances", {
  userId: uuid("user_id"),
  balance: numeric({ mode: "number" }),
}).as(
  sql`SELECT u.id AS user_id, COALESCE(sum(l.delta), 0::numeric) AS balance FROM users u LEFT JOIN coin_ledger l ON l.user_id = u.id GROUP BY u.id`
);

export const appPublicSettings = pgView("app_public_settings", {
  key: text(),
  intValue: integer("int_value"),
  textValue: text("text_value"),
  jsonValue: jsonb("json_value"),
}).as(
  sql`SELECT key, int_value, text_value, "json_value" FROM app_settings WHERE key = 'coins_per_vote'::text`
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// User Roles types
export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;

// Coin Topups types
export type CoinTopup = typeof coinTopups.$inferSelect;
export type NewCoinTopup = typeof coinTopups.$inferInsert;

// Coin Ledger types
export type CoinLedger = typeof coinLedger.$inferSelect;
export type NewCoinLedger = typeof coinLedger.$inferInsert;

// Vote Orders types
export type VoteOrder = typeof voteOrders.$inferSelect;
export type NewVoteOrder = typeof voteOrders.$inferInsert;

// Role Permissions types
export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;

// App Settings types
export type AppSetting = typeof appSettings.$inferSelect;
export type NewAppSetting = typeof appSettings.$inferInsert;

// Messages types
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

// Profiles types
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

// User Suspensions types
export type UserSuspension = typeof userSuspensions.$inferSelect;
export type NewUserSuspension = typeof userSuspensions.$inferInsert;

// Competition Weeks types
export type CompetitionWeek = typeof competitionWeeks.$inferSelect;
export type NewCompetitionWeek = typeof competitionWeeks.$inferInsert;

// Week Participants types
export type WeekParticipant = typeof weekParticipants.$inferSelect;
export type NewWeekParticipant = typeof weekParticipants.$inferInsert;

// User Coin Balances view types
export type UserCoinBalance = typeof userCoinBalances.$inferSelect;

// App Public Settings view types
export type AppPublicSetting = typeof appPublicSettings.$inferSelect;
