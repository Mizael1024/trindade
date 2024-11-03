import * as jose from "jose";
import { userActions } from "~~/server/services/db/UserActions";
const { jwtSecret } = useRuntimeConfig();

const JWT_SECRET_TOKEN = jwtSecret;

const JWT_SECRET_BUFFER = new TextEncoder().encode(JWT_SECRET_TOKEN);

export const generateToken = async (user) => {
  return await new jose.SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET_BUFFER);
};

export const verifyToken = async (token) => {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET_BUFFER);
    return payload;
  } catch (error) {
    return null;
  }
};

export const authenticateUser = async (email, password) => {
  const user = await userActions.findUserByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }
  const isPasswordCorrect = await verifyPassword(user.hashedPassword, password);
  if (!isPasswordCorrect) {
    throw new Error("Invalid password");
  }
  return user;
};

export const loginWithJWT = async (email, password) => {
  try {
    const user = await authenticateUser(email, password);
    const token = await generateToken(user);
    return { token, user: { id: user.id, email: user.email, role: user.role } };
  } catch (error) {
    throw createError({
      statusCode: 401,
      message: error.message,
    });
  }
};
