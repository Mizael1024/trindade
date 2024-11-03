import { drizzle } from "drizzle-orm/d1";
export { sql, eq, and, or } from "drizzle-orm";

import * as schema from "../database/schema";

export const tables = {
  users: schema.users,
  oauthAccounts: schema.oauthAccounts,
  userUsage: schema.userUsage,
  favoriteVoices: schema.favoriteVoices,
  elevenlabs: schema.elevenlabs,
  clonedVoices: schema.clonedVoices,
  plans: schema.plans,
  voiceClonePlans: schema.voiceClonePlans,
  voiceClonePurchases: schema.voiceClonePurchases,
  creditPackages: schema.creditPackages,
  creditPurchases: schema.creditPurchases,
  subscriptions: schema.subscriptions,
  passwordResetTokens: schema.passwordResetTokens
};

export function useDB() {
  return drizzle(hubDatabase(), { schema });
}
