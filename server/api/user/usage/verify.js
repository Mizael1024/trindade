import { userActions } from "../../../services/db/UserActions";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  
  try {
    const [subscription, usage] = await Promise.all([
      userActions.findSubscriptionByUserId(user.id),
      userActions.getUserUsage(user.id)
    ]);
    
    let planInfo
    if (!subscription) {
      planInfo = {
        planName: 'Grátis',
        monthlyCredits: 500
      }
    } else {
      planInfo = await userActions.getUserPlanCredits(subscription.variantId)
    }
    
    return {
      planName: planInfo.planName,
      creditosAtuais: parseInt(usage?.charactersUsed || 0),
      totalDisponivel: planInfo.monthlyCredits,
      creditosExtras: parseInt(usage?.extraCredits || 0),
      ultimaAtualizacao: usage?.lastUpdated
    }

  } catch (error) {
    throw createError({
      statusCode: 400,
      message: error.message
    })
  }
})
