<template>
  <div>
    <UForm
      :schema="passkeySchema"
      :state="state"
      class="space-y-4 max-w-sm"
      @submit="onSubmit"
    >
      <div class="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
        Login via passkey está temporariamente indisponível.
      </div>
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
        Login with fingerprint
      </UButton>
    </UForm>
  </div>
</template>

<script setup>
import { z } from "zod";
import { toast } from "vue-sonner";
import { startAuthentication } from "@simplewebauthn/browser";
const { fetch: refreshSession } = useUserSession();

const passkeySchema = z.object({
  email: z.string().email("Invalid email"),
});

const state = reactive({
  email: undefined,
});

const loading = ref(false);

async function getAuthenticationOptionsJSON(email) {
  const options = await $fetch("/api/auth/passkey/login/create-key", {
    method: "POST",
    body: {
      email,
    },
  });
  return options;
}

async function loginUserWithPasskey(challenge, email, authenticationResponse) {
  const user = await $fetch("/api/auth/passkey/login/login-user", {
    method: "POST",
    body: {
      email,
      challenge,
      authenticationResponse,
    },
  });
  return user;
}

async function onSubmit(event) {
  try {
    loading.value = true;
    const authenticationOptionsJSON = await getAuthenticationOptionsJSON(
      event.data.email,
    );
    const authenticationResponse = await startAuthentication(
      authenticationOptionsJSON,
    );
    await loginUserWithPasskey(
      authenticationOptionsJSON.challenge,
      event.data.email,
      authenticationResponse,
    );
    await refreshSession();
    toast.success("Entrou com sucesso");
    return navigateTo(`/dashboard`);
  } catch (error) {
    console.error(error);
    toast.error(error.data?.statusMessage ?? "Ocorreu um erro ao entrar");
  } finally {
    loading.value = false;
  }
}
</script>
