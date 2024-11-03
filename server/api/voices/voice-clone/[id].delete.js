import { voiceCloneActions } from "~~/server/services/db/VoiceCloneActions";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const voiceId = getRouterParam(event, "id");
  
  const voice = await voiceCloneActions.findClonedVoiceById(voiceId);
  if (!voice || voice.userId !== user.id) {
    throw createError({ statusCode: 404, message: "Voz clonada não encontrada" });
  }
  
  await voiceCloneActions.deleteClonedVoice(voiceId);
  return { success: true };
});

