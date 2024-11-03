<template>
  <div v-if="displayedVariants && displayedVariants.length">
    <div class="flex items-center justify-between">
      <p>Upgrade</p>
      <UTabs v-model="selectedInterval" :items="intervals" />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 mt-4 gap-4">
      <div v-for="plan in displayedVariants" :key="plan.id"
        class="p-4 border border-gray-200 dark:border-white/10 rounded-lg flex flex-col gap-4">
        <p class="text-lx font-semibold text-primary-500">{{ plan.name }}</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ plan.description }}
        </p>
        <p class="mt-auto text-xl font-bold">
          {{ formatPrice(plan.price) }}/{{ plan.interval }}
        </p>
        <AppBillingCheckoutButton :variant-id="plan.id" :label="plan.isActive ? 'Plano atual' : 'Assinar'"
          :is-active="plan.isActive" />
      </div>
    </div>
  </div>
  <div v-else>
    <p>Carregando planos disponíveis...</p>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";

const props = defineProps({
  plans: {
    type: Array,
    required: true,
  },
  activeVariantId: {
    type: String,
    required: false,
  },
});

const formatPrice = price => {
  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  return formatter.format(price / 100);
};

const selectedInterval = ref(0);
const intervals = [{ label: "Mensal" }, { label: "Anual" }];

const computeVariants = interval => {
  if (!props.plans) return [];
  
  return props.plans
    .filter(plan => plan && plan.variants)
    .map(plan => {
      const variants = Array.isArray(plan.variants) ? plan.variants : [];
      const variant = variants.find(v => v && v.interval === interval);
      
      if (!variant) return null;
      
      return {
        id: plan.id || '',
        name: plan.name || '',
        description: plan.description || '',
        price: variant.price || 0,
        interval: variant.interval || '',
        isActive: props.activeVariantId ? variant.id === props.activeVariantId : false,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a.price || 0) - (b.price || 0));
};

const monthlyVariants = computed(() => computeVariants("month"));
const yearlyVariants = computed(() => computeVariants("year"));

const displayedVariants = computed(() => {
  return selectedInterval.value === 0
    ? monthlyVariants.value
    : yearlyVariants.value;
});

onMounted(() => {
  if (props.activeVariantId) {
    const activeVariant = props.plans
      .flatMap(plan => plan.variants)
      .find(variant => variant.id === props.activeVariantId);

    if (activeVariant) {
      selectedInterval.value = activeVariant.interval === "year" ? 1 : 0;
    }
  }
});
</script>