import { voiceCloneActions } from "~~/server/services/db/VoiceCloneActions";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const clonedVoices = await voiceCloneActions.findClonedVoicesByUserId(user.id);
  return clonedVoices;
});

