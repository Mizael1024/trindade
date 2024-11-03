import { eq } from "drizzle-orm";

class FavoriteVoicesActions {
  async createFavorite(userId, voiceData) {
    try {
      const record = await useDB()
        .insert(tables.favoriteVoices)
        .values({
          user_id: userId,
          voice_id: voiceData.voice_id,
          elevenLabsId: voiceData.elevenLabsId,
        })
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error("Falha ao adicionar voz aos favoritos");
    }
  }

  async findFavoriteById(id) {
    try {
      const [favorite] = await useDB()
        .select()
        .from(tables.favoriteVoices)
        .where(eq(tables.favoriteVoices.id, id));
      return favorite || null;
    } catch (error) {
      console.error(error);
      throw new Error("Falha ao buscar favorito por ID");
    }
  }

  async deleteFavorite(id) {
    try {
      const record = await useDB()
        .delete(tables.favoriteVoices)
        .where(eq(tables.favoriteVoices.id, id))
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error("Falha ao remover voz dos favoritos");
    }
  }

  async findFavoritesByUserId(userId) {
    try {
      const favorites = await useDB()
        .select()
        .from(tables.favoriteVoices)
        .where(eq(tables.favoriteVoices.user_id, userId));
      return favorites;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

export const favoriteVoicesActions = new FavoriteVoicesActions();

