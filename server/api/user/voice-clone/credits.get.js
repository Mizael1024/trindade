import authMiddleware from "~~/server/middleware/auth";
import { voiceCloneActions } from "~~/server/services/db/VoiceCloneActions";

export default defineEventHandler(async (event) => {
  await authMiddleware(event);
  const { user } = event.context;
  
  try {
    const credits = await voiceCloneActions.verifyCredits(user.id);
    return credits;
  } catch (error) {
    console.error('Erro ao buscar créditos:', error);
    throw createError({
      statusCode: 500,
      message: 'Erro ao buscar créditos'
    });
  }
});
