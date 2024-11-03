import { userActions } from "../../../services/db/UserActions";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  
  try {
    const subscription = await userActions.findSubscriptionByUserId(user.id)
    
    if (!subscription) {
      return {
        planName: 'Grátis',
        creditosAtuais: 0,
        totalDisponivel: 500,
        creditosExtras: 0
      }
    }

    const planInfo = await userActions.getUserPlanCredits(subscription.variantId)
    const usage = await userActions.getUserUsage(user.id)
    
    return {
      planName: planInfo.planName,
      creditosAtuais: usage?.charactersUsed || 0,
      totalDisponivel: planInfo.monthlyCredits,
      creditosExtras: usage?.extraCredits || 0,
      ultimaAtualizacao: usage?.lastUpdated
    }

  } catch (error) {
    console.error('Erro ao verificar usage:', error)
    throw createError({
      statusCode: 400,
      message: error.message
    })
  }
})
