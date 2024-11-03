import { eq, desc, sql } from "drizzle-orm";
import { useDB, tables } from '../../utils/db'
import { voiceClonePackages } from '../../config/voiceClonePackages';
import { nanoid } from 'nanoid';

class VoiceCloneActions {
  async createClonedVoice(userId, voiceData) {
    try {
      console.log('Iniciando createClonedVoice com:', { userId, voiceData });
      
      // 1. Primeiro, inserir na tabela elevenlabs
      const elevenLabsRecord = await useDB()
        .insert(tables.elevenlabs)
        .values({
          elevenLabsId: voiceData.elevenLabsId,
          name: voiceData.name,
          category: 'cloned',
          sampleUrl: voiceData.sampleUrl,
          profileUrl: voiceData.profileUrl
        })
        .returning()
        .get();

      // 2. Depois, inserir na tabela cloned_voices
      const clonedVoiceRecord = await useDB()
        .insert(tables.clonedVoices)
        .values({
          userId,
          name: voiceData.name,
          elevenLabsId: voiceData.elevenLabsId,
          status: voiceData.status || 'processing'
        })
        .returning()
        .get();
      
      console.log('Registros criados com sucesso:', { elevenLabsRecord, clonedVoiceRecord });
      return { elevenLabsRecord, clonedVoiceRecord };
    } catch (error) {
      console.error('Erro detalhado em createClonedVoice:', error);
      throw new Error("Falha ao criar voz clonada");
    }
  }

  async findClonedVoiceById(id) {
    try {
      const [voice] = await useDB()
        .select()
        .from(tables.clonedVoices)
        .where(eq(tables.clonedVoices.id, id));
      return voice || null;
    } catch (error) {
      console.error(error);
      throw new Error("Falha ao buscar voz clonada por ID");
    }
  }

  async updateClonedVoice(id, payload) {
    try {
      const record = await useDB()
        .update(tables.clonedVoices)
        .set(payload)
        .where(eq(tables.clonedVoices.id, id))
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error("Falha ao atualizar voz clonada");
    }
  }

  async deleteClonedVoice(id) {
    try {
      const record = await useDB()
        .delete(tables.clonedVoices)
        .where(eq(tables.clonedVoices.id, id))
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error("Falha ao deletar voz clonada");
    }
  }

  async findClonedVoicesByUserId(userId) {
    try {
      const voices = await useDB()
        .select()
        .from(tables.clonedVoices)
        .where(eq(tables.clonedVoices.userId, userId))
        .orderBy(desc(tables.clonedVoices.created_at));
      return voices;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async initializeVoiceClonePlans() {
    const db = useDB();
    
    try {
      // Converte os pacotes do config para o formato da tabela
      const plansData = Object.values(voiceClonePackages).map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        credits: pkg.credits,
        price: 0, // Será atualizado via Stripe
        created_at: new Date(),
        updated_at: new Date()
      }));

      // Insere ou atualiza cada plano
      for (const plan of plansData) {
        await db.insert(tables.voiceClonePlans)
          .values(plan)
          .onConflictDoUpdate({
            target: [tables.voiceClonePlans.id],
            set: {
              name: plan.name,
              credits: plan.credits,
              updated_at: new Date()
            }
          });
      }

      console.log('Planos de clone de voz inicializados com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar planos de clone de voz:', error);
      throw new Error('Falha ao inicializar planos de clone de voz');
    }
  }

  async findPlanById(planId) {
    try {
      const [plan] = await useDB()
        .select()
        .from(tables.voiceClonePlans)
        .where(eq(tables.voiceClonePlans.id, planId));
      
      return plan;
    } catch (error) {
      console.error('Erro ao buscar plano:', error);
      return null;
    }
  }

  async updatePlanPrice(planId, price) {
    try {
      await useDB()
        .update(tables.voiceClonePlans)
        .set({ 
          price,
          updated_at: new Date()
        })
        .where(eq(tables.voiceClonePlans.id, planId));
    } catch (error) {
      console.error('Erro ao atualizar preço do plano:', error);
      throw error;
    }
  }

  async verifyCredits(userId) {
    try {
      const [usage] = await useDB()
        .select()
        .from(tables.userUsage)
        .where(eq(tables.userUsage.userId, userId));
      
      return {
        available: (usage?.voiceCloneTotal || 0) - (usage?.voiceCloneUsed || 0),
        total: usage?.voiceCloneTotal || 0,
        used: usage?.voiceCloneUsed || 0
      };
    } catch (error) {
      console.error('Erro ao verificar créditos:', error);
      throw new Error('Falha ao verificar créditos');
    }
  }

  async incrementUsage(userId) {
    try {
      await useDB()
        .update(tables.userUsage)
        .set({ 
          voiceCloneUsed: sql`${tables.userUsage.voiceCloneUsed} + 1`,
          lastUpdated: new Date()
        })
        .where(eq(tables.userUsage.userId, userId));
    } catch (error) {
      console.error('Erro ao incrementar uso:', error);
      throw new Error('Falha ao incrementar uso');
    }
  }

  async processPurchase({ userId, planId, credits, stripePaymentId, status }) {
    const db = useDB();
    
    try {
      // Verificar se já existe uma compra com este paymentId
      const [existingPurchase] = await db
        .select()
        .from(tables.voiceClonePurchases)
        .where(eq(tables.voiceClonePurchases.stripePaymentId, stripePaymentId));

      if (existingPurchase) {
        console.log('🔄 Compra já processada:', stripePaymentId);
        return existingPurchase;
      }

      // Registrar a compra primeiro
      const purchase = await db.insert(tables.voiceClonePurchases)
        .values({
          id: nanoid(),
          userId,
          planId,
          credits,
          stripePaymentId,
          status,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning()
        .get();

      // Depois atualizar os créditos do usuário
      const [userUsage] = await db
        .select()
        .from(tables.userUsage)
        .where(eq(tables.userUsage.userId, userId));

      if (!userUsage) {
        await db.insert(tables.userUsage)
          .values({
            userId,
            voiceCloneTotal: credits,
            voiceCloneUsed: 0,
            lastUpdated: new Date()
          });
      } else {
        await db.update(tables.userUsage)
          .set({
            voiceCloneTotal: sql`${tables.userUsage.voiceCloneTotal} + ${credits}`,
            lastUpdated: new Date()
          })
          .where(eq(tables.userUsage.userId, userId));
      }

      return purchase;
    } catch (error) {
      console.error('❌ Erro ao processar compra:', error);
      throw new Error('Falha ao processar compra de créditos');
    }
  }
}

export const voiceCloneActions = new VoiceCloneActions();
