import { storageActions } from "~~/server/services/storage";
import authMiddleware from "~~/server/middleware/auth";

export default defineEventHandler(async (event) => {
  await authMiddleware(event);
  const { user } = event.context;
  const id = getRouterParam(event, "id");
  const image = await storageActions.findImageById(id);
  if (!image || image.userId !== user.id) {
    throw new Error("Image not found or you are not authorized.");
  }
  await storageActions.deleteImage(image.id);
  await hubBlob().del(image.pathname);
  return sendNoContent(event);
});
