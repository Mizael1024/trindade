import { userActions } from "~~/server/services/db/UserActions";
import { authActions } from "~~/server/services/db/AuthActions";
import { sanitizeUser } from "~~/server/utils/auth";

async function handleOAuthLogin(oauthUser) {
  try {
    let user = await userActions.findUserByEmail(oauthUser.email);
    
    if (!user) {
      user = await userActions.createUserWithOAuthAccount({
        email: oauthUser.email,
        name: oauthUser.name,
        avatarUrl: oauthUser.avatarUrl,
        emailVerified: true,
      });
    } else if (!user.avatarUrl && oauthUser.avatarUrl) {
      user = await userActions.updateUser(user.id, {
        avatarUrl: oauthUser.avatarUrl,
      });
    }

    if (user && user.id) {
      await authActions.linkOAuthAccount(
        user.id,
        oauthUser.providerId,
        oauthUser.providerUserId,
      );
    }

    return user;
  } catch (error) {
    console.error('Erro no handleOAuthLogin:', error);
    throw createError({
      statusCode: 500,
      message: 'Erro ao processar login com Google. Por favor, tente novamente.',
      statusMessage: 'Erro ao processar login com Google'
    });
  }
}

export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user }) {
    try {
      const oauthUser = {
        email: user.email,
        name: user.name,
        avatarUrl: user.picture,
        providerId: "google",
        providerUserId: user.sub,
      };
      
      const dbUser = await handleOAuthLogin(oauthUser);
      
      if (!dbUser) {
        throw createError({
          statusCode: 500,
          message: 'Erro ao processar usuário'
        });
      }

      if (dbUser.banned) {
        throw createError({
          statusCode: 403,
          message: "Sua conta foi banida"
        });
      }
      
      const transformedUser = sanitizeUser(dbUser);
      await setUserSession(event, { user: transformedUser });
      
      return sendRedirect(event, "/dashboard/texto-para-fala");
    } catch (error) {
      console.error('Erro no onSuccess:', error);
      const errorMessage = error.message || 'Falha na autenticação com Google';
      return sendRedirect(event, `/auth/login?error=${encodeURIComponent(errorMessage)}`);
    }
  },
  onError(event, error) {
    console.error("Erro na autenticação Google:", error);
    return sendRedirect(event, "/auth/login?error=google-auth-error");
  },
});
