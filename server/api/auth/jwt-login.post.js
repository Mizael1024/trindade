import { loginWithJWT } from "~~/server/utils/jwt-auth";

export default defineEventHandler(async (event) => {
  try {
    const { email, password } = await readBody(event);
    return await loginWithJWT(email, password);
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: error.message,
    });
  }
});
