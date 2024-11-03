<script setup>
import { toast } from "vue-sonner";
import { z } from "zod";
const loading = ref(false);
const schema = z.object({
  email: z.string().email("E-mail inválido"),
});

const state = reactive({
  email: undefined,
});

async function onSubmit(event) {
  try {
    loading.value = true;
    await $fetch("/api/waitlist", {
      method: "POST",
      body: { email: event.data.email },
    });
    toast.success("Você foi adicionado à lista de espera");
  } catch (error) {
    console.error(error);
    toast.error(error.data?.statusMessage ?? "Ocorreu um erro");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="space-y-4 w-full sm:w-96"
    @submit="onSubmit"
  >
    <UFormGroup name="email" size="lg">
      <UInput v-model="state.email" placeholder="Email" type="email" />
    </UFormGroup>
    <UButton
      :loading="loading"
      color="black"
      type="submit"
      :disabled="loading"
      size="lg"
      block
      label="Entrar na lista de espera"
    />
  </UForm>
</template>
