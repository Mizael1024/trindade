import { postsActions } from "~~/server/services/db/PostsActions";
import authMiddleware from "~~/server/middleware/auth";

export default defineEventHandler(async (event) => {
  await authMiddleware(event);
  const { user } = event.context;
  const postId = getRouterParam(event, "id");
  const post = await postsActions.findPostById(postId);
  if (!post || post.userId !== user.id) {
    throw createError({ statusCode: 404, message: "Post not found" });
  }
  await postsActions.deletePost(postId);
  return { success: true };
});
