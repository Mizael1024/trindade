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
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
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

  return { url: session.url };
});
