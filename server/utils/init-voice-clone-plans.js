import { voiceCloneActions } from '../services/db/VoiceCloneActions';
import { voiceClonePackages } from '../config/voiceClonePackages';
import Stripe from 'stripe';

export async function initVoiceClonePlans() {
  try {
    // 1. Inicializa os planos no banco de dados
    await voiceCloneActions.initializeVoiceClonePlans();

    // 2. Atualiza os preços dos planos com base no Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    for (const pkg of Object.values(voiceClonePackages)) {
      try {
        const price = await stripe.prices.retrieve(pkg.priceId);
        await voiceCloneActions.updatePlanPrice(pkg.id, price.unit_amount);
      } catch (error) {
        console.error(`Erro ao atualizar preço do plano ${pkg.id}:`, error);
      }
    }

    console.log('Inicialização dos planos de clone de voz concluída');
  } catch (error) {
    console.error('Erro na inicialização dos planos de clone de voz:', error);
    throw error;
  }
}
