import { userActions } from "~~/server/services/db/UserActions";
import { sanitizeUser } from "~~/server/utils/auth";
import { passkeyLoginSchema } from "~~/server/validations/users";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";

const verifyAuthenticationStep = async (
  userCredential,
  challenge,
  authenticationResponse,
) => {
  try {
    const { expectedOrigin, expectedRPID } = useRuntimeConfig();
    const dbAuthenticator = {
      credentialID: new Uint8Array(
        Buffer.from(userCredential.externalID, "base64"),
      ),
      credentialPublicKey: userCredential.publicKey,
      counter: userCredential.signCount,
    };

    if (!dbAuthenticator) {
      throw new Error("Authenticator is not registered with this site");
    }

    const opts = {
      response: authenticationResponse,
      expectedChallenge: challenge,
      expectedOrigin,
      expectedRPID,
      authenticator: dbAuthenticator,
      requireUserVerification: true,
    };
    const verification = await verifyAuthenticationResponse(opts);
    return verification;
  } catch (error) {
    console.error("Error during authentication verification:", error);
    throw new Error(`Authentication verification failed: ${error.message}`);
  }
};

export default defineEventHandler(async event => {
  try {
    const { email, challenge, authenticationResponse } =
      await readValidatedBody(event, body => passkeyLoginSchema.parse(body));

    const user = await userActions.findUserByEmail(email);
    if (!user) {
      throw createError({
        statusCode: 400,
        statusMessage: "Usuário não encontrado, por favor, crie uma conta", 
      });
    }

    if (!authenticationResponse?.id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Credenciais inválidas",
      });
    }

    const userCredential = await userActions.findPasskeyCredentialByUserId(
      user.id,
    );
    if (!userCredential || userCredential.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Credenciais inválidas",
      });
    }

    const verification = await verifyAuthenticationStep(
      userCredential[0],
      challenge,
      authenticationResponse,
    );

    await userActions.updatePasskeySignCount(
      userCredential[0],
      verification.authenticationInfo.newCounter,
    );

    if (user.banned) {
      throw createError({
        statusCode: 403,
        statusMessage: "Sua conta foi banida",
      });
    }

    const transformedUser = sanitizeUser(user);
    await setUserSession(event, { user: transformedUser });
    return transformedUser;
  } catch (error) {
    console.error("Error in event handler:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage:
        error.statusMessage || `Erro interno do servidor: ${error.message}`,
    });
  }
});
