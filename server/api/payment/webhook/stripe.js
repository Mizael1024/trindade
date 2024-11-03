import Stripe from "stripe";
import { SubscriptionStatus } from "~~/server/services/payment/types";
import { subscriptionActions } from "~~/server/services/db/SubscriptionActions";


export default defineEventHandler(async event => {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("Chave secreta do webhook do Stripe ausente");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const body = await readRawBody(event);
    const stripeSignature = getHeader(event, "stripe-signature");
    
    if (!stripeSignature || !body) {
      throw createError({
        statusCode: 400,
        statusMessage: "Dados do webhook ausentes",
      });
    }

    const stripeEvent = await stripe.webhooks.constructEventAsync(
      body,
      stripeSignature,
      webhookSecret,
    );

    // Evento de atualização de assinatura
    if (stripeEvent.type === 'customer.subscription.updated') {
      const subscription = stripeEvent.data.object;
      const productId = subscription.items.data[0].price.product;

      await subscriptionActions.updateOrCreateSubscription({
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
      });
    }

    // Evento de conclusão de checkout
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object;
      
      // Processamento de assinatura
      if (session.subscription) {
        try {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          const productId = subscription.items.data[0].price.product;
          const variantId = session.metadata?.variant_id || subscription.items.data[0].price.id;
          const userId = session.metadata?.user_id;

          if (!userId) {
            throw new Error('userId não encontrado');
          }

          await subscriptionActions.updateOrCreateSubscription({
            id: session.subscription,
            userId,
            customerId: session.customer,
            type: 'subscription',
            planId: productId,
            variantId,
            status: SubscriptionStatus.ACTIVE,
            paymentProvider: "stripe",
            nextPaymentDate: new Date(subscription.current_period_end * 1000),
            createdAt: new Date(session.created * 1000),
            updatedAt: new Date()
          });
        } catch (error) {
          throw error;
        }
      } 
      // Processamento de pacote de clone de voz
      else if (session.metadata?.type === 'voice_clone_package') {
        const packageId = session.metadata.packageId;
        const userId = session.metadata.userId;
        
        const voiceClonePackage = voiceClonePackages[packageId];
        if (!voiceClonePackage) {
          return "OK";
        }

        await voiceCloneActions.processPurchase({
          userId,
          planId: voiceClonePackage.id,
          credits: voiceClonePackage.credits,
          stripePaymentId: session.payment_intent,
          status: 'paid'
        });
      }
    }

    return "OK";
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
