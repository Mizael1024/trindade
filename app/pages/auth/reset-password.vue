<template>
  <main class="flex flex-col items-center justify-center h-screen">
    <div class="w-full max-w-sm mx-auto space-y-4">
      <img src="/logo.png" alt="Microbot" class="h-8 w-auto" />
      <h1 class="font-semibold text-2xl">Definir uma nova senha</h1>
      <p class="text-sm">
        Sua senha deve ser diferente da anterior.
      </p>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4 max-w-sm"
        @submit="onSubmit"
      >
        <UFormGroup label="Nova senha" name="password" size="lg">
          <UInput v-model="state.password" type="password" />
        </UFormGroup>
        <UFormGroup
          label="Confirmar nova senha"
          name="passwordConfirmation"
          size="lg"
        >
          <UInput v-model="state.passwordConfirmation" type="password" />
        </UFormGroup>
        <UButton
          :loading="loading"
          color="black"
          type="submit"
          :disabled="loading"
          size="lg"
          block
        >
          Criar
        </UButton>
      </UForm>
    </div>
  </main>
</template>

<script setup>
definePageMeta({
  middleware: "reset-password",
});
import { z } from "zod";
import { toast } from "vue-sonner";

const route = useRouter().currentRoute.value;
const { token } = route.query;
const loading = ref(false);

const state = reactive({
  password: undefined,
  passwordConfirmation: undefined,
});

const schema = z
  .object({
    password: z.string().min(8, "Deve ter pelo menos 8 caracteres"),
    passwordConfirmation: z.string().min(8, "Deve ter pelo menos 8 caracteres"),
  })
  .refine(data => data.password === data.passwordConfirmation, {
    message: "As senhas devem ser iguais",
    path: ["passwordConfirmation"],
  });

async function onSubmit(event) {
  try {
    loading.value = true;
    await $fetch("/api/auth/reset-password", {
      method: "PATCH",
      body: { password: state.password, code: token },
    });
    toast("Senha redefinida", {
      description: "Senha redefinida com sucesso",
    });
    return navigateTo("/auth/login");
  } catch (error) {
    loading.value = false;
    toast.error(`Error: ${error.data.statusMessage}`);
  }
}
</script>
