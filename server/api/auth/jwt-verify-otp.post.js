import authMiddleware from "~~/server/middleware/auth";
import { userActions } from "~~/server/services/db/UserActions";
import { authActions } from "~~/server/services/db/AuthActions";
import { sanitizeUser } from "~~/server/utils/auth";
import { isWithinExpiryDate } from "~~/server/utils/otp";
import { otpVerificationSchema } from "~~/server/validations/users";

export default defineEventHandler(async (event) => {
  const { email, code, type } = await readValidatedBody(event, (body) =>
    otpVerificationSchema.parse(body),
  );

  const otp = await authActions.findOneTimePassword(code, type, email);
  if (!otp) {
    throw createError({ statusCode: 400, statusMessage: "Invalid OTP" });
  }
  if (!isWithinExpiryDate(otp.expiresAt)) {
    throw createError({ statusCode: 400, statusMessage: "OTP has expired" });
  }
  if (type === "SIGNUP") {
    await userActions.verifyUser(otp.userId);
  }
  const user = await userActions.findUserByUserId(otp.userId);
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  await authActions.deleteOneTimePassword(otp.id);

  const emailVerificationCode =
    await authActions.findEmailVerificationCodeByUserId(user.id);
  if (emailVerificationCode) {
    await authActions.deleteEmailVerificationCode(emailVerificationCode.id);
  }

  if (user.banned) {
    throw createError({
      statusCode: 403,
      statusMessage: "You account has been banned",
    });
  }

  await userActions.updateLastActive(user.id);
  const transformedUser = sanitizeUser(user);
  const token = await generateToken(user);
  return { ...transformedUser, token };
});
