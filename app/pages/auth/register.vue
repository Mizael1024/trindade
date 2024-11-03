<template>
  <main class="flex flex-col items-center justify-center h-screen">
    <div class="w-full max-w-sm mx-auto space-y-6">
      <img src="/logo.png" alt="Microbot" class="h-8 w-auto" />
      <h1 class="font-semibold text-2xl">Cadastre-se</h1>
      <p class="text-sm">Digite suas informações para criar uma conta</p>
      <AuthRegisterPasswordForm />
      <UDivider label="OU" />
      <AuthSocialLogin />
      <p class="text-sm text-center">
        Já tem uma conta?
        <UButton to="/auth/login" variant="link" :padded="false" color="gray"
          >Entrar</UButton
        >
      </p>
    </div>
  </main>
</template>
