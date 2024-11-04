import { z } from "zod";
import { usePayment } from "~~/server/services/payment";
import authMiddleware from "~~/server/middleware/auth";
import { voiceClonePackages } from "~~/server/config/voiceClonePackages";
import { Stripe } from "stripe";

const checkoutSchema = z.object({
  packageId: z.string(),
  redirectUrl: z.string().optional()
});

export default defineEventHandler(async (event) => {
  try {
    await authMiddleware(event);
    const { user } = event.context;
    const { packageId, redirectUrl } = await readValidatedBody(event, (body) =>
      checkoutSchema.parse(body)
    );

    const config = useRuntimeConfig();
    
    // Log para debug
    console.log('Config:', {
      hasStripe: !!config.stripe,
      hasSecretKey: !!config.stripe?.secretKey,
      baseUrl: config.public.baseUrl
    });

    if (!config.stripe?.secretKey) {
      throw createError({
        statusCode: 500,
        message: 'Configuração do Stripe não encontrada'
      });
    }

    const voiceClonePackage = voiceClonePackages[packageId];
    if (!voiceClonePackage) {
      throw createError({
        statusCode: 400,
        message: "Pacote inválido"
      });
    }

    const stripe = new Stripe(config.stripe.secretKey);
    
    // Log para debug
    console.log('Criando sessão com:', {
      packageId,
      priceId: voiceClonePackage.priceId,
      email: user.email
    });

    const session = await stripe.checkout.sessions.create({
      line_items: [{
        price: voiceClonePackage.priceId,
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${config.public.baseUrl}/dashboard?success=true`,
      cancel_url: `${config.public.baseUrl}/dashboard?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        type: 'voice_clone_package',
        packageId: packageId,
        credits: voiceClonePackage.credits
      }
    });

    return { url: session.url };
  } catch (error) {
    console.error('Erro no checkout:', error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro interno no servidor'
    });
  }
});
