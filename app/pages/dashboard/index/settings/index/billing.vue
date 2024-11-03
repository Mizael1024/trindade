<template>
  <div>
    <p class="text-gray-500 text-sm">
      Visualize e gerencie suas informações de cobrança
    </p>

    <div class="mt-4 space-y-8">
      <AppBillingActiveSubscription
        v-if="data.activeSubscription"
        :subscription="formatSubscriptionData(data.activeSubscription)"
      />
      <AppBillingFreeTrial v-else />
      <AppBillingPlanSelector
        v-if="data.plans && data.plans.length > 0"
        :plans="formatPlansWithPriceIds(data.plans)"
        :active-variant-id="data.activeSubscription?.variantId"
      />
    </div>
  </div>
</template>

<script setup>
const { data, error } = await useFetch("/api/payment/subscription");

const formatPlansWithPriceIds = (plans) => {
  if (!plans) return [];
  
  return plans.map(plan => ({
    ...plan,
    id: plan.variants[0].id,
    variants: plan.variants.map(variant => ({
      ...variant,
      price: Number(variant.price || 0),
      id: variant.id
    }))
  }));
};

const formatSubscriptionData = (subscription) => {
  if (!subscription) return null;
  
  const activePlan = data.value?.plans?.find(plan => 
    plan.variants.some(variant => variant.id === subscription.variantId)
  );
  
  const activeVariant = activePlan?.variants?.find(v => v.id === subscription.variantId);
  
  return {
    ...subscription,
    price: activeVariant?.price || 0,
    interval: activeVariant?.interval || 'month'
  };
};

// Debug
console.log('Planos formatados:', formatPlansWithPriceIds(data.value?.plans));
</script>
