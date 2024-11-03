import { storageActions } from "~~/server/services/storage";
import authMiddleware from "~~/server/middleware/auth";

export default defineEventHandler(async event => {
  await authMiddleware(event);
  const { user } = event.context;
  const images = await storageActions.findImagesByUserId(user.id);
  return images;
});
