<template>
  <main class="flex flex-col items-center justify-center h-screen">
    <div class="w-full max-w-sm mx-auto space-y-6">
      <h1 class="font-semibold text-2xl">Entrar</h1>
      <p class="text-sm">
        Digite seu email e senha para acessar sua conta
      </p>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4 max-w-sm"
        @submit="onSubmit"
      >
        <UFormGroup label="E-mail" name="email" size="lg">
          <UInput v-model="state.email" />
        </UFormGroup>
        <UFormGroup label="Senha" name="password" size="lg">
          <UInput v-model="state.password" type="password" />
          <template #hint>
            <UButton
              variant="link"
              :padded="false"
              to="/auth/forgot-password"
              size="xs"
              color="gray"
              >Esqueceu sua senha?</UButton
            >
          </template>
        </UFormGroup>
        <UButton
          :loading="loading"
          color="black"
          type="submit"
          :disabled="loading"
          size="lg"
          block
        >
          Entrar
        </UButton>
      </UForm>
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
import { z } from "zod";
import { toast } from "vue-sonner";

const router = useRouter();
const { fetch: refreshSession } = useUserSession();
const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Must be at least 8 characters"),
});

const state = reactive({
  email: undefined,
  password: undefined,
});

const loading = ref(false);

async function onSubmit(event) {
  try {
    loading.value = true;
    await $fetch("/api/auth/login-with-password", {
      method: "POST",
      body: event.data,
    });
    await refreshSession();
    toast("Entrou com sucesso");
    await router.push("/dashboard/texto-para-fala");
  } catch (error) {
    loading.value = false;
    toast.error(error.data.statusMessage);
  }
}
</script>
