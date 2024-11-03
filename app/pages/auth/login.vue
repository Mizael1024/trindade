<template>
  <main class="flex flex-col items-center justify-center h-screen">
    <div class="w-full max-w-sm mx-auto space-y-6">
      <img src="/logo.png" alt="Microbot" class="h-8 w-auto" />
      <h1 class="font-semibold text-2xl">Entrar</h1>
      <p class="text-sm">Digite suas informações para acessar sua conta</p>
      <div
        class="border-b-2 border-gray-200 dark:border-white/20 grid grid-cols-2 relative"
      >
        <span
          id="mode-indicator"
          class="w-1/2 absolute h-0.5 -bottom-0.5 bg-gray-500 dark:bg-gray-200 pointer-events-none transition-all duration-300"
          :class="mode === 'magicLink' ? 'left-0' : 'left-1/2'"
        />
        <UButton
          v-for="modeOption in modeOptions"
          :key="modeOption.value"
          size="lg"
          :label="modeOption.label"
          variant="ghost"
          color="gray"
          block
          class="rounded-b-none"
          :class="{
            'text-gray-400 dark:text-gray-600': mode !== modeOption.value,
          }"
          @click="changeMode(modeOption.value)"
        />
      </div>
      <AuthLoginMagicLinkForm v-if="mode === 'magicLink'" />
      <AuthLoginPasswordForm v-if="mode === 'password'" />
      <UDivider label="OU" />
      <AuthSocialLogin />
      <p class="text-sm text-center">
        Não tem uma conta?
        <UButton to="/auth/register" variant="link" :padded="false" color="gray"
          >Cadastre-se</UButton
        >
      </p>
    </div>
  </main>
</template>

<script setup>
const mode = ref("magicLink");
const modeOptions = [
  { label: "Link mágico", value: "magicLink" },
  { label: "Senha", value: "password" },
];

function changeMode(newMode) {
  mode.value = newMode;
}

const indicatorLeftPosition = computed(() => {
  const index = modeOptions.findIndex(option => option.value === mode.value);
  return `${index * 50}%`;
});
</script>
