import { useDB, tables } from '../../utils/db';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

class PlanActions {
  async getAllPlans() {
    try {
      const plans = await useDB()
        .select()
        .from(tables.plans)
        .orderBy(tables.plans.created_at);
      return plans;
    } catch (error) {
      console.error(error);
      throw new Error("Falha ao buscar planos");
    }
  }

  async getPriceIdByProductId(productId) {
    try {
      const [plan] = await useDB()
        .select({
          priceId: tables.plans.priceId_stripe,
        })
        .from(tables.plans)
        .where(eq(tables.plans.productId_stripe, productId));
      
      return plan?.priceId || null;
    } catch (error) {
      console.error(error);
      throw new Error("Falha ao buscar priceId");
    }
  }

  async initializePlans() {
    const db = useDB();
    const plansData = [
      {
        id: nanoid(10),
        name: 'Iniciante Anual',
        productId_stripe: 'prod_R8E3UFzqJcxJ61',
        priceId_stripe: 'price_1QFxbhGJGCWWTgK5KknAmp1f',
        monthly_credits: 10000,
        type: 'year',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: nanoid(10),
        name: 'Iniciante Mensal',
        productId_stripe: 'prod_R8DTGS56b5Zxg2',
        priceId_stripe: 'price_1QFx2SGJGCWWTgK5clKdOf8Z',
        monthly_credits: 10000,
        type: 'month',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    try {
      for (const plan of plansData) {
        await db.insert(tables.plans)
          .values(plan)
          .onConflictDoUpdate({
            target: [tables.plans.productId_stripe],
            set: plan
          });
      }
    } catch (error) {
      console.error('Erro ao inicializar planos:', error);
      throw new Error('Falha ao inicializar planos');
    }
  }
}

export const planActions = new PlanActions();
