import { favoriteVoicesActions } from "~~/server/services/db/FavoriteVoicesActions";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const favoriteId = getRouterParam(event, "id");
  
  const favorite = await favoriteVoicesActions.findFavoriteById(favoriteId);
  if (!favorite || favorite.user_id !== user.id) {
    throw createError({ statusCode: 404, message: "Favorito não encontrado" });
  }
  
  await favoriteVoicesActions.deleteFavorite(favoriteId);
  return { success: true };
});

