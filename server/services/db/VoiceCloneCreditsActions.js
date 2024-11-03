import { useDB } from '../../utils/db';
import { tables } from '../../utils/db';
import { eq, sql } from 'drizzle-orm';

class VoiceCloneCreditsActions {
  async verifyCredits(userId) {
    const [usage] = await useDB()
      .select()
      .from(tables.userUsage)
      .where(eq(tables.userUsage.userId, userId));
      
    return {
      available: (usage?.voiceCloneTotal || 0) - (usage?.voiceCloneUsed || 0),
      total: usage?.voiceCloneTotal || 0,
      used: usage?.voiceCloneUsed || 0
    };
  }

  async consumeCredit(userId) {
    const credits = await this.verifyCredits(userId);
    if (credits.available < 1) {
      throw new Error('Créditos insuficientes');
    }

    return await useDB()
      .update(tables.userUsage)
      .set({ 
        voiceCloneUsed: credits.used + 1,
        lastUpdated: new Date()
      })
      .where(eq(tables.userUsage.userId, userId))
      .returning();
  }

  async addCredits(userId, amount) {
    return await useDB()
      .update(tables.userUsage)
      .set({ 
        voiceCloneTotal: sql`${tables.userUsage.voiceCloneTotal} + ${amount}`,
        lastUpdated: new Date()
      })
      .where(eq(tables.userUsage.userId, userId))
      .returning();
  }
}

export const voiceCloneCreditsActions = new VoiceCloneCreditsActions();
