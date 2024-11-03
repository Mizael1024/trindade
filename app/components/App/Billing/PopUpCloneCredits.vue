<template>
  <UModal :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)">
    <div class="p-6">
      <h2 class="text-xl font-semibold mb-4">Comprar Créditos de Clone de Voz</h2>
      <p class="text-gray-600 dark:text-gray-300 mb-4">
        Para criar um clone de voz, você precisa ter créditos disponíveis.
      </p>

      <div class="space-y-4">
        <!-- Clone Individual -->
        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 class="font-medium mb-2">Clone Individual</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">1 Clone de Voz</p>
          <div class="flex justify-between items-center">
            <span class="text-lg font-semibold">R$ 29,90</span>
            <UButton color="black" :loading="isLoading === 'CLONE_1'" @click="handleCheckout('CLONE_1')">
              Comprar Agora
            </UButton>
          </div>
        </div>

        <!-- Pacote 3 Clones -->
        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 class="font-medium mb-2">Pacote 3 Clones</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">3 Clones de Voz</p>
          <div class="flex justify-between items-center">
            <div>
              <span class="text-lg font-semibold">R$ 79,90</span>
              <span class="text-sm text-green-600 ml-2">Economia de 11%</span>
            </div>
            <UButton color="black" :loading="isLoading === 'CLONE_3'" @click="handleCheckout('CLONE_3')">
              Comprar Agora
            </UButton>
          </div>
        </div>

        <!-- Pacote 5 Clones -->
        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-500">
          <div class="absolute -top-3 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
            Mais Popular
          </div>
          <h3 class="font-medium mb-2">Pacote 5 Clones</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">5 Clones de Voz</p>
          <div class="flex justify-between items-center">
            <div>
              <span class="text-lg font-semibold">R$ 119,90</span>
              <span class="text-sm text-green-600 ml-2">Economia de 20%</span>
            </div>
            <UButton color="blue" :loading="isLoading === 'CLONE_5'" @click="handleCheckout('CLONE_5')">
              Comprar Agora
            </UButton>
          </div>
        </div>
      </div>

      <div class="mt-6 text-center">
        <button @click="$emit('update:modelValue', false)" class="text-sm text-gray-500 hover:text-gray-700">
          Cancelar
        </button>
      </div>
    </div>
  </UModal>
</template>

<script setup>
import { ref } from 'vue'
const { user } = useUserSession()

const isLoading = ref(null)

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const handleCheckout = async (packageId) => {
  try {
    isLoading.value = packageId
    
    const response = await $fetch('/api/payment/voice-clone/checkout', {
      method: 'POST',
      body: {
        packageId,
        redirectUrl: `${window.location.origin}/dashboard?success=true`
      }
    })
    
    if (response?.url) {
      window.location.href = response.url
    }
  } catch (error) {
    console.error('Erro ao criar checkout:', error)
    alert('Erro ao processar pagamento. Tente novamente.')
  } finally {
    isLoading.value = null
  }
}
</script>
  