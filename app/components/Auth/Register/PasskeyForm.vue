<template>
  <div>
    <UForm
      :schema="passkeySchema"
      :state="state"
      class="space-y-4 max-w-sm"
      @submit="onSubmit"
    >
      <div class="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
        Autenticação via passkey está temporariamente indisponível.
      </div>
      <UFormGroup label="Name" name="name" size="lg">
        <UInput v-model="state.name" disabled />
      </UFormGroup>
      <UFormGroup label="Email" name="email" size="lg">
        <UInput v-model="state.email" disabled />
      </UFormGroup>
      <UButton
        color="gray"
        type="submit"
        disabled
        size="lg"
        block
      >
        Criar conta
      </UButton>
    </UForm>
  </div>
</template>

<script setup>
import { startRegistration } from "@simplewebauthn/browser";
import { z } from "zod";
import { toast } from "vue-sonner";
const { fetch: refreshSession } = useUserSession();

const passkeySchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(1).max(255),
});

const state = reactive({
  email: undefined,
  name: undefined,
});

const loading = ref(false);

async function getRegistrationOptions(event) {
  const { email, name } = event.data;
  const options = await $fetch("/api/auth/passkey/register/create-key", {
    method: "POST",
    body: {
      email,
      name,
    },
  });
  return options;
}

async function verifyRegistration(registrationResponse, challenge) {
  const verification = await $fetch("/api/auth/passkey/register/verify-key", {
    method: "POST",
    body: {
      credential: registrationResponse,
      challenge,
    },
  });
  return verification;
}

async function registerWithPasskey(event, verification) {
  const { email, name } = event.data;
  const user = await $fetch("/api/auth/passkey/register/create-user", {
    method: "POST",
    body: {
      email,
      name,
      verification,
    },
  });
  return user;
}

async function onSubmit(event) {
  try {
    loading.value = true;
    const creationOptionsJSON = await getRegistrationOptions(event);
    const registrationResponse = await startRegistration(creationOptionsJSON);
    const verificationResponse = await verifyRegistration(
      registrationResponse,
      creationOptionsJSON.challenge,
    );
    await registerWithPasskey(event, verificationResponse);
    toast("Conta criada com passkey");
    await refreshSession();
    return navigateTo(`/dashboard`);
  } catch (error) {
    console.log(error);
    loading.value = false;
    toast.error(error.data.statusMessage ?? "Ocorreu um erro");
  }
}
</script>
