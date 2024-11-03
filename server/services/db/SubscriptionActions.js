import { eq, sql } from "drizzle-orm";
import { SubscriptionStatus } from "~~/server/services/payment/types";
import { subscriptions, userUsage } from '../../database/schema';
import { userActions } from './UserActions';
import Stripe from 'stripe';
import { useDB, tables } from '../../utils/db';
import { userUsageActions } from './UserUsageActions';

class SubscriptionActions {
  async updateOrCreateSubscription(payload) {
    const db = useDB();
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const customer = await stripe.customers.retrieve(payload.customerId);
      const user = await userActions.findUserByEmail(customer.email);
      
      if (!user) {
        throw new Error(`User not found for email: ${customer.email}`);
      }

      // Buscar o plano pelo productId_stripe
      const [plan] = await db
        .select({
          id: tables.plans.id,
          name: tables.plans.name,
          monthlyCredits: tables.plans.monthly_credits,
          productId: tables.plans.productId_stripe
        })
        .from(tables.plans)
        .where(eq(tables.plans.productId_stripe, payload.planId));

      if (!plan && payload.status !== SubscriptionStatus.CANCELED) {
        throw new Error(`Plano não encontrado para o product_id: ${payload.planId}`);
      }

      const subscription = {
        id: payload.id,
        userId: user.id,
        customerId: payload.customerId,
        type: payload.type,
        planId: payload.planId,
        variantId: payload.variantId,
        status: payload.status,
        paymentProvider: payload.paymentProvider,
        nextPaymentDate: payload.nextPaymentDate,
        createdAt: payload.createdAt,
        updatedAt: payload.updatedAt
      };

      // Atualiza ou cria a assinatura
      await db.insert(subscriptions)
        .values(subscription)
        .onConflictDoUpdate({
          target: subscriptions.id,
          set: subscription
        });

      // Atualiza o user_usage com os créditos mensais do plano
      if (plan) {
        await userUsageActions.resetAndUpdateTotalCharacters(user.id, plan.monthlyCredits);
      }

      return subscription;
    } catch (error) {
      throw new Error('Failed to sync subscription');
    }
  }

  async findSubscriptionByUserId(userId) {
    try {
      const [subscription] = await useDB()
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId));
      return subscription || null;
    } catch (error) {
      return null;
    }
  }

  async findSubscriptionById(id) {
    try {
      const [subscription] = await useDB()
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.id, id));
      return subscription || null;
    } catch (error) {
      return null;
    }
  }

  async cancelSubscription(subscriptionId) {
    try {
      const subscription = findSubscriptionById(subscriptionId);
      if (!subscription) {
        throw new Error("Subscription not found");
      }
      if (subscription.status !== "ACTIVE") {
        throw new Error("Subscription is not active");
      }
      const payload = {
        status: SubscriptionStatus.CANCELED,
      };
      const updatedSubscription = await updateOrCreateSubscription(payload);
      return updatedSubscription;
    } catch (error) {
      throw new Error("Failed to cancel subscription");
    }
  }
}

export const subscriptionActions = new SubscriptionActions();
