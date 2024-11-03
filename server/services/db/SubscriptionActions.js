import { eq, sql } from "drizzle-orm";
import { SubscriptionStatus } from "~~/server/services/payment/types";
import { subscriptions, userUsage } from '../../database/schema';
import { userActions } from './UserActions';
import Stripe from 'stripe';
import { useDB, tables } from '../../utils/db';

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

      // Buscar o plano pelo variantId (price_id)
      const [plan] = await db
        .select()
        .from(tables.plans)
        .where(eq(tables.plans.priceId_stripe, payload.variantId));

      if (!plan && payload.status !== SubscriptionStatus.CANCELED) {
        throw new Error(`Plano não encontrado para o price_id: ${payload.variantId}`);
      }

      const subscription = {
        id: payload.id,
        userId: user.id,
        customerId: payload.customerId,
        type: payload.type,
        planId: plan?.productId_stripe || 'FREE',
        variantId: payload.variantId,
        status: payload.status,
        paymentProvider: payload.paymentProvider,
        nextPaymentDate: payload.nextPaymentDate,
        createdAt: payload.createdAt,
        updatedAt: payload.updatedAt
      };

      await db.insert(subscriptions)
        .values(subscription)
        .onConflictDoUpdate({
          target: subscriptions.id,
          set: subscription
        });

      await db.update(userUsage)
        .set({
          charactersTotal: plan?.monthly_credits || 500,
          lastUpdated: new Date()
        })
        .where(eq(userUsage.userId, user.id));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('subscription-updated', {
          detail: {
            subscription,
            planCredits: plan?.monthly_credits || 500
          }
        }));
      }

      return subscription;
    } catch (error) {
      console.error('Failed to sync subscription:', error);
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
      console.error(error);
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
      console.error(error);
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
      console.error(error);
      throw new Error("Failed to cancel subscription");
    }
  }
}

export const subscriptionActions = new SubscriptionActions();
