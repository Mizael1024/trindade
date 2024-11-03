<template>
    <Transition name="fade">
        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full relative">
                <!-- Botão de fechar -->
                <button @click="emit('close')" class="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clip-rule="evenodd" />
                    </svg>
                </button>

                <h2 class="text-xl font-bold text-red-600 mb-2">Atenção: Caracteres Esgotados!</h2>
                <p class="text-gray-700 mb-4">Não perca tempo, continue criando.</p>
                <button @click="handleClick"
                    class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 ease-in-out">
                    Comprar mais caracteres
                </button>
            </div>
        </div>
    </Transition>
</template>

<script setup>
const props = defineProps({
    showModal: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['close'])

const config = useRuntimeConfig();

const handleClick = () => {
    window.location.href = config.public.CREDITS_EXTRA_URL
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
