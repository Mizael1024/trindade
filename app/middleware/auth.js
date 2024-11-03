export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession();

  // Se estiver acessando a raiz (/), redireciona para login
  if (to.path === '/') {
    return navigateTo("/auth/login");
  }

  // Se não estiver logado, redireciona para o login
  if (!loggedIn.value) {
    return navigateTo("/auth/login");
  }

  // Se estiver acessando /dashboard diretamente, redireciona para texto-para-fala
  if (to.path === '/dashboard') {
    return navigateTo("/dashboard/texto-para-fala");
  }
});
