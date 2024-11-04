import { voiceCloneActions } from '../services/db/VoiceCloneActions';
import { voiceClonePackages } from '../config/voiceClonePackages';
import Stripe from 'stripe';

export async function initVoiceClonePlans() {
  try {
    console.log('Iniciando configuração dos planos de clone de voz...');
    
    // 1. Inicializa os planos no banco de dados
    console.log('1. Inicializando planos no banco de dados...');
    await voiceCloneActions.initializeVoiceClonePlans();
    console.log('Planos inicializados com sucesso no banco');

    // 2. Atualiza os preços dos planos com base no Stripe
    console.log('2. Conectando ao Stripe...');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    console.log('Conexão com Stripe estabelecida');

    console.log('3. Atualizando preços dos pacotes:');
    for (const pkg of Object.values(voiceClonePackages)) {
      try {
        console.log(`\nProcessando pacote ${pkg.id}:`);
        console.log('- PriceId:', pkg.priceId);
        
        const price = await stripe.prices.retrieve(pkg.priceId);
        console.log('- Preço obtido do Stripe:', price.unit_amount);
        
        await voiceCloneActions.updatePlanPrice(pkg.id, price.unit_amount);
        console.log(`- Preço atualizado com sucesso para o pacote ${pkg.id}`);
      } catch (error) {
        console.error(`Erro detalhado ao atualizar pacote ${pkg.id}:`, {
          error: error.message,
          code: error.code,
          type: error.type,
          packageDetails: pkg
        });
      }
    }

    console.log('Inicialização dos planos de clone de voz concluída');
  } catch (error) {
    console.error('Erro na inicialização dos planos de clone de voz:', error);
    throw error;
  }
}
