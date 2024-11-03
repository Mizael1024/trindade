import { planActions } from "~~/server/services/db/PlanActions";
import { z } from "zod";

const planSchema = z.object({
  name: z.string().min(1),
  offer_id: z.string().min(1),
  credits: z.number().min(0),
  monthly_credits: z.number().min(0),
  duration: z.number().min(1),
  type: z.string().min(1),
  price: z.number().min(0),
  priceId_stripe: z.string().optional(),
  productId_stripe: z.string().optional()
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) => planSchema.parse(body));

  try {
    const plan = await planActions.createPlan(body);
    return plan;
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Erro ao criar plano"
    });
  }
});
