import { bigint, bigserial, index, integer, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(), name: text("name").notNull(), email: text("email").notNull().unique(),
  passwordHash: text("password_hash"), passwordSalt: text("password_salt"), googleSub: text("google_sub").unique(), avatarUrl: text("avatar_url"),
  role: text("role").notNull().default("user"), status: text("status").notNull().default("active"),
  balance: integer("balance").notNull().default(0), createdAt: text("created_at").notNull(),
});
export const sessions = pgTable("sessions", {
  tokenHash: text("token_hash").primaryKey(), userId: text("user_id").notNull(), expiresAt: text("expires_at").notNull(),
}, t => [index("sessions_user_idx").on(t.userId)]);
export const apiKeys = pgTable("api_keys", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(), name: text("name").notNull(),
  keyHash: text("key_hash").notNull().unique(), prefix: text("prefix").notNull(),
  createdAt: text("created_at").notNull(), revokedAt: text("revoked_at"),
});
export const contacts = pgTable("contacts", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(), phone: text("phone").notNull(),
  name: text("name").notNull().default(""), variables: text("variables").notNull().default("{}"),
  createdAt: text("created_at").notNull(),
}, t => [index("contacts_user_idx").on(t.userId)]);
export const campaigns = pgTable("campaigns", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(), name: text("name").notNull(),
  body: text("body").notNull(), scheduledAt: text("scheduled_at"), status: text("status").notNull().default("draft"),
  total: integer("total").notNull().default(0), sent: integer("sent").notNull().default(0),
  failed: integer("failed").notNull().default(0), createdAt: text("created_at").notNull(),
}, t => [index("campaigns_user_status_idx").on(t.userId, t.status)]);
export const recipients = pgTable("recipients", {
  id: text("id").primaryKey(), seq: bigserial("seq", { mode: "number" }), campaignId: text("campaign_id").notNull(), phone: text("phone").notNull(),
  name: text("name").notNull().default(""), variables: text("variables").notNull().default("{}"),
  status: text("status").notNull().default("pending"), error: text("error"), providerId: text("provider_id"),
  sentAt: text("sent_at"),
}, t => [index("recipients_campaign_status_idx").on(t.campaignId, t.status)]);
export const messages = pgTable("messages", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(), campaignId: text("campaign_id"),
  phone: text("phone").notNull(), body: text("body").notNull(), status: text("status").notNull(),
  segments: integer("segments").notNull().default(1), providerId: text("provider_id"),
  error: text("error"), createdAt: text("created_at").notNull(),
}, t => [index("messages_user_date_idx").on(t.userId, t.createdAt)]);
export const ledger = pgTable("ledger", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(), delta: integer("delta").notNull(),
  reason: text("reason").notNull(), createdAt: text("created_at").notNull(),
}, t => [index("ledger_user_date_idx").on(t.userId, t.createdAt)]);
export const orders = pgTable("orders", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(), credits: integer("credits").notNull(),
  price: integer("price").notNull(), paymentLinkId: text("payment_link_id"), paymentUrl: text("payment_url"),
  status: text("status").notNull().default("pending"), createdAt: text("created_at").notNull(),
}, t => [index("orders_user_date_idx").on(t.userId, t.createdAt)]);
export const packages = pgTable("packages", {
  id: text("id").primaryKey(), credits: integer("credits").notNull(),
  price: integer("price").notNull(), active: integer("active").notNull().default(0),
});
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(), windowStart: bigint("window_start", { mode: "number" }).notNull(), count: integer("count").notNull().default(0),
});
export const optouts = pgTable("optouts", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(), phone: text("phone").notNull(), createdAt: text("created_at").notNull(),
}, t => [uniqueIndex("optouts_user_phone_idx").on(t.userId, t.phone)]);
