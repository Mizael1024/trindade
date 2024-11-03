import { creditPackageCheckoutSchema } from "~~/server/validations/payments";
import { usePayment } from "~~/server/services/payment";
import authMiddleware from "~~/server/middleware/auth";

const packageToProductMap = {
  'EXTRA_10K': 'price_1QFfxgGJGCWWTgK523QNsnEi',
  'EXTRA_30K': 'price_1QFfzjGJGCWWTgK5Fyig2BUB',
  'EXTRA_100K': 'price_1QFg0XGJGCWWTgK5sSildeHL'
};

export default defineEventHandler(async (event) => {
  await authMiddleware(event);
  const { user } = event.context;
  const { packageId, redirectUrl } = await readValidatedBody(event, (body) =>
    creditPackageCheckoutSchema.parse(body)
  );

  const stripeProductId = packageToProductMap[packageId];
  if (!stripeProductId) {
    throw createError({
      statusCode: 400,
      message: "Pacote inválido"
    });
  }

  const checkoutLink = await usePayment('stripe').createCheckoutLink({
    userId: user.id,
    email: user.email,
    name: user.name,
    variantId: stripeProductId,
    packageId: packageId,
    redirectUrl,
    mode: 'payment'
  });

  return checkoutLink;
});
