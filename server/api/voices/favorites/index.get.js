import { favoriteVoicesActions } from "~~/server/services/db/FavoriteVoicesActions";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const favorites = await favoriteVoicesActions.findFavoritesByUserId(user.id);
  return favorites;
});

