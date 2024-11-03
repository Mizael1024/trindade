import { planActions } from "~~/server/services/db/PlanActions";

export default defineEventHandler(async (event) => {
  try {
    const plans = await planActions.getAllPlans();
    return plans;
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Erro ao buscar planos"
    });
  }
});
