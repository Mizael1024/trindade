import { verifyToken } from "~~/server/utils/jwt-auth";

const authMiddleware = defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname;
  // Only apply middleware to API routes
  if (!path.startsWith("/api/")) {
    return;
  }

  // Ignore /api/_hub/*
  if (path.startsWith("/api/_hub/")) {
    return;
  }

  // List of public API routes that don't require authentication
  const publicApiRoutes = [
    "/api/auth/login-with-password",
    "/api/auth/login-with-otp",
    "/api/auth/github",
    "/api/auth/google",
    "/api/auth/jwt-login",
    "/api/auth/register",
    "/api/auth/logout",
    "/api/auth/verify-email",
    "/api/auth/resend-verification-email",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/auth/refresh-token",
    "/api/auth/change-password",
    "/api/auth/change-email",
    "/api/auth/send-magic-link",
    "/api/auth/logout",
    "/api/auth/verify-email",
    "/api/auth/verify-otp",
    "/api/auth/jwt-verify-otp",
    "/api/auth/resend-otp",
    "/api/payment/webhook/stripe",
    "/api/payment/webhook/lemonsqueezy",
  ];

  if (publicApiRoutes.includes(path)) {
    return;
  }

  const session = await getUserSession(event);
  if (session.user) {
    event.context.user = session.user;
    return;
  }

  const authHeader = event.node.req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  if (token) {
    const decoded = await verifyToken(token);
    if (decoded) {
      event.context.user = decoded;
      return;
    }
  }

  throw createError({
    statusCode: 401,
    message: "Unauthorized",
  });
});

export default authMiddleware;
