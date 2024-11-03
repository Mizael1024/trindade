<template>
  <div class="p-6">
    <p class="text-lg font-semibold">Criar um novo usuário</p>
    <UForm
      :schema="schema"
      :state="state"
      class="space-y-4 mt-6"
      @submit="onSubmit"
    >
      <UFormGroup label="Nome" name="name" size="lg">
        <UInput v-model="state.name" />
      </UFormGroup>
      <UFormGroup label="Email" name="email" size="lg">
        <UInput v-model="state.email" />
      </UFormGroup>
      <UFormGroup label="Senha" name="password" size="lg">
        <UInput v-model="state.password" type="password" />
      </UFormGroup>
      <UFormGroup
        name="emailVerified"
        size="lg"
        :help="`A confirmation email will ${state.emailVerified ? 'not' : ''} be sent to the user`"
      >
        <UCheckbox label="Verificar automaticamente o usuário?" v-model="state.emailVerified" />
      </UFormGroup>
      <UButton
        block
        color="black"
        type="submit"
        size="lg"
        :loading="loading"
        :disabled="loading"
      >
        Criar usuário
      </UButton>
    </UForm>
  </div>
</template>

<script setup>
import { z } from "zod";
import { toast } from "vue-sonner";
const emit = defineEmits(["close"]);

const loading = ref(false);
const schema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Deve ter pelo menos 8 caracteres"),
  emailVerified: z.boolean().optional(),
});

const state = reactive({
  name: undefined,
  email: undefined,
  password: undefined,
  emailVerified: true,
});

async function onSubmit(event) {
  try {
    loading.value = true;
    await $fetch("/api/admin/users", { method: "POST", body: event.data });
    toast.success("Usuário criado com sucesso");
    loading.value = false;
    emit("close");
  } catch (error) {
    loading.value = false;
    if (error.data && error.data.data && error.data.data.name === "ZodError") {
      const issues = error.data.data.issues
        .map(issue => {
          const path = issue.path.join(".");
          return `Invalid ${path}: ${issue.message}`;
        })
        .join("\n");
      console.log(issues);
    }
    toast.error(
      error.data ? error.data.statusMessage : "Ocorreu um erro desconhecido",
    );
  } finally {
    loading.value = false;
  }
}
</script>
