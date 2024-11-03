<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormGroup label="Name" name="name" size="lg">
      <UInput v-model="state.name" />
    </UFormGroup>
    <UFormGroup label="Email" name="email" size="lg">
      <UInput v-model="state.email" />
    </UFormGroup>
    <UFormGroup label="Password" name="password" size="lg">
      <UInput v-model="state.password" type="password" />
    </UFormGroup>
    <UButton
      block
      color="black"
      type="submit"
      size="lg"
      :loading="loading"
      :disabled="loading"
    >
      Criar conta
    </UButton>
  </UForm>
</template>

<script setup>
import { z } from "zod";
import { toast } from "vue-sonner";

const loading = ref(false);
const schema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Deve ter pelo menos 8 caracteres"),
});

const state = reactive({
  name: undefined,
  email: undefined,
  password: undefined,
});

async function onSubmit(event) {
  try {
    loading.value = true;
    await $fetch("/api/auth/register", { method: "POST", body: event.data });
    toast.success("Conta criada com sucesso");
    return navigateTo(
      `/auth/verify-otp?email=${encodeURIComponent(state.email)}&type=SIGNUP`,
      { replace: true }
    );
  } catch (error) {
    loading.value = false;
    
    const errorMessage = error.data?.statusMessage || 
      (error.data?.data?.message) || 
      "Ocorreu um erro ao criar sua conta. Por favor, tente novamente.";
    
    toast.error(errorMessage);
    console.error("Erro no registro:", error);
  }
}
</script>
