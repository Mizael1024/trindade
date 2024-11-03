<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-xl' }">
    <div class="p-6">
      <h2 class="text-2xl font-semibold mb-6">Comprar Créditos</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="pack in packages" :key="pack.id" 
          class="border rounded-xl p-4 hover:border-blue-500 cursor-pointer transition-all"
          :class="{ 'border-blue-500 bg-blue-50 dark:bg-blue-900': selectedPackage?.id === pack.id }"
          @click="selectPackage(pack)">
          <h3 class="font-semibold text-lg">{{ pack.name }}</h3>
          <p class="text-2xl font-bold my-2">R$ {{ pack.price }}</p>
          <p class="text-gray-600 dark:text-gray-300 text-sm">{{ pack.description }}</p>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <UButton color="gray" variant="soft" @click="close">Cancelar</UButton>
        <UButton 
          color="primary" 
          :loading="isLoading"
          :disabled="!selectedPackage || isLoading"
          @click="handlePurchase">
          Comprar Agora
        </UButton>
      </div>
    </div>
  </UModal>
</template>

<script setup>
const packages = [
  {
    id: 'EXTRA_10K',
    name: '10.000 Caracteres',
    price: '19,90',
    description: 'Ideal para projetos pequenos'
  },
  {
    id: 'EXTRA_30K',
    name: '30.000 Caracteres',
    price: '49,90',
    description: 'Melhor custo-benefício'
  },
  {
    id: 'EXTRA_100K',
    name: '100.000 Caracteres',
    price: '149,90',
    description: 'Para uso intensivo'
  }
]

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])
const selectedPackage = ref(null)
const isLoading = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const selectPackage = (pack) => {
  selectedPackage.value = pack
}

const handlePurchase = async () => {
  if (!selectedPackage.value) return
  
  isLoading.value = true
  try {
    const response = await $fetch('/api/payment/credit-packages/checkout', {
      method: 'POST',
      body: {
        packageId: selectedPackage.value.id,
        redirectUrl: window.location.origin + '/dashboard'
      }
    })
    
    window.location.href = response
  } catch (error) {
    console.error('Erro ao processar pagamento:', error)
  } finally {
    isLoading.value = false
  }
}

const close = () => {
  isOpen.value = false
  selectedPackage.value = null
}
</script>
