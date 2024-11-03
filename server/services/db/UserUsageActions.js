import { useDB, tables } from '../../utils/db'
import { eq, sql } from 'drizzle-orm'

class UserUsageActions {
  async getUserUsage(userId) {
    try {
      const [usage] = await useDB()
        .select()
        .from(tables.userUsage)
        .where(eq(tables.userUsage.userId, userId))
      return usage
    } catch (error) {
      return null
    }
  }

  async incrementUsage(userId, characters) {
    try {
      const [currentUsage] = await useDB()
        .select()
        .from(tables.userUsage)
        .where(eq(tables.userUsage.userId, userId))

      if (!currentUsage) {
        throw new Error('Usuário não encontrado na tabela user_usage')
      }

      const newTotal = currentUsage.charactersUsed + characters
      if (currentUsage.charactersTotal !== -1 && newTotal > currentUsage.charactersTotal) {
        throw new Error('Limite de caracteres excedido')
      }

      await useDB()
        .update(tables.userUsage)
        .set({
          charactersUsed: sql`${tables.userUsage.charactersUsed} + ${characters}`,
          lastUpdated: new Date()
        })
        .where(eq(tables.userUsage.userId, userId))

      return {
        success: true,
        remainingCredits: currentUsage.charactersTotal === -1 ? -1 : currentUsage.charactersTotal - newTotal
      }
    } catch (error) {
      throw error
    }
  }

  async updateTotalCharacters(userId, total) {
    try {
      await useDB()
        .insert(tables.userUsage)
        .values({
          userId,
          charactersUsed: 0,
          charactersTotal: total
        })
        .onConflictDoUpdate({
          target: tables.userUsage.userId,
          set: {
            charactersTotal: total,
            lastUpdated: new Date()
          }
        })
    } catch (error) {
      console.error('Erro ao atualizar total de caracteres:', error)
      throw error
    }
  }

  async resetAndUpdateTotalCharacters(userId, total) {
    try {
      await useDB()
        .insert(tables.userUsage)
        .values({
          userId,
          charactersUsed: 0,
          charactersTotal: total
        })
        .onConflictDoUpdate({
          target: tables.userUsage.userId,
          set: {
            charactersTotal: total,
            charactersUsed: 0,
            lastUpdated: new Date()
          }
        })
    } catch (error) {
      console.error('Erro ao atualizar total de caracteres:', error)
      throw error
    }
  }

  async incrementVoiceCloneUsage(userId) {
    try {
      const result = await useDB()
        .update(tables.userUsage)
        .set({
          voiceCloneUsed: sql`voice_clone_used + 1`,
          lastUpdated: new Date()
        })
        .where(eq(tables.userUsage.userId, userId))
        .returning()

      if (!result.length) {
        throw new Error('Falha ao incrementar uso de clone de voz')
      }

      return result[0]
    } catch (error) {
      console.error('Erro ao incrementar uso de clone:', error)
      throw error
    }
  }
}

export const userUsageActions = new UserUsageActions()
