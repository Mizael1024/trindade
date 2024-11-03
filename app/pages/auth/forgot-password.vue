<template>
  <main class="flex flex-col items-center justify-center h-screen">
    <div class="w-full max-w-sm mx-auto space-y-4">

      <h1 class="font-semibold text-2xl">Recuperar senha</h1>
      <p class="text-sm">
        Digite seu email e enviaremos instruções para redefinir sua senha
      </p>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4 max-w-sm"
        @submit="onSubmit"
      >
        <UFormGroup label="Email" name="email" size="lg">
          <UInput v-model="state.email" />
        </UFormGroup>
        <UButton
          :loading="loading"
          color="black"
          type="submit"
          :disabled="loading"
          size="lg"
          block
        >
          Enviar
        </UButton>
      </UForm>
    </div>
  </main>
</template>

<script setup>
import { z } from "zod";
import { toast } from "vue-sonner";

const schema = z.object({
  email: z.string().email("Invalid email"),
});

const state = reactive({
  email: undefined,
});

const loading = ref(false);

async function onSubmit(event) {
  try {
    loading.value = true;
    await $fetch("/api/auth/reset-password", {
      method: "POST",
      body: event.data,
    });
    toast("Email enviado", {
      description:
        "Instruções para redefinir sua senha foram enviadas para seu email",
    });
  } catch (error) {
    loading.value = false;
    toast.error(error.data.statusMessage);
  } finally {
    loading.value = false;
  }
}
</script>
