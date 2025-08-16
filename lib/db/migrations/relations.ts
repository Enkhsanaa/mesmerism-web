import { relations } from "drizzle-orm/relations";
import { users, userRoles, coinTopups, coinLedger, voteOrders, weekParticipants, competitionWeeks, messages, profiles, userSuspensions } from "./schema";

export const userRolesRelations = relations(userRoles, ({one}) => ({
	user: one(users, {
		fields: [userRoles.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	userRoles: many(userRoles),
	coinTopups: many(coinTopups),
	coinLedgers: many(coinLedger),
	voteOrders_buyerUserId: many(voteOrders, {
		relationName: "voteOrders_buyerUserId_users_id"
	}),
	voteOrders_creatorUserId: many(voteOrders, {
		relationName: "voteOrders_creatorUserId_users_id"
	}),
	messages_authorUserId: many(messages, {
		relationName: "messages_authorUserId_users_id"
	}),
	messages_deletedBy: many(messages, {
		relationName: "messages_deletedBy_users_id"
	}),
	profiles: many(profiles),
	userSuspensions_createdBy: many(userSuspensions, {
		relationName: "userSuspensions_createdBy_users_id"
	}),
	userSuspensions_targetUserId: many(userSuspensions, {
		relationName: "userSuspensions_targetUserId_users_id"
	}),
	weekParticipants: many(weekParticipants),
}));

export const coinTopupsRelations = relations(coinTopups, ({one}) => ({
	user: one(users, {
		fields: [coinTopups.userId],
		references: [users.id]
	}),
}));

export const coinLedgerRelations = relations(coinLedger, ({one}) => ({
	user: one(users, {
		fields: [coinLedger.userId],
		references: [users.id]
	}),
	voteOrder: one(voteOrders, {
		fields: [coinLedger.refVoteOrderId],
		references: [voteOrders.id]
	}),
}));

export const voteOrdersRelations = relations(voteOrders, ({one, many}) => ({
	coinLedgers: many(coinLedger),
	user_buyerUserId: one(users, {
		fields: [voteOrders.buyerUserId],
		references: [users.id],
		relationName: "voteOrders_buyerUserId_users_id"
	}),
	weekParticipant: one(weekParticipants, {
		fields: [voteOrders.creatorUserId],
		references: [weekParticipants.weekId]
	}),
	user_creatorUserId: one(users, {
		fields: [voteOrders.creatorUserId],
		references: [users.id],
		relationName: "voteOrders_creatorUserId_users_id"
	}),
	competitionWeek: one(competitionWeeks, {
		fields: [voteOrders.weekId],
		references: [competitionWeeks.id]
	}),
}));

export const weekParticipantsRelations = relations(weekParticipants, ({one, many}) => ({
	voteOrders: many(voteOrders),
	user: one(users, {
		fields: [weekParticipants.creatorUserId],
		references: [users.id]
	}),
	competitionWeek: one(competitionWeeks, {
		fields: [weekParticipants.weekId],
		references: [competitionWeeks.id]
	}),
}));

export const competitionWeeksRelations = relations(competitionWeeks, ({many}) => ({
	voteOrders: many(voteOrders),
	weekParticipants: many(weekParticipants),
}));

export const messagesRelations = relations(messages, ({one}) => ({
	user_authorUserId: one(users, {
		fields: [messages.authorUserId],
		references: [users.id],
		relationName: "messages_authorUserId_users_id"
	}),
	user_deletedBy: one(users, {
		fields: [messages.deletedBy],
		references: [users.id],
		relationName: "messages_deletedBy_users_id"
	}),
}));

export const profilesRelations = relations(profiles, ({one}) => ({
	user: one(users, {
		fields: [profiles.userId],
		references: [users.id]
	}),
}));

export const userSuspensionsRelations = relations(userSuspensions, ({one}) => ({
	user_createdBy: one(users, {
		fields: [userSuspensions.createdBy],
		references: [users.id],
		relationName: "userSuspensions_createdBy_users_id"
	}),
	user_targetUserId: one(users, {
		fields: [userSuspensions.targetUserId],
		references: [users.id],
		relationName: "userSuspensions_targetUserId_users_id"
	}),
}));