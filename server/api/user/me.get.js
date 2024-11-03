import authMiddleware from "~~/server/middleware/auth";
import { userActions } from "~~/server/services/db/UserActions";

export default defineEventHandler(async (event) => {
  await authMiddleware(event);
  const { user } = event.context;
  const userDetails = await userActions.findUserByUserId(user.id);

  if (!userDetails) {
    throw createError({
      statusCode: 404,
      message: "User not found",
    });
  }
  // Remove sensitive information
  const { hashedPassword, ...safeUserDetails } = userDetails;
  return safeUserDetails;
});
