import { favoriteVoicesActions } from "~~/server/services/db/FavoriteVoicesActions";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  
  const { voice_id, elevenLabsId } = await readValidatedBody(event, (body) =>
    z.object({
      voice_id: z.string(),
      elevenLabsId: z.string()
    }).parse(body)
  );

  const favorite = await favoriteVoicesActions.createFavorite(user.id, { voice_id, elevenLabsId });
  return favorite;
});

