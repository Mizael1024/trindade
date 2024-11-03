<template>
  <div class="p-4 bg-gray-100 dark:bg-white/10 rounded-lg">
    <div class="flex items-center gap-2">
      <p class="text-lg font-semibold">{{ subscription.name }}</p>
      <UBadge :label="subscription.status" color="green" variant="subtle" />
      <span class="flex-1" />
      <UDropdown :items="items">
        <UButton :loading="loading" icon="i-ph-dots-three-vertical" square color="white" size="xs" />
      </UDropdown>
    </div>
    <div class="flex items-start sm:items-center gap-3 mt-6 flex-col sm:flex-row">
      <p class="text-sm">{{ formattedPrice }}/{{ subscription.interval }}</p>
      <span class="h-1 w-1 rounded-full bg-gray-500 hidden sm:block" />
      <p class="text-sm">Próximo pagamento em {{ formattedDate }}</p>
    </div>
  </div>
</template>
<script setup>
import { toast } from "vue-sonner";
import { useDateFormat } from "@vueuse/core";
const props = defineProps({
  subscription: {
    type: Object,
    required: true,
  },
});
const loading = ref(false);
const formattedPrice = computed(() => {
  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  return formatter.format(props.subscription.price / 100);
});

const formattedDate = computed(() => {
  return useDateFormat(
    new Date(props.subscription.nextPaymentDate),
    "DD MMM YY",
  );
});

const items = [
  [
    {
      label: "Gerenciar Cobrança",
      icon: "i-ph-invoice-duotone",
      click: () => manageSubscription("update-plan"),
    },
    {
      label: "Atualizar Dados de Pagamento",
      icon: "i-ph-credit-card-duotone",
      click: () => manageSubscription("update-payment-info"),
    },
    {
      label: "Cancelar Assinatura",
      icon: "i-ph-receipt-x-duotone",
      click: () => manageSubscription("cancel"),
    },
  ],
];

async function manageSubscription(flow) {
  try {
    loading.value = true;
    const billingPortalLink = await $fetch("/api/payment/billing-portal-link", {
      query: { flow },
    });
    window.location.href = billingPortalLink;
  } catch (error) {
    loading.value = false;
    toast.error("Erro ao criar link de cobrança");
  }
}
</script>
