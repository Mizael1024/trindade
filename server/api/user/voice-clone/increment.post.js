import authMiddleware from "~~/server/middleware/auth";
import { voiceCloneActions } from "~~/server/services/db/VoiceCloneActions";

export default defineEventHandler(async (event) => {
  await authMiddleware(event);
  const { user } = event.context;

  try {
    await voiceCloneActions.incrementUsage(user.id);
    return { success: true };
  } catch (error) {
    console.error('Erro ao incrementar uso de clone:', error);
    throw createError({
      statusCode: 500,
      message: 'Falha ao atualizar créditos'
    });
  }
});
