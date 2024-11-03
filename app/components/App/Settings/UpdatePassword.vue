<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold leading-7 font-display">Segurança</h2>
      </div>
      <p class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
        Suas credenciais são criptografadas e armazenadas de forma segura.
      </p>
    </template>
    <UForm
      class="space-y-6 max-w-lg"
      :schema="schema"
      :state="state"
      @submit="onSubmit"
    >
      <UFormGroup label="Nova senha" size="lg" name="password">
        <UInput
          type="password"
          placeholder="Digite uma nova senha"
          v-model="state.password"
        />
      </UFormGroup>
      <div>
        <UButton
          :loading="loading"
          :disabled="loading"
          type="submit"
          color="black"
          label="Salvar alterações"
          size="lg"
        />
      </div>
    </UForm>
  </UCard>
</template>

<script setup>
import { z } from "zod";
import { toast } from "vue-sonner";

const loading = ref(false);
const schema = z.object({
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
});

const state = ref({
  password: "",
});

async function onSubmit(event) {
  try {
    loading.value = true;
    await $fetch("/api/account/update-password", {
      method: "POST",
      body: event.data,
    });
    toast.success("Senha atualizada com sucesso");
  } catch (error) {
    console.error(error);
    toast.error(
      error.data?.message || "Ocorreu um erro ao atualizar a senha.",
    );
  } finally {
    loading.value = false;
  }
}
</script>
