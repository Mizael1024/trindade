import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  blob,
  real,
} from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export enum SubscriptionStatus {
  TRIALING = "TRIALING",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  CANCELED = "CANCELED",
  PAST_DUE = "PAST_DUE",
  UNPAID = "UNPAID",
  INCOMPLETE = "INCOMPLETE",
  EXPIRED = "EXPIRED",
}

export const TransactionType = {
  SUBSCRIPTION: 'subscription',
  ONE_TIME: 'one_time',
  CREDIT_PACKAGE: 'credit_package',
  VOICE_CLONE: 'voice_clone'
} as const;

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$default(() => nanoid()),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" })
    .notNull()
    .default(false),
  role: text("role").notNull().default(UserRole.USER),
  name: text("name").notNull(),
  avatarUrl: text("avatarUrl"),
  hashedPassword: text("hashedPassword"),
  banned: integer("banned", { mode: "boolean" }).notNull().default(false),
  bannedReason: text("bannedReason"),
  onboarded: integer("onboarded", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$default(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(() => new Date()),
  lastActive: integer("last_active", { mode: "timestamp" }).$onUpdate(() => new Date()),
  planId: text("planId")
    .notNull()
    .default("GRATIS")
    .references(() => plans.id),
});

export const credentials = sqliteTable("credentials", {
  id: text("id")
    .primaryKey()
    .$default(() => nanoid()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name"),
  externalID: text("external_id").unique().notNull(),
  publicKey: blob("public_key", { mode: "buffer" }).unique().notNull(),
  signCount: integer("sign_count").default(0).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$default(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(
    () => new Date(),
  ),
});

export const oauthAccounts = sqliteTable(
  "oauth_accounts",
  {
    id: text("id")
      .primaryKey()
      .$default(() => nanoid()),
    providerId: text("providerId").notNull(),
    providerUserId: text("providerUserId").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" }).$default(
      () => new Date(),
    ),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => ({
    uniqueProviderUser: uniqueIndex("unique_provider_user").on(
      table.providerId,
      table.providerUserId,
    ),
  }),
);

export const images = sqliteTable("images", {
  id: text("id")
    .primaryKey()
    .$default(() => nanoid()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  contentType: text("contentType"),
  pathname: text("pathname").notNull(),
  size: integer("size"),
  uploadedAt: integer("uploaded_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$default(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(
    () => new Date(),
  ),
});

export const audios = sqliteTable("audios", {
  id: text("id")
    .primaryKey()
    .$default(() => nanoid()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  contentType: text("contentType"),
  pathname: text("pathname").notNull(),
  size: integer("size"),
  uploadedAt: integer("uploaded_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$default(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(
    () => new Date(),
  ),
});

export const emailVerificationCodes = sqliteTable("email_verification_codes", {
  id: integer("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  code: integer("code").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const passwordResetTokens = sqliteTable("password_reset_tokens", {
  id: integer("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export enum OneTimePasswordTypes {
  signup = "SIGNUP",
  login = "LOGIN",
  forgotPassword = "FORGOT_PASSWORD",
}

export const oneTimePasswords = sqliteTable("one_time_passwords", {
  id: text("id")
    .primaryKey()
    .$default(() => nanoid()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  identifier: text("identifier").notNull(),
  code: text("code").notNull(),
  type: text("type").notNull().default(OneTimePasswordTypes.signup),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const posts = sqliteTable("posts", {
  id: text("id")
    .primaryKey()
    .$default(() => nanoid()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$default(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(
    () => new Date(),
  ),
});

export const waitlist = sqliteTable("waitlist", {
  id: text("id")
    .primaryKey()
    .$default(() => nanoid()),
  email: text("email").notNull().unique(),
  referrer: text("referrer"),
  createdAt: integer("created_at", { mode: "timestamp" }).$default(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(
    () => new Date(),
  ),
});

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SelectOauthAccount = typeof oauthAccounts.$inferSelect;
export type InsertOauthAccount = typeof oauthAccounts.$inferInsert;
export type SelectEmailVerificationCode =
  typeof emailVerificationCodes.$inferSelect;
export type InsertEmailVerificationCode =
  typeof emailVerificationCodes.$inferInsert;
export type SelectOneTimePassword = typeof oneTimePasswords.$inferSelect;
export type InsertOneTimePassword = typeof oneTimePasswords.$inferInsert;
export type SelectPost = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;
export type OneTimePassword = keyof typeof OneTimePasswordTypes;

export const plans = sqliteTable("plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  offer_id: text("offer_id").notNull(),
  credits: integer("credits").notNull(),
  monthly_credits: integer("monthly_credits").notNull(),
  duration: integer("duration").notNull(),
  type: text("type").notNull(),
  price: integer("price").notNull(),
  priceId_stripe: text("priceId_stripe"),
  productId_stripe: text("productId_stripe"),
  created_at: integer("created_at", { mode: "timestamp" }).notNull(),
  updated_at: integer("updated_at", { mode: "timestamp" }).notNull()
});

export const userUsage = sqliteTable("user_usage", {
  userId: text("user_id").primaryKey().references(() => users.id),
  charactersUsed: integer("characters_used").notNull().default(0),
  charactersTotal: integer("characters_total").notNull().default(0),
  extraCredits: integer("extra_credits").notNull().default(0),
  voiceCloneUsed: integer("voice_clone_used").notNull().default(0),
  voiceCloneTotal: integer("voice_clone_total").notNull().default(0),
});

export type SelectUserUsage = typeof userUsage.$inferSelect;
export type InsertUserUsage = typeof userUsage.$inferInsert;

export const speakers = sqliteTable("speakers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  display_name: text("display_name").notNull(),
  language: text("language").notNull(),
  gender: text("gender").notNull(),
  sampleUrl: text("sampleUrl").notNull(),
  profileUrl: text("profileUrl").notNull(),
  visibility: text("visibility", { enum: ['ativo', 'inativo'] }).notNull().default('inativo'),
  created_at: integer("created_at", { mode: "timestamp" }).$default(() => new Date()),
  updated_at: integer("updated_at", { mode: "timestamp" }).$onUpdate(() => new Date())
});

export const elevenlabs = sqliteTable("elevenlabs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  elevenLabsId: text("elevenLabsId").notNull().unique(),
  name: text("name").notNull(),
  language: text("language"),
  gender: text("gender"),
  category: text("category").notNull(),
  sampleUrl: text("sampleUrl"),
  profileUrl: text("profileUrl"),
  is_pro: integer("is_pro", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$default(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(() => new Date()),
});

export type SelectElevenlabs = typeof elevenlabs.$inferSelect;
export type InsertElevenlabs = typeof elevenlabs.$inferInsert;

export const favoriteVoices = sqliteTable("favorite_voices", {
  id: text("id").primaryKey().$default(() => nanoid()),
  user_id: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  voice_id: text("voice_id"),
  elevenLabsId: text("elevenLabsId"),
  created_at: integer("created_at", { mode: "timestamp" }).$default(() => new Date()),
});

export type SelectFavoriteVoice = typeof favoriteVoices.$inferSelect;
export type InsertFavoriteVoice = typeof favoriteVoices.$inferInsert;

export const clonedVoices = sqliteTable("cloned_voices", {
  id: text("id").primaryKey().$default(() => nanoid()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  elevenLabsId: text("elevenLabsId")
    .notNull()
    .references(() => elevenlabs.elevenLabsId, { onDelete: "cascade" }), // Adicionando referência
  name: text("name").notNull(),
  status: text("status", { enum: ['processing', 'ready', 'failed'] }).notNull().default('processing'),
  created_at: integer("created_at", { mode: "timestamp" }).$default(() => new Date()),
  updated_at: integer("updated_at", { mode: "timestamp" }).$onUpdate(() => new Date())
});

export type SelectClonedVoice = typeof clonedVoices.$inferSelect;
export type InsertClonedVoice = typeof clonedVoices.$inferInsert;

export const voiceClonePlans = sqliteTable("voice_clone_plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  credits: integer("credits").notNull(),
  price: integer("price").notNull(),
  created_at: integer("created_at", { mode: "timestamp" }).$default(() => new Date()),
  updated_at: integer("updated_at", { mode: "timestamp" }).$onUpdate(() => new Date())
});

export type SelectVoiceClonePlan = typeof voiceClonePlans.$inferSelect;
export type InsertVoiceClonePlan = typeof voiceClonePlans.$inferInsert;

export const voiceClonePurchases = sqliteTable("voice_clone_purchases", {
  id: text("id").primaryKey().$default(() => nanoid()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  planId: text("planId")
    .notNull()
    .references(() => voiceClonePlans.id),
  credits: integer("credits").notNull(),
  stripePaymentId: text("stripePaymentId").notNull(),
  status: text("status", { enum: ['pending', 'paid', 'failed'] }).notNull().default('pending'),
  createdAt: integer("createdAt", { mode: "timestamp" }).$default(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$onUpdate(() => new Date())
});

export type SelectVoiceClonePurchase = typeof voiceClonePurchases.$inferSelect;
export type InsertVoiceClonePurchase = typeof voiceClonePurchases.$inferInsert;

export const creditPackages = sqliteTable("credit_packages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  credits: integer("credits").notNull(),
  price: integer("price").notNull(),
  created_at: integer("created_at", { mode: "timestamp" }).$default(() => new Date()),
  updated_at: integer("updated_at", { mode: "timestamp" }).$onUpdate(() => new Date())
});

export const creditPurchases = sqliteTable("credit_purchases", {
  id: text("id").primaryKey().$default(() => nanoid()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  packageId: text("packageId")
    .notNull()
    .references(() => creditPackages.id),
  credits: integer("credits").notNull(),
  asaasPaymentId: text("asaasPaymentId").notNull(),
  status: text("status", { enum: ['pending', 'paid', 'failed'] }).notNull().default('pending'),
  expiresAt: integer("expires_at", { mode: "timestamp" }), // Opcional, para créditos com validade
  createdAt: integer("createdAt", { mode: "timestamp" }).$default(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$onUpdate(() => new Date())
});

export type SelectCreditPackage = typeof creditPackages.$inferSelect;
export type InsertCreditPackage = typeof creditPackages.$inferInsert;
export type SelectCreditPurchase = typeof creditPurchases.$inferSelect;
export type InsertCreditPurchase = typeof creditPurchases.$inferInsert;

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  customerId: text("customerId").notNull(),
  subscriptionId: text("subscriptionId").notNull(),
  type: text("type").notNull(),
  planId: text("planId").notNull(),
  variantId: text("variantId").notNull(),
  status: text("status").notNull(),
  paymentProvider: text("paymentProvider").notNull(),
  nextPaymentDate: integer("nextPaymentDate", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).$default(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$onUpdate(() => new Date())
});

export const subscriptionsIndexes = {
  userId: uniqueIndex("idx_subscriptions_userId").on(subscriptions.userId),
  customerId: uniqueIndex("idx_subscriptions_customerId").on(subscriptions.customerId),
  subscriptionId: uniqueIndex("idx_subscriptions_subscriptionId").on(subscriptions.subscriptionId)
};

export type SelectSubscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

export type TransactionTypeValues = typeof TransactionType[keyof typeof TransactionType];

export const tables = {
  users,
  credentials,
  oauthAccounts,
  images,
  audios,
  emailVerificationCodes,
  passwordResetTokens,
  oneTimePasswords,
  posts,
  waitlist,
  plans,
  userUsage,
  speakers,
  elevenlabs,
  favoriteVoices,
  clonedVoices,
  voiceClonePlans,
  voiceClonePurchases,
  creditPackages,
  creditPurchases,
  subscriptions
} as const;