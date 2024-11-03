<template>
  <UForm
    :schema="passwordSchema"
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
        >
          Esqueceu a senha?
        </UButton>
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
</template>

<script setup>
import { ref, reactive } from "vue";
import { z } from "zod";
import { toast } from "vue-sonner";

const passwordSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Deve ter pelo menos 8 caracteres"),
});

const { fetch: refreshSession } = useUserSession();

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
    navigateTo("/dashboard");
  } catch (error) {
    loading.value = false;
    toast.error(error.data.statusMessage);
  }
}
</script>
