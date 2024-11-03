import { eq, and } from "drizzle-orm";
import { SubscriptionStatus } from "~~/server/services/payment/types";
import { planActions } from './PlanActions';
import { userUsageActions } from './UserUsageActions';
import { useDB, tables } from '../../utils/db';

class UserActions {
  constructor() {
  }

  async findUserByEmail(email) {
    try {
      const [existingUser] = await useDB()
        .select()
        .from(tables.users)
        .where(eq(tables.users.email, email));
      return existingUser || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async findUserByUserId(userId) {
    try {
      const [existingUser] = await useDB()
        .select()
        .from(tables.users)
        .where(eq(tables.users.id, userId));
      return existingUser || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async deleteUser(userId) {
    try {
      const record = await useDB()
        .delete(tables.users)
        .where(eq(tables.users.id, userId))
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to delete user: ${error}`);
    }
  }

  async updateUserPassword(userId, hashedPassword) {
    try {
      const record = await useDB()
        .update(tables.users)
        .set({ hashedPassword })
        .where(eq(tables.users.id, userId))
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to update user password");
    }
  }

  async updateUser(userId, payload) {
    try {
      const record = await useDB()
        .update(tables.users)
        .set(payload)
        .where(eq(tables.users.id, userId))
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to update user");
    }
  }

  async createUserWithPassword(userData) {
    try {
      const [user] = await useDB()
        .insert(tables.users)
        .values(userData)
        .returning();

      if (!user) {
        throw new Error('Falha ao criar usuário');
      }

      await useDB()
        .insert(tables.userUsage)
        .values({
          userId: user.id,
          charactersUsed: 0,
          charactersTotal: 500,
          extraCredits: 0,
          voiceCloneUsed: 0,
          voiceCloneTotal: 0,
          lastUpdated: new Date()
        });

      return user;
    } catch (error) {
      throw error;
    }
  }

  async createUserWithOAuthAccount(userData) {
    try {
      const [newUser] = await useDB()
        .insert(tables.users)
        .values({
          email: userData.email,
          name: userData.name,
          avatarUrl: userData.avatarUrl,
          emailVerified: userData.emailVerified,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Inicializar userUsage para o novo usuário
      await useDB()
        .insert(tables.userUsage)
        .values({
          userId: newUser.id,
          charactersUsed: 0,
          charactersTotal: 500,
          extraCredits: 0,
          voiceCloneUsed: 0,
          voiceCloneTotal: 0,
          lastUpdated: new Date()
        });

      return newUser;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw createError({
        statusCode: 500,
        message: 'Falha ao criar usuário com conta Google',
        statusMessage: 'Falha ao criar usuário com conta Google'
      });
    }
  }

  async updateLastActive(userId) {
    try {
      const record = await useDB()
        .update(tables.users)
        .set({ lastActive: new Date() })
        .where(eq(tables.users.id, userId))
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to update last active");
    }
  }

  async verifyUser(userId) {
    try {
      const record = await useDB()
        .update(tables.users)
        .set({ emailVerified: true })
        .where(eq(tables.users.id, userId))
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to verify user");
    }
  }

  async findSubscriptionByUserId(userId) {
    try {
      const [subscription] = await useDB()
        .select()
        .from(tables.subscriptions)
        .where(eq(tables.subscriptions.userId, userId));
      return subscription || null;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to find subscription by user ID");
    }
  }

  async findStripeCustomerByUserId(userId) {
    try {
      const [subscription] = await useDB()
        .select()
        .from(tables.subscriptions)
        .where(eq(tables.subscriptions.userId, userId));
      return subscription?.customerId || null;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to find Stripe customer by user ID");
    }
  }

  async findOauthAccountByUserId(userId) {
    try {
      const [oauthAccount] = await useDB()
        .select()
        .from(tables.oauthAccounts)
        .where(eq(tables.oauthAccounts.userId, userId));
      return oauthAccount || null;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to find OAuth account by user ID");
    }
  }

  async saveStripeCustomerId(userId, customerId) {
    try {
      await useDB()
        .insert(tables.subscriptions)
        .values({
          userId,
          customerId,
          status: SubscriptionStatus.TRIALING,
          planId: "",
          variantId: "",
          nextPaymentDate: Date.now(),
        })
        .onConflictDoUpdate({
          target: tables.subscriptions.userId,
          set: { customerId },
        })
        .returning()
        .get();
    } catch (error) {
      console.error(error);
      throw new Error("Failed to save Stripe customer ID");
    }
  }

  async createUserWithPasskey(payload) {
    try {
      const record = await useDB()
        .insert(tables.users)
        .values({ ...payload, emailVerified: true })
        .onConflictDoUpdate({
          target: tables.users.email,
          set: {
            name: payload.name,
          },
        })
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to upsert user");
    }
  }

  async createPasskeyCredential(payload) {
    try {
      const record = await useDB()
        .insert(tables.credentials)
        .values(payload)
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to upsert credential");
    }
  }

  async findPasskeyCredentialByUserId(userId) {
    try {
      const credential = await useDB()
        .select()
        .from(tables.credentials)
        .where(eq(tables.credentials.userId, userId));
      return credential || null;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to find credential by user ID");
    }
  }

  async updatePasskeySignCount(userCredential, newCounter) {
    try {
      await useDB()
        .update(tables.credentials)
        .set({
          signCount: newCounter,
        })
        .where(eq(tables.credentials.id, userCredential.id))
        .prepare()
        .run();
    } catch (error) {
      console.error(error);
      throw new Error("Failed to update credential sign count");
    }
  }

  async deletePasskeyCredential(userId) {
    try {
      const result = await useDB()
        .delete(tables.credentials)
        .where(eq(tables.credentials.userId, userId))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to delete passkey credential");
    }
  }

  async findLinkedAccountsByUserId(userId) {
    try {
      const linkedAccounts = await useDB()
        .select()
        .from(tables.oauthAccounts)
        .where(eq(tables.oauthAccounts.userId, userId));
      return linkedAccounts;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to find linked accounts by user ID");
    }
  }

  async unlinkAccount(userId, accountId) {
    try {
      const result = await useDB()
        .delete(tables.oauthAccounts)
        .where(
          and(
            eq(tables.oauthAccounts.userId, userId),
            eq(tables.oauthAccounts.id, accountId),
          ),
        )
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to unlink account");
    }
  }

  async toggleFavoriteVoice(userId, voiceId) {
    try {
      const existingFavorite = await useDB()
        .select()
        .from(tables.favoriteVoices)
        .where(
          and(
            eq(tables.favoriteVoices.userId, userId),
            eq(tables.favoriteVoices.voiceId, voiceId)
          )
        )
        .get();

      if (existingFavorite) {
        await useDB()
          .delete(tables.favoriteVoices)
          .where(
            and(
              eq(tables.favoriteVoices.userId, userId),
              eq(tables.favoriteVoices.voiceId, voiceId)
            )
          );
        return { action: 'removed' };
      }

      await useDB()
        .insert(tables.favoriteVoices)
        .values({
          id: nanoid(),
          userId,
          voiceId,
          created_at: new Date()
        });
      return { action: 'added' };
    } catch (error) {
      console.error('Erro ao processar favorito:', error);
      throw error;
    }
  }

  async getUserFavoriteVoices(userId) {
    try {
      const favorites = await useDB()
        .select()
        .from(tables.favoriteVoices)
        .where(eq(tables.favoriteVoices.userId, userId));
      return favorites.map(f => f.voiceId);
    } catch (error) {
      console.error('Erro ao buscar vozes favoritas:', error);
      throw error;
    }
  }

  async getUserUsage(userId) {
    
    try {
      let [usage] = await useDB()
        .select()
        .from(tables.userUsage)
        .where(eq(tables.userUsage.userId, userId));
      
      if (!usage) {
        // Inicializar usage se não existir
        usage = await useDB()
          .insert(tables.userUsage)
          .values({
            userId,
            charactersUsed: 0,
            extraCredits: 0,
            lastUpdated: new Date()
          })
          .returning()
          .get();
      }
      
      return usage;
    } catch (error) {
      console.error('Erro ao buscar usage:', error);
      return null;
    }
  }

  async updateUserUsage(userId, newCharactersUsed) {
    try {
      // Primeiro, busca o uso atual
      const currentUsage = await this.getUserUsage(userId);
      
      // Calcula o novo total de caracteres usados
      const updatedCharactersUsed = (currentUsage?.charactersUsed || 0) + newCharactersUsed;
      
      // Atualiza o registro com o novo total
      const record = await useDB()
        .update(tables.userUsage)
        .set({ 
          charactersUsed: updatedCharactersUsed,
          lastUpdated: new Date() 
        })
        .where(eq(tables.userUsage.userId, userId))
        .returning()
        .get();
        
      return record;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to update user usage");
    }
  }

  async getUserPlanCredits(priceId) {
    try {
      const [plan] = await useDB()
        .select({
          name: tables.plans.name,
          monthlyCredits: tables.plans.monthly_credits
        })
        .from(tables.plans)
        .where(eq(tables.plans.priceId_stripe, priceId));
      
      return {
        planName: plan?.name || 'Grátis',
        monthlyCredits: plan?.monthlyCredits || 0
      };
    } catch (error) {
      console.error(error);
      throw new Error("Failed to get plan credits");
    }
  }
}

export const userActions = new UserActions();
