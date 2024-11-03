import { userActions } from "~~/server/services/db/UserActions";
import { updateUserSchema } from "~~/server/validations/users";
import { sanitizeUser } from "~~/server/utils/auth";
import authMiddleware from "~~/server/middleware/auth";

export default defineEventHandler(async (event) => {
  await authMiddleware(event);
  const { user } = event.context;
  const { name, password, avatarUrl } = await readValidatedBody(event, (body) =>
    updateUserSchema.parse(body),
  );
  const updatedUser = await userActions.updateUser(user.id, {
    name,
    password,
    avatarUrl,
  });
  const transformedUser = sanitizeUser(updatedUser);
  await setUserSession(event, { user: transformedUser });
  return transformedUser;
});
