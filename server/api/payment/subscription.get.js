import { subscriptionActions } from "~~/server/services/db/SubscriptionActions";
import { usePayment } from "~~/server/services/payment";
import authMiddleware from "~~/server/middleware/auth";

const { paymentProvider } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  await authMiddleware(event);
  const { user } = event.context;
  const subscription = await subscriptionActions.findSubscriptionByUserId(user.id);
  const plans = await usePayment(paymentProvider).getAllPlans();

  if (!subscription) {
    return {
      activeSubscription: null,
      plans,
    };
  }

  const plan = plans.find((plan) => plan.id === subscription.planId);
  if (!plan) {
    return {
      activeSubscription: subscription,
      plans,
    };
  }

  const variant = plan.variants.find(
    (variant) => variant.id === subscription.variantId
  );

  const activeSubscription = {
    ...subscription,
    name: plan.name,
    description: plan.description,
    price: variant?.price || 0,
    currency: variant?.currency || 'BRL',
    interval: variant?.interval || 'month',
  };

  return {
    activeSubscription,
    plans,
  };
});
