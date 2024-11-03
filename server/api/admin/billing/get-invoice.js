import { usePayment } from "~~/server/services/payment";

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event);
  if (user.role !== "ADMIN") {
    throw createError({
      statusCode: 403,
      statusMessage: "Você não está autorizado a realizar esta ação",
    });
  }
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Chave da API do Stripe ausente",
    });
  }
  const { id } = getQuery(event);
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID da fatura ausente",
    });
  }
  const invoice = await usePayment("stripe").getInvoice(id);
  return invoice;
});
