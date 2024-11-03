import { voiceCloneActions } from "~~/server/services/db/VoiceCloneActions";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const formData = await readMultipartFormData(event);
  
  if (!formData) {
    throw createError({ statusCode: 400, message: "Dados inválidos" });
  }

  const clonedVoice = await voiceCloneActions.cloneVoice(user.id, formData);
  return clonedVoice;
});
