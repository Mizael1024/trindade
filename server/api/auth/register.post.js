import { userActions } from "~~/server/services/db/UserActions";
import { sanitizeUser } from "~~/server/utils/auth";
import { registerationSchema } from "~~/server/validations/users";
import {
  generateEmailVerificationCode,
  generateOneTimePassword,
} from "~~/server/utils/auth";
import { OneTimePasswordTypes } from "~~/server/database/schema";
import { useEmail } from "~~/server/services/email";
import { renderOtpTemplate } from "~~/server/utils/email-templates";
import { nanoid } from "nanoid";

const { fromEmail, emailProvider } = useRuntimeConfig();
const { baseUrl } = useRuntimeConfig().public;

async function handleUserValidation(email) {
  const existingUser = await userActions.findUserByEmail(email);
  if (existingUser) {
    throw createError({
      statusCode: 400,
      statusMessage: "User already exists",
    });
  }
}

async function createUser({ email, name, password }) {
  const hashedPassword = await hashPassword(password);
  const userId = nanoid();
  
  const payload = {
    id: userId,
    email,
    name,
    hashedPassword,
  };

  const user = await userActions.createUserWithPassword(payload);
  return user;
}

async function sendVerificationEmail(
  email,
  oneTimePassword,
  emailVerificationCode,
) {
  if (import.meta.dev) {
    // dev only
    console.table({ email, oneTimePassword, emailVerificationCode });
  } else {
    const html = renderOtpTemplate({
      logoUrl: "https://microbot.dev/logo.png",
      code: oneTimePassword,
      link: `${baseUrl}/api/auth/verify-email-token?token=${emailVerificationCode}`,
      domain: baseUrl,
      type: "verification",
    });
    const emailOptions = {
      to: email,
      from: fromEmail,
      subject: "Voicefy - Criar conta",
      html,
    };
    await useEmail(emailProvider).send(emailOptions);
  }
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readValidatedBody(event, (body) =>
      registerationSchema.parse(body)
    );

    await handleUserValidation(body.email);
    const user = await createUser(body);

    const emailVerificationCode = await generateEmailVerificationCode(user.id);
    const oneTimePassword = await generateOneTimePassword(
      user.id,
      body.email,
      OneTimePasswordTypes.signup,
    );

    await sendVerificationEmail(
      body.email,
      oneTimePassword,
      emailVerificationCode,
    );

    return {
      user: sanitizeUser(user),
    };
  } catch (error) {
    throw error;
  }
});
