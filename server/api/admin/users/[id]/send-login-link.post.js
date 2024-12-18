import { userActions } from "~~/server/services/db/UserActions";
import {
  generateEmailVerificationCode,
  generateOneTimePassword,
} from "~~/server/utils/auth";
import { useEmail } from "~~/server/services/email";
import { renderOtpTemplate } from "~~/server/utils/email-templates";

const { fromEmail, emailProvider } = useRuntimeConfig();
const { baseUrl } = useRuntimeConfig().public;

async function sendOtpEmail(email, oneTimePassword, emailVerificationCode) {
  if (import.meta.dev) {
    // dev only
    console.table({ email, oneTimePassword, emailVerificationCode });
  } else {
    const html = renderOtpTemplate({
      logoUrl: "https://microbot.dev/logo.png",
      code: oneTimePassword,
      link: `${baseUrl}/api/auth/verify-email-token?token=${emailVerificationCode}`,
      domain: baseUrl,
      type: "login",
    });
    const emailOptions = {
      to: email,
      from: fromEmail,
      subject: "Voicefy - Login with OTP",
      html,
    };
    await useEmail(emailProvider).send(emailOptions);
  }
}

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event);
  if (user.role !== "ADMIN") {
    throw createError({
      statusCode: 403,
      message: "You are not authorized to perform this action",
    });
  }

  const userId = getRouterParam(event, "id");
  const userRecord = await userActions.findUserByUserId(userId);
  if (!userRecord) {
    throw createError({
      statusCode: 400,
      message: "Usuário não encontrado, por favor, crie uma conta",
    });
  }
  if (!userRecord.emailVerified) {
    throw createError({
      statusCode: 400,
      message: "Usuário não verificou seu email",
    });
  }
  const emailVerificationCode = await generateEmailVerificationCode(
    userRecord.id,
  );
  const oneTimePassword = await generateOneTimePassword(
    userRecord.id,
    userRecord.email,
    "LOGIN",
  );
  await sendOtpEmail(userRecord.email, oneTimePassword, emailVerificationCode);
  setResponseStatus(event, 200);
  return {
    status: "success",
    message: "Código de acesso enviado para seu email",
  };
});
