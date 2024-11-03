import { useDB, tables } from '../../utils/db'
import { eq, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export class CreditPackageActions {
  async findPackageById(packageId) {
    try {
      const [creditPackage] = await useDB()
        .select()
        .from(tables.creditPackages)
        .where(eq(tables.creditPackages.id, packageId))
      
      return creditPackage || null;
    } catch (error) {
      console.error('Erro ao buscar pacote:', error)
      return null
    }
  }

  async createPurchaseAndAddCredits(userId, packageId, paymentId) {
    const db = useDB()
    
    try {
      // Verificar se já existe uma compra com este paymentId
      const existingPurchase = await this.getPurchaseByStripeId(paymentId)
      if (existingPurchase) {
        console.log('🔄 Compra já processada:', paymentId)
        return existingPurchase
      }

      const creditPackage = await this.findPackageById(packageId)
      if (!creditPackage) {
        throw new Error('Pacote de créditos não encontrado')
      }

      console.log('📦 Pacote encontrado:', creditPackage)

      // Usar transação para garantir que ambas as operações sejam realizadas
      return await db.batch([
        db
          .insert(tables.creditPurchases)
          .values({
            id: nanoid(),
            userId,
            packageId: creditPackage.id,
            credits: creditPackage.credits,
            stripePaymentId: paymentId,
            status: 'paid',
            createdAt: new Date(),
            updatedAt: new Date()
          }),
        
        db
          .update(tables.userUsage)
          .set({
            extraCredits: sql`${tables.userUsage.extraCredits} + ${creditPackage.credits}`,
            lastUpdated: new Date()
          })
          .where(eq(tables.userUsage.userId, userId))
      ])
    } catch (error) {
      console.error('❌ Erro ao processar compra de créditos:', error)
      throw error
    }
  }

  async getPurchaseByStripeId(stripePaymentId) {
    try {
      const [purchase] = await useDB()
        .select()
        .from(tables.creditPurchases)
        .where(eq(tables.creditPurchases.stripePaymentId, stripePaymentId))
      
      return purchase
    } catch (error) {
      console.error('Erro ao buscar compra:', error)
      return null
    }
  }
}

// Exportação correta como singleton
export const creditPackageActions = new CreditPackageActions()
