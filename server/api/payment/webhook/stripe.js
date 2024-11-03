import Stripe from "stripe";
import { SubscriptionStatus } from "~~/server/services/payment/types";
import { subscriptionActions } from "~~/server/services/db/SubscriptionActions";
import { usePayment } from "~~/server/services/payment";
import { voiceCloneActions } from "~~/server/services/db/VoiceCloneActions";
import { voiceClonePackages } from "~~/server/config/voiceClonePackages";

export default defineEventHandler(async event => {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("Stripe Webhook Secret is missing");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const body = await readRawBody(event);
    const stripeSignature = getHeader(event, "stripe-signature");
    
    if (!stripeSignature || !body) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing required webhook data",
      });
    }

    const stripeEvent = await stripe.webhooks.constructEventAsync(
      body,
      stripeSignature,
      webhookSecret,
    );

    if (stripeEvent.type === 'customer.subscription.updated') {
      const subscription = stripeEvent.data.object;
      const productId = subscription.items.data[0].price.product;

      const payload = {
        id: subscription.id,
        userId: subscription.metadata?.user_id,
        customerId: subscription.customer,
        type: 'subscription',
        planId: productId,
        variantId: subscription.items.data[0].price.id,
        status: SubscriptionStatus.ACTIVE,
        paymentProvider: "stripe",
        nextPaymentDate: new Date(subscription.current_period_end * 1000),
        createdAt: new Date(subscription.created * 1000),
        updatedAt: new Date()
      };

      console.log('Processando atualização de subscription:', payload);
      await subscriptionActions.updateOrCreateSubscription(payload);
    }

    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object;
      
      if (session.subscription) {
        if (!session.subscription) return "OK"; // Ignora se não for uma subscription
        
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        const productId = subscription.items.data[0].price.product;

        const payload = {
          id: session.subscription,
          userId: session.metadata?.user_id,
          customerId: session.customer,
          type: 'subscription',
          planId: productId,
          variantId: session.metadata?.variant_id || subscription.items.data[0].price.id,
          status: SubscriptionStatus.ACTIVE,
          paymentProvider: "stripe",
          nextPaymentDate: new Date(subscription.current_period_end * 1000),
          createdAt: new Date(session.created * 1000),
          updatedAt: new Date()
        };

        console.log('Processando nova subscription:', payload);
        await subscriptionActions.updateOrCreateSubscription(payload);
      } else if (session.metadata?.type === 'voice_clone_package') {
        const packageId = session.metadata.packageId;
        const userId = session.metadata.userId;
        
        const voiceClonePackage = voiceClonePackages[packageId];
        
        if (!voiceClonePackage) {
          console.error('Pacote não encontrado:', packageId);
          return "OK";
        }

        try {
          await voiceCloneActions.processPurchase({
            userId,
            planId: voiceClonePackage.id,
            credits: voiceClonePackage.credits,
            stripePaymentId: session.payment_intent,
            status: 'paid'
          });
          
          console.log('Créditos processados com sucesso:', {
            userId,
            planId: voiceClonePackage.id,
            credits: voiceClonePackage.credits
          });
        } catch (error) {
          console.error('Erro ao processar créditos:', error);
          throw error;
        }
      }
    }

    return "OK";
  } catch (error) {
    console.error('Erro no webhook:', error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
