import { postsActions } from "~~/server/services/db/PostsActions";
import authMiddleware from "~~/server/middleware/auth";

export default defineEventHandler(async (event) => {
  await authMiddleware(event);
  const { user } = event.context;
  const posts = await postsActions.findPostsByUserId(user.id);
  return posts;
});
