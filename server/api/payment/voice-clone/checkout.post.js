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
  await authMiddleware(event);
  const { user } = event.context;
  const { packageId, redirectUrl } = await readValidatedBody(event, (body) =>
    checkoutSchema.parse(body)
  );

  const voiceClonePackage = voiceClonePackages[packageId];
  if (!voiceClonePackage) {
    throw createError({
      statusCode: 400,
      message: "Pacote inválido"
    });
  }

  const config = useRuntimeConfig();
  const baseUrl = config.public.BASE_URL || 'https://app.voicefy.com.br';

  if (!config.stripe?.secretKey) {
    throw createError({
      statusCode: 500,
      message: 'Configuração do Stripe não encontrada'
    });
  }

  const stripe = new Stripe(config.stripe.secretKey);
const session = await stripe.checkout.sessions.create({
  line_items: [{
    price: voiceClonePackage.priceId,
    quantity: 1
  }],
  mode: 'payment',
  success_url: `${baseUrl}/dashboard?success=true`,
  cancel_url: `${baseUrl}/dashboard?canceled=true`,
  customer_email: user.email,
  metadata: {
    userId: user.id,
    type: 'voice_clone_package',
    packageId: packageId
  }
});

  console.log('Config:', {
    stripeKey: config.stripe?.secretKey ? 'Presente' : 'Ausente',
    package: voiceClonePackage,
    priceId: voiceClonePackage?.priceId
  });

  return { url: session.url };
});
