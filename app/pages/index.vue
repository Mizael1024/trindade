<template>
  <UContainer class="py-8">
    <div class="flex items-center gap-4 justify-between p-2">
      <div class="ml-2 font-semibold">Voicefy</div>
      <span class="flex-1" />
      <UButton color="black" :to="loggedIn ? '/dashboard/texto-para-fala' : '/auth/login'">
        {{ loggedIn ? "Dashboard" : "Login" }}
      </UButton>
      <UButton color="black" to="/auth/register">Criar conta</UButton>
    </div>
    <section
      class="py-32 space-y-6 text-center flex flex-col items-center max-w-4xl mx-auto"
    >
      <h1 class="font-bold text-4xl sm:text-7xl">Your Super Catchy Title</h1>
      <p class="text-xl text-gray-500">Get started with your new startup</p>
      <HomeWaitlist />
    </section>
  </UContainer>
</template>

<script setup>
const { loggedIn } = useUserSession();

definePageMeta({
  middleware: ['auth']
});
</script>
